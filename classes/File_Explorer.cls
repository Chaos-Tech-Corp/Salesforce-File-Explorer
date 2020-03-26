public with sharing class File_Explorer {
    
    @AuraEnabled
    public static PermissionSettings getPermissions() {
        
        PermissionSettings settings = new PermissionSettings();
        
        settings.CanCreateWorkspace = Schema.sObjectType.ContentWorkspace.isCreateable();
        settings.CanAccessWorkspace = Schema.sObjectType.ContentWorkspace.isAccessible();
        
        
        return settings;
    }
    
    @AuraEnabled
    public static FolderPermissions getFolderPermissions(string FolderId) {
        Id userId = UserInfo.getUserId();


        //Declaring a Set as we don't want Duplicate Group Ids
        Set<Id> results = new Set<Id>();
        ///Declaring a Map for Group with Role
        Map<Id,Id> grRoleMap = new Map<Id,Id>();
        //Populating the Map with RelatedID(i.e.UserRoledId) as Key
        for(Group gr : [select id, relatedid, name from Group]) {
            grRoleMap.put(gr.relatedId,gr.id);
        }
        //Groups directly associated to user
        //Set<Id> groupwithUser = new Set<Id>();
        //Populating the Group with User with GroupId we are filtering only for Group of Type Regular,Role and RoleAndSubordinates
        for(GroupMember u : [select groupId from GroupMember where UserOrGroupId=:userId and (Group.Type = 'Regular' OR Group.Type='Role' OR Group.Type='RoleAndSubordinates')]) {
            //groupwithUser.add(u.groupId);
            results.add(u.groupId);
        }
        //Groups with Role
        for(User u : [select UserRoleId from User where id=:userId]) {
            //Checking if the current User Role is part of Map or not
            if(grRoleMap.containsKey(u.UserRoleId)) {
                results.add(grRoleMap.get(u.UserRoleId));
            }
        } 
        //Combining both the Set
        //results.addAll(groupwithUser);
        //Traversing the whole list of Groups to check any other nested Group
        Map<Id,Id> grMap = new Map<Id,Id>();
        for(GroupMember gr : [select id,UserOrGroupId,Groupid from GroupMember where (Group.Type = 'Regular' OR Group.Type='Role' OR Group.Type='RoleAndSubordinates')]) {
            grMap.put(gr.UserOrGroupId,gr.Groupid);
        } 
        for(Id i :results) {
            if(grMap.containsKey(i)) {
                results.add(grMap.get(i));
            }
        }
        
        //Add the user to the result
        results.Add(userId);
        //Find the WorkspaceId from the ContentFolderId
        ContentFolderItem folderItem = [SELECT Id, Title FROM ContentFolderItem WHERE Id = :FolderId LIMIT 1];
        
        List<ContentWorkspaceMember> members = [SELECT ContentWorkspaceId, ContentWorkspacePermissionId, ContentWorkspacePermission.Name, ContentWorkspacePermission.Type, ContentWorkspacePermission.PermissionsManageWorkspace, ContentWorkspacePermission.PermissionsOrganizeFileAndFolder, ContentWorkspacePermission.PermissionsAddContent, ContentWorkspacePermission.PermissionsDeleteContent, MemberId, MemberType
                                                FROM ContentWorkspaceMember
                                                WHERE MemberId in :results AND ContentWorkspaceId = :folderItem.Title];
        
        FolderPermissions settings = new FolderPermissions();
        for(ContentWorkspaceMember m : members) {
            system.debug(m.ContentWorkspacePermission);
            settings.CanCreateFolder =  settings.CanCreateFolder || m.ContentWorkspacePermission.PermissionsOrganizeFileAndFolder || m.ContentWorkspacePermission.Type == 'Admin';
            settings.CanAddFiles =  settings.CanAddFiles || m.ContentWorkspacePermission.PermissionsAddContent || m.ContentWorkspacePermission.Type == 'Admin' || m.ContentWorkspacePermission.Type == 'Author';
            settings.CanDelete =  settings.CanDelete || m.ContentWorkspacePermission.PermissionsDeleteContent || m.ContentWorkspacePermission.Type == 'Admin';
            settings.CanManageMember =  settings.CanManageMember || m.ContentWorkspacePermission.PermissionsManageWorkspace || m.ContentWorkspacePermission.Type == 'Admin';
        }
        settings.ContentWorkspaceId = folderItem.Title;
            
        return settings;
    }
    
    @AuraEnabled
    public static List<ContentWorkspaceMember> getFolderMembers(string folderId) {
        //Find the WorkspaceId from the ContentFolderId
        //ContentFolderItem folderItem = [SELECT Id, Title FROM ContentFolderItem WHERE Id = :folderId LIMIT 1];
        //ContentWorkspaceId = :folderItem.Title
        return [SELECT ContentWorkspacePermission.Name, ContentWorkspacePermission.Type, MemberId, MemberType, Member.Name FROM ContentWorkspaceMember WHERE ContentWorkspaceId = :folderId];
    }
    
    @AuraEnabled
    public static List<ContentFolder> getNodes() {
		return [SELECT Id, Name, ParentContentFolderId FROM ContentFolder WHERE ParentContentFolderId != null];
    }

    @AuraEnabled
    public static List<ContentFolder> getAllNodes() {
        List<ContentFolder> nodes = [SELECT Id, Name, ParentContentFolderId FROM ContentFolder ORDER BY Name];
        List<ContentWorkspace> spaces = [SELECT Id, Name FROM ContentWorkspace];
        Integer i = 0;
        while( i < nodes.size() ){
            if (nodes[i].ParentContentFolderId == null) {
                Boolean found = false;
                for(ContentWorkspace space : spaces) {
                    if (space.Id == nodes[i].Name)  {
                        nodes[i].Name = space.Name;
                        found = true;
                        break;
                    }
                }
                if (found) {
                	i++;
                } else {
                    nodes.remove(i);
                }
            } else {
            	i++;
            }
        }
        /*for(ContentFolder node : nodes) {
            if (node.ParentContentFolderId == null) {
                for(ContentWorkspace space : spaces) {
                    if (space.Id == node.Name)  {
                        node.Name = space.Name;
                        break;
                    }
                }
            }
        }*/
        return nodes;
    }
    
    @AuraEnabled
    public static List<FolderItem> loadNode(string folderId) {
        
        List<FolderItem> nodeItems = new List<FolderItem>();
        
        //if id is null, it's the root folder
        if(folderId == '') {
            List<ContentWorkspace> folderItems = [SELECT Id, Name, RootContentFolderId FROM ContentWorkspace 
                                                  WHERE RootContentFolderId != null ORDER BY Name];
            
            //add the folders
            for(ContentWorkspace item : folderItems) {
                nodeItems.add(new FolderItem(item.RootContentFolderId, item.Name, true, null, null, null, null));
            }
        } else {
            List<ContentFolderItem> folderItems = [SELECT Id, Title
                                                   FROM ContentFolderItem 
                                                   WHERE IsFolder = true AND ParentContentFolderId = :folderId ORDER BY Title];
            
            //add the folders
            for(ContentFolderItem item : folderItems) {
                nodeItems.add(new FolderItem(item.Id, item.Title, true, null, null, null, null));
            }
        }
        
        
        List<ContentFolderMember> folderMembers = [SELECT ChildRecordId, ChildRecord.Title, ChildRecord.ContentModifiedDate, ChildRecord.ContentSize, ChildRecord.FileExtension, ChildRecord.FileType //, ChildRecord.LastViewedDate --> optional for the future?
                                                   FROM ContentFolderMember 
                                                   WHERE ParentContentFolderId = :folderId ORDER BY ChildRecord.Title];
        
        //add the files
        for(ContentFolderMember item : folderMembers) {
            nodeItems.add(new FolderItem(
                item.ChildRecordId, 
                item.ChildRecord.Title,
                false,
                item.ChildRecord.FileType,
                item.ChildRecord.FileExtension,
                item.ChildRecord.ContentModifiedDate, // - TODO - Get las Modified Date
                item.ChildRecord.ContentSize
            ));
        }
        
        return nodeItems;
    }
    
    @AuraEnabled
    public static string createFolder(string folderId, string folderType, string folderName) {
        if (folderId == null || folderId == '' || folderType == 'Library') {
            //check user permissions to create new library/workspace
            if (Schema.sObjectType.ContentWorkspace.IsCreateable()) {
                ContentWorkspace newFolder = new ContentWorkspace();
                newFolder.Name = folderName.replaceAll('[^a-zA-Z0-9 ]', '_'); //NO need to replace white spaces //.replaceAll('[ ]','_');
                insert newFolder; return newFolder.Id;
            }
        } else {
            ContentFolder[] folders = [SELECT Id, UserRecordAccess.HasEditAccess FROM ContentFolder WHERE Id = :folderId];
            if (folders.size() > 0 && folders[0].UserRecordAccess.HasEditAccess) {
                if (Schema.sObjectType.ContentFolder.IsCreateable()) {
                    ContentFolder newFolder = new ContentFolder();
                    newFolder.Name = folderName.replaceAll('[^a-zA-Z0-9 ]', '_');
                    newFolder.ParentContentFolderId = folderId;
                    insert newFolder; return newFolder.Id;
                }
            }
        }
        return null;
    }
    
    @AuraEnabled
    public static boolean renameNode(string folderId, string folderName) {
        if (Schema.sObjectType.ContentFolder.isUpdateable() && Schema.sObjectType.ContentFolder.fields.Name.isUpdateable()) {
            ContentFolder[] folders = [SELECT Id, UserRecordAccess.HasEditAccess FROM ContentFolder WHERE Id = :folderId];
            if (folders.size() > 0 && folders[0].UserRecordAccess.HasEditAccess) {
                folders[0].Name = folderName;
                update folders[0];
                return true;
            }
        }
        return false;
    }
    
    @AuraEnabled
    public static boolean deleteNode(string folderId) {
        if (Schema.sObjectType.ContentFolder.isDeletable()) {
            ContentFolder[] folders = [SELECT Id, UserRecordAccess.HasDeleteAccess FROM ContentFolder WHERE Id = :folderId];
            if (folders.size() > 0 && folders[0].UserRecordAccess.HasDeleteAccess) {
                delete folders[0];
                return true;
            }
        }
        return false;
    }
    
    @AuraEnabled
    public static void addFilesToNode(string folderId, string[] fileIds) {
        for(string id : fileIds) {
            ContentFolderMember cfm = [SELECT Id, ChildRecordId, ParentContentFolderId FROM ContentFolderMember WHERE ChildRecordId = :id LIMIT 1];
            cfm.ParentContentFolderId = folderId;
            update cfm;
        }
        
    }
    
    public class FolderItem {
        
        public FolderItem(Id Id, String Title, Boolean IsFolder, String FileType, String FileExtension, DateTime ContentModifiedDate, Decimal ContentSize) {
            this.Id = Id;
            this.Title = Title;
            this.IsFolder = IsFolder;
            this.FileType = FileType;
            this.FileExtension = FileExtension;
            this.ContentModifiedDate = ContentModifiedDate;
            this.ContentSize = ContentSize;
        }
        
        @AuraEnabled
        public Id Id;
        @AuraEnabled
        public String Title;
        @AuraEnabled
        public Boolean IsFolder;
        @AuraEnabled
        public Boolean HasChildren;
        @AuraEnabled
        public String FileType;
        @AuraEnabled
        public String FileExtension;
        @AuraEnabled
        public DateTime ContentModifiedDate;
        @AuraEnabled
        public Decimal ContentSize;
    }
    
    public class PermissionSettings {
        @AuraEnabled
        public Boolean CanCreateWorkspace;
        @AuraEnabled
        public Boolean CanAccessWorkspace;
    }
    
    public class FolderPermissions {
        @AuraEnabled
        public String ContentWorkspaceId;
        @AuraEnabled
        public Boolean CanCreateFolder = false;
        @AuraEnabled
        public Boolean CanAddFiles = false;
        @AuraEnabled
        public Boolean CanManageMember = false;
        @AuraEnabled
        public Boolean CanDelete = false;
    }
}
