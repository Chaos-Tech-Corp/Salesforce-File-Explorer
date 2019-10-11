({
    
    init : function(component, event, helper) {
        var action = component.get("c.findLibraryId");
        action.setParams({"folderId": component.get("v.recordId")});
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
				component.set("v.recordId",response.getReturnValue());
            } else {
				console.log('Something went wrong');
            }
        });
        $A.enqueueAction(action);
    },
    
    handleUploadFinished : function(component, event, helper) {

        var folderId = component.get("v.folderId");
        var uploadedFiles = event.getParam("files");
        var fileIds = [];
        for (var i = 0; i<uploadedFiles.length; i++) {
            fileIds.push(uploadedFiles[i].documentId);
        }

        //add the files to the folder 
        var action = component.get("c.addFilesToNode");
        action.setParams({"folderId": folderId,"fileIds": fileIds});
        action.setCallback(this, function(response) {

            var state = response.getState();
            if (state === "SUCCESS") {
                
                component.find('notifLib').showToast({
                    "variant": "success",
                    "message": "Files Uploaded!"
                });
                
                var compEvent = $A.get("e.c:expand_node");
                compEvent.setParams({"nodeId": folderId, "path": null, "append": false });
                compEvent.fire();
                component.destroy();
            } else {

                var message = "There was a problem adding the files to the folder.";
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        console.log("Error message: " +
                                    errors[0].message);
                    }
                } else {
                    console.log("Unknown error");
                }
                component.find('notifLib').showToast({
                    "variant": "error",
                    "message": message
                });
            }
        });
        $A.enqueueAction(action);

    },
    
    handleCancelClick : function(component, event, helper) {
        component.destroy();
    }
})