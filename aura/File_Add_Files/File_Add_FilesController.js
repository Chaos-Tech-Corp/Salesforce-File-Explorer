({
    handleCloseAddFiles : function(component, event, helper) {
        component.set("v.display", false);
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
        action.setParams({"folderId": folderId, "fileIds": fileIds});
        action.setCallback(this, function(response) {

            var state = response.getState();
            if (state === "SUCCESS") {
                
                component.find('notifLib').showToast({
                    "variant": "success",
                    "message": "Files Uploaded!"
                });
                

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
            
            var appEvent = $A.get("e.c:File_Folder_Created");
            try {
                appEvent.setParams({"folderId": component.get("v.folderId")});
                appEvent.fire();
            } catch (err) {
                debugger;
                console.log(err);
            }
        });
        $A.enqueueAction(action);

    }
})