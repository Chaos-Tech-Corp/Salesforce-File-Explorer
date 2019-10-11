({
    handleCancelClick : function(component, event, helper) {
        component.destroy();
    },
    
    handleCreateClick : function(component, event, helper) {
        debugger;
        var folderId = component.get("v.folderId");
        var folderName = component.get("v.folderName");
        var existingId = component.get("v.existingId");
        
        if (folderName == null || folderName.trim().length < 1) {
            var inputCmp = component.find("newFolderName");
            inputCmp.setCustomValidity("This field is required.");
            inputCmp.reportValidity();
            return;
        }
        
        let actionName = 'c.createNode';
        if (existingId != null) {
            //rename instead
            actionName = 'c.renameNode';
            folderId = existingId;
        }
        
        var action = component.get(actionName);
        action.setParams({"folderId": folderId,"folderName": folderName});
        action.setCallback(this, function(response) {
            var state = response.getState();
            debugger;
            if (state === "SUCCESS") {
                
                component.find('notifLib').showToast({
                    "variant": "success",
                    "message": "Folder " + (actionName == 'c.createNode' ? "Created" : "Renamed" ) + "!"
                });
                
                var compEvent = $A.get("e.c:expand_node");
                compEvent.setParams({"nodeId": null, "path": null, "append": false });
                compEvent.fire();
                component.destroy();
            } else {
                //...do something here
                component.find('notifLib').showToast({
                    "variant": "error",
                    "message": "There was a problem " + (actionName == 'c.createNode' ? "creating" : "renaming" ) + " the folder."
                });
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        console.log("Error message: " +
                                    errors[0].message);
                    }
                } else {
                    console.log("Unknown error");
                }
            }
        });
        $A.enqueueAction(action);
    }
})