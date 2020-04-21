({
    handleFolderClick : function(component, event, helper) {
        var pathEvent = component.getEvent("pathChangeEvent");
        pathEvent.setParams({"id" : event.target.dataset.id, "title": event.target.dataset.title, "append": true });
        pathEvent.fire();
    },
    
    handleDoubleClick : function(component, event, helper) {
        var component_target = event.currentTarget;
        var docId = component_target.dataset.id,
            isFolder = component_target.dataset.folder,
            docName = component_target.dataset.name;
        if (isFolder == 'true') {
            var compEvent = $A.get("e.c:expand_node");
            compEvent.setParams({"nodeId": docId, "path": docId, "name": docName, "append": true });
            compEvent.fire();
        } else {
            $A.get('e.lightning:openFiles').fire({
                recordIds: [docId]
            });
        }
    },
    
    handleFolderMenuClick : function (cmp, event, helper) {
        
        var values = event.getParam("value").split(':');
        
        if (values[0] == 'R') {
            
            $A.createComponent("c:New_Folder", {"existingId":values[1], "folderName":values[2], "dialogTitle":"Rename Folder"}, function(component, status, errorMessage) {
                if (status == 'SUCCESS')  {
                    var body = cmp.get("v.body");
                    body.push(component);
                    cmp.set("v.body", body);
                } else {
                    
                }
            });
        } else if (values[0] == 'D') { 
            
            $A.createComponent(
                "c:Modal_Confirmation",
                {
                    "title": "Delete Folder",
                    "message": "Are you sure you want to delete the folder?",
                    "confirm": cmp.getReference("c.handleDeleteFolderConfirm"),
                    "param": values[1]
                },
                function(modalWindow, status, errorMessage){
                    //Add the new button to the body array
                    if (status === "SUCCESS") {
                        var body = cmp.get("v.body");
                        body.push(modalWindow);
                        cmp.set("v.body", body);
                    }
                    else if (status === "INCOMPLETE") {
                        console.log("No response from server or client is offline.")
                        // Show offline error
                    }
                        else if (status === "ERROR") {
                            console.log("Error: " + errorMessage);
                            // Show error message
                        }
                }
            );
            
            
        }
    },
    
    handleDeleteConfirm : function(cmp, event, helper) {
        //retrieve the value of the parameter
        var recordId = event.getParam("v.param");
        var action = cmp.get("c.deleteNode");
        action.setParams({"folderId": recordId});
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                
                cmp.find('notifLib').showToast({
                    "variant": "success",
                    "message": "Folder Deleted!"
                });
                
                var compEvent = $A.get("e.c:expand_node");
                compEvent.setParams({"nodeId": null, "path": null, "append": false });
                compEvent.fire();
                component.destroy();
            } else {
                var errors = response.getError();
                var message = "There was a problem deleting the folder.";
                if (errors) {
                    if (errors[0] && errors[0].pageErrors && errors[0].pageErrors[0] ) {
                        message = errors[0].pageErrors[0].message;
                    }
                }
                
                cmp.find('notifLib').showToast({
                    "variant": "error",
                    "message": message
                });
            }
        });
        $A.enqueueAction(action);
    },
    
    handleFileMenuClick : function(cmp, event, helper) {
        var values = event.getParam("value").split(':');
        if (values[0]=='E') {
            var editRecordEvent = $A.get("e.force:editRecord");
            editRecordEvent.setParams({
                "recordId": values[1]
            });
            editRecordEvent.fire();
        } else if (values[0]=='V') {
            var navEvt = $A.get("e.force:navigateToSObject");
            navEvt.setParams({
                "recordId": values[1]
            });
            navEvt.fire();
        } else if (values[0]=='P') {
			$A.get('e.lightning:openFiles').fire({
                recordIds: [values[1]]
            });
        } else if (values[0]=='W') {
            var urlEvent = $A.get("e.force:navigateToURL");
            urlEvent.setParams({
                "url": "/sfc/servlet.shepherd/document/download/" + values[1] + "?operationContext=S1"
            });
            urlEvent.fire();
        } else if (values[0]=='D') {
            
            $A.createComponent(
                "c:Modal_Confirmation",
                {
                    "title": "Delete File",
                    "message": "Are you sure you want to delete the file?",
                    "confirm": cmp.getReference("c.handleDeleteFolderConfirm"),
                    "param": values[1]
                },
                function(modalWindow, status, errorMessage){
                    //Add the new button to the body array
                    if (status === "SUCCESS") {
                        var body = cmp.get("v.body");
                        body.push(modalWindow);
                        cmp.set("v.body", body);
                    }
                    else if (status === "INCOMPLETE") {
                        console.log("No response from server or client is offline.")
                        // Show offline error
                    }
                        else if (status === "ERROR") {
                            console.log("Error: " + errorMessage);
                            // Show error message
                        }
                }
            );
            
            
        }
    },
    
    handleConfirmFileDelete : function(cmp, event, helper) {
        var recordId = event.getParam("v.param");
        var action = cmp.get("c.deleteFile");
            action.setParams({"fileId": recordId});
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    
                    cmp.find('notifLib').showToast({
                        "variant": "success",
                        "message": "File Deleted!"
                    });
                    
                    var compEvent = $A.get("e.c:expand_node");
                    compEvent.setParams({"nodeId": null, "path": null, "append": false });
                    compEvent.fire();
                    component.destroy();
                } else {
                    
                    cmp.find('notifLib').showToast({
                        "variant": "error",
                        "message": "There was a problem deleting the file."
                    });
                    
                    //...do something here
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
