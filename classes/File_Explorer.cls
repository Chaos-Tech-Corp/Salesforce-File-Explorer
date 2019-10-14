public with sharing class File_Explorer {
    
    @AuraEnabled
    public static List<ContentWorkspace> loadRoot() {
        
        List<ContentWorkspace> spaces = [SELECT Id, Name, RootContentFolderId FROM ContentWorkspace WHERE RootContentFolderId != null];
        
        Set<Id> ids = new Set<Id>();
        for(ContentWorkspace space : spaces) {
            ids.add(space.RootContentFolderId );
        }
        
        List<AggregateResult> children = [SELECT ParentContentFolderId FROM ContentFolderItem WHERE ParentContentFolderId IN :ids GROUP BY ParentContentFolderId];
        ids = new Set<Id>();
        for(AggregateResult aggr:children){             
            ids.add((Id)aggr.get('ParentContentFolderId'));
        } 
        
        for(ContentWorkspace space : spaces) {
            for (Id i:  ids) {
                if (space.RootContentFolderId  == i) {
                    space.Description = 'children';
                }
            }
        }
        
        return spaces;
    }
    
    @AuraEnabled
    public static List<FolderItem> loadNode(string id) {
        
        List<FolderItem> items = new List<FolderItem>();
        
        if (id.indexOf(':')>0) {
            id = id.substring(id.lastIndexOf(':')+1);
        }
        
        List<ContentFolderItem> spaces = [SELECT Id, Title, IsFolder FROM ContentFolderItem WHERE ParentContentFolderId = :id ORDER BY IsFolder DESC, Title ASC];
        
        Set<Id> ids = new Set<Id>();
        for(ContentFolderItem space: spaces) {
            if (space.IsFolder){
                FolderItem item = new FolderItem();
                item.Id = space.Id;
                item.Title = space.Title;
                item.IsFolder = space.IsFolder;
                items.add(item);
            } else {
                ids.Add(space.Id);
            }
        }
        List<ContentDocument> docs = [SELECT Id, FileType, Title, FileExtension, ContentSize, ContentModifiedDate, LatestPublishedVersion.ContentUrl FROM Contentdocument WHERE Id IN :ids ORDER BY Title ASC];
        for(ContentDocument doc: docs) {
            FolderItem item = new FolderItem();
            item.Id = doc.Id;
            item.IsFolder = false;
            item.FileType = doc.Filetype;
            item.Title = doc.Title;
            item.FileExtension = doc.FileExtension;
            item.ContentSize = doc.ContentSize;
            item.ContentModifiedDate = doc.ContentModifiedDate;
            items.add(item);
        }
        
        return items;
    }
    
    @AuraEnabled
    public static List<FolderDescription> expandNode(string id) {
        
        if (id.indexOf(':')>0) {
            id = id.substring(id.lastIndexOf(':')+1);
        }
        
        List<ContentFolderItem> spaces = [SELECT Id, Title FROM ContentFolderItem WHERE ParentContentFolderId = :id AND IsFolder = true ORDER BY Title ASC];
        
        Set<Id> ids = new Set<Id>();
        for(ContentFolderItem space : spaces) {
            ids.add(space.Id );
        }
        
        List<AggregateResult> children = [SELECT ParentContentFolderId FROM ContentFolderItem WHERE ParentContentFolderId IN :ids AND IsFolder = true GROUP BY ParentContentFolderId];
        ids = new Set<Id>();
        for(AggregateResult aggr:children){             
            ids.add((Id)aggr.get('ParentContentFolderId'));
        } 
        
        List<FolderDescription> result = new List<FolderDescription>();
        for(ContentFolderItem space : spaces) {
            FolderDescription descr = new FolderDescription();
            descr.Name = space.Title;
            descr.RootContentFolderId = space.Id;
            for (Id i:  ids) {
                if (space.Id  == i) {
                    descr.Description = 'children';
                }
            }
            result.add(descr);
        }
        
        return result;
    }
    
    @AuraEnabled
    public static string createNode(string folderId, string folderName) {
        if (folderId == null) {
            if (Schema.sObjectType.ContentWorkspace.IsCreateable()) {
                ContentWorkspace newFolder = new ContentWorkspace();
                newFolder.Name = folderName.replaceAll('[^a-zA-Z0-9 ]', '').replaceAll('[ ]','_');
                insert newFolder; return newFolder.Id;
            }
        } else {
            if (Schema.sObjectType.ContentFolder.IsCreateable()) {
                ContentFolder newFolder = new ContentFolder();
                newFolder.Name = folderName;
                newFolder.ParentContentFolderId = folderId;
                insert newFolder; return newFolder.Id;
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
    public static void deleteFile(string fileId) {
        if (Schema.sObjectType.ContentDocument.isDeletable()) {
            ContentDocument file = new ContentDocument(); file.Id = fileId; delete file;
        }
    }
    
    @AuraEnabled
    public static void addFilesToNode(string folderId, string[] fileIds) {
        
        for(string id : fileIds) {
            ContentFolderMember cfm = [SELECT Id, ChildRecordId, ParentContentFolderId FROM ContentFolderMember WHERE ChildRecordId = :id LIMIT 1]; cfm.ParentContentFolderId = folderId; update cfm;
        }
        
    }
    
    @AuraEnabled
    public static string findLibraryId(string folderId) {
        ContentFolder folder = [select Id, Name from ContentFolder Where Id = :folderId  LIMIT 1];
        return folder.Name;
    }
    
    
    
    public class FolderDescription {
        @AuraEnabled
        public Id RootContentFolderId;
        @AuraEnabled
        public String Name;
        @AuraEnabled
        public String Description;
    }
    
    public class FolderItem {
        @AuraEnabled
        public Id Id;
        @AuraEnabled
        public String Title;
        @AuraEnabled
        public Boolean IsFolder;
        @AuraEnabled
        public String FileType;
        @AuraEnabled
        public String FileExtension;
        @AuraEnabled
        public DateTime ContentModifiedDate;
        @AuraEnabled
        public Decimal ContentSize;
    }
}
