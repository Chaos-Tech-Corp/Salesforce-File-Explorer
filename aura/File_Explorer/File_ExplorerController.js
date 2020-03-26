({
    initialize : function(component, event, helper) {
        //load permissions
        var action = component.get("c.getPermissions");
        action.setCallback(this, function(response) {
            var result = response.getState();
            if (result === "SUCCESS") {
                var settings = response.getReturnValue();
                if (settings.CanAccessWorkspace) {
                    helper.showNodeItems(component, '');
                }
                component.set("v.Settings", settings);
            } else {
                component.find('notifLib').showNotice({
                    "variant": "error",
                    "header": "Something has gone wrong!",
                    "message": "Unfortunately, cannot load the user permissions."
                });
            }
            
        });
        $A.enqueueAction(action);
    },
    
    handlePathChange : function(component, event, helper) {
        var path = [];
        if (event.getParam("append") == true) {
            //append the entry to the current path
            path = component.get("v.Path");
            path.push({id: event.getParam("id"), title: event.getParam("title")});
        } else {
            //replace the entire path
            path = event.getParam("path");
        }
        var folderId = path[path.length - 1].id;
        component.set("v.Path", path);
        component.set("v.FolderId", folderId);
        component.set("v.FolderName", path[path.length - 1].title);
        helper.loadPermissions(component, path);
        helper.highlightTreeNode(component, folderId);
        //component.find("treeView").FolderChange(folderId);
        helper.showNodeItems(component, folderId);
    },
    
    handleSelectNode : function(component, event, helper) {
        var path = component.get("v.Path"),
            folderId = event.target.dataset.id;
        //update the path to reflect the change
        for(var i = 0; i< path.length; i++) {
            if (path[i].id == folderId) {
                path.splice(i+1,path.length - i - 1);
                break;
            }
        }
        component.set("v.Path", path);
        component.set("v.FolderId", folderId);
        component.set("v.FolderName", path[path.length - 1].title);
        helper.highlightTreeNode(component, folderId);
        //component.find("treeView").FolderChange(folderId);
        helper.showNodeItems(component, folderId);
    },
    
    /*handleNodeExpand : function(component, event, helper) {
        var path = component.get("v.Path");
        if (path.length > 0) {
            helper.highlightTreeNode(component, path[path.length - 1].id);
        }
    },*/
    
    handleNewLibrary : function(component, event, helper) {
        component.set("v.ShowNewType","Library");
        component.set("v.ShowNewLibrary", true);
    },
    
    handleNewFolder : function(component, event, helper) {
        component.set("v.ShowNewType","Folder");
        component.set("v.ShowNewLibrary", true);
    },
    
    handleAddFiles : function(component, event, helper) {
        component.set("v.ShowAddFiles", true);
    },
    
    handleManageMember : function(component, event, helper) {
        var contentWorkspaceID = component.get("v.FolderSettings").ContentWorkspaceId;
        component.find("cmpManageMembers").Initialize(contentWorkspaceID);
    },
    
    refreshFolder: function(component, event, helper) {
        var path = component.get("v.Path", path),
        	folderId = path[path.length - 1].id;
        helper.highlightTreeNode(component, folderId);
        helper.showNodeItems(component, folderId);
    }
    
})