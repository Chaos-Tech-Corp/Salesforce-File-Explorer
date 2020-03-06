({
    initialize : function(component, event, helper) {
        var action = component.get("c.loadNode");

        action.setParams({folderId: component.get("v.folderId"),
                          foldersOnly: true});
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var items = response.getReturnValue();
                component.set("v.items", items);
            } else {
                
            }
            component.set("v.loading", false);
            //wait for the node items to be added to the DOM -- not sure having a timeOut is the best thing
            //this should highlight the entry if is the selected folder
            window.setTimeout(component.getEvent("nodeExpandEvent").fire, 100);
        });
        $A.enqueueAction(action);
        
    },
    
    handleSelectNode : function(component, event, helper) {

        var li = event.target.closest('li'),
            id = li.dataset.id,
            items = document.querySelectorAll("[role='treeitem']");

        //get breadcrumbs
        var parent = li.closest('li'),
            path = [];
        while(parent != null) {
            path.unshift({title: parent.getAttribute("aria-label"), id: parent.dataset.id });
            parent = parent.parentElement.closest('li');
        }

        //trigger the event to tell the File_Explorer component that the path needs to be updated
        //same event will be used to load the files in the file_view component
        var pathEvent = component.getEvent("pathChangeEvent");
        pathEvent.setParams({"path" : path });
        pathEvent.fire();
        
    },
    
    handleExpandNode : function(component, event, helper) {
        var values = event.getSource().get("v.value").split(':'),
        	folderId = values[0],
            expanded = event.target.parentElement.getAttribute("aria-expanded");
        if (expanded == "true") {
        	event.target.parentElement.setAttribute("aria-expanded", "false");
        } else {
            event.target.parentElement.setAttribute("aria-expanded", "true");
        }

		var items = component.get("v.treeItems");
        if (items[values[1]] == null) {
            
            $A.createComponent(
                "c:File_Tree_View",
                {
                    "folderId": folderId,
                    "level": (parseInt(component.get("v.level")) + 1)
                },
                function(newComponent, status, errorMessage){
                    if (status === "SUCCESS") {
                        items[values[1]] = newComponent;
                        component.set("v.treeItems", items);
                        
                    }
                    else if (status === "INCOMPLETE") {
                        alert("No response from server or client is offline.")
                        // Show offline error
                    }
                        else if (status === "ERROR") {
                            alert("Error: " + errorMessage);
                            // Show error message
                        }
                }
            );
        }
       
    }
})