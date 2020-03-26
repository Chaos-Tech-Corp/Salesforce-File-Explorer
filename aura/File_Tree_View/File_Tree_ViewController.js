({
    initialize : function(component, event, helper) {
        if (component.get("v.items").length > 0) {
            //items are already loaded, do nothing
            component.set("v.loading", false);
            return;
        }
        
        var action = component.get("c.getAllNodes");
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var items = response.getReturnValue();
                const compare = function compare(a, b) {
                    // Use toUpperCase() to ignore character casing
                    const bandA = a.Name.toUpperCase();
                    const bandB = b.Name.toUpperCase();
                    let comparison = 0;
                    if (bandA > bandB) {
                        comparison = 1;
                    } else if (bandA < bandB) {
                        comparison = -1;
                    }
                    return comparison;
                };
                items.sort(compare);
                const nest = function(items, id) {
                    return items.filter(item => item.ParentContentFolderId == id).map(item => ({name: item.Id, iconName: 'utility:open_folder', selected:false, expanded:false, label: item.Name, items: nest(items, item.Id)}));
                };
                component.set("v.list", items);
                component.set("v.items", nest(items));
            } else {
                // error handling
            }
            component.set("v.loading", false);
        });
        $A.enqueueAction(action);
    },
    
    handleExpandNode : function(component, event, helper) {
        var folderId = event.getSource().get("v.value"),
            expanded = event.target.parentElement.getAttribute("aria-expanded");
        
        if (expanded == "true") {
            event.target.parentElement.setAttribute("aria-expanded", "false");
        } else {
            event.target.parentElement.setAttribute("aria-expanded", "true");
        }
    },
    
    handleSelectNode : function(component, event, helper) {
        
        var li = event.target.closest('li'),
            id = li.dataset.id,
            items = component.get("v.list");
        
        //get breadcrumbs
        var parent = li.closest('li'),
            path = [];
        while(parent != null) {
            path.unshift({title: parent.getAttribute("aria-label"), id: parent.dataset.id });
            parent = parent.parentElement.closest('li');
        }
        
        /*
        //generate the breadcrumbs
        path = [];
        const crumbs = function(items, id) {
            var path = [];
            var found = items.filter(item => item.Id == id);
            if (found.length > 0) {
                path.push({id: id, title: found[0].Name});
                if (found[0].ParentContentFolderId != null) {
                	path = path.concat(crumbs(items, found[0].ParentContentFolderId));
				}
            }
            return path;
        }
        path = crumbs(items, id).reverse();
        */

        
        
        //trigger the event to tell the File_Explorer component that the path needs to be updated
        //same event will be used to load the files in the file_view component
        var pathEvent = component.getEvent("pathChangeEvent");
        pathEvent.setParams({"path" : path });
        pathEvent.fire();
        
    },

    /*handleFolderChange : function(component, event, helper) {
        var params = event.getParam('arguments');
        component.set("v.selectedFolderId", params.folderId);
    },*/
    
    refreshFolder : function(component, event, helper) {
        
    }
    
    
})