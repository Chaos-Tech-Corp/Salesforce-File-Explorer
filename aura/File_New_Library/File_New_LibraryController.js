({
    handleCloseLibrary : function(component, event, helper) {
        component.set("v.folderName","");
        component.set("v.display", false);
    },
    
    handleSaveLibrary : function(component, event, helper) {
        var folderName = component.get("v.folderName"),
            type = component.get("v.type"),
            folderId = component.get("v.folderId"),
            action = component.get("c.createFolder");
        action.setParams({"folderId": folderId, "folderName": folderName, "folderType": type });
        action.setCallback(this, function(response) {
            var result = response.getState();
            if (result === "SUCCESS") {
                component.find('notifLib').showToast({
                    "variant": "success",
                    "title": type + " Created!",
                    "message": "The " + type + " " + folderName + " has been created."
                });
                component.set("v.folderName","");
                var appEvent = $A.get("e.c:File_Folder_Created");
                window.setTimeout(function() { 
                try {
                	appEvent.setParams({"folderId": folderId});
                	appEvent.fire();
                } catch (err) {
                    debugger;
                    console.log(err);
                }
                },100);
            } else {
                component.find('notifLib').showToast({
                    "variant": "error",
                    "title": "Error creating " + type + "!",
                    "message": "Unfortunately, couldn't create the " + type + "."
                });
            }
        });
        $A.enqueueAction(action);
        component.set("v.display", false);
    }
})