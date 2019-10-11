({
    handleExpandNode : function(cmp, event, helper) {
        var nodeId = event.getSource().get("v.value");
        var items = cmp.get("v.items");
        var isExpanded = event.target.parentElement.getAttribute("aria-expanded");
        var visible = cmp.get("v.visibility") || [];

        if (isExpanded != null && isExpanded == 'true') {
            event.target.parentElement.setAttribute("aria-expanded","false");
            for (var i = 0; i < items.length; i++) {
                if (items[i].RootContentFolderId == nodeId) {
                    visible[i] = false;
                    break;
                }
            }
            cmp.set("v.visibility", visible);
            
        } else {
            
            
            for (var i = 0; i < items.length; i++) {
                if (items[i].RootContentFolderId == nodeId) {
                    visible[i] = true;
                    cmp.set("v.visibility", visible);
                    if (items[i].IsLoaded) {
                        event.target.parentElement.setAttribute("aria-expanded","true");
                        return;
                    }
                    break;
                }
            }
            
            var action = cmp.get("c.expandNode");
            action.setParams({"id": nodeId});
            action.setCallback(this, function(response) {
                
                var state = response.getState();
                if (state === "SUCCESS") {
                    var ws = response.getReturnValue();
                    for (var i = 0; i < ws.length; i++) {
                        ws[i].Items = [];
                        ws[i].IsLoaded = false;
                    }
                    
                    for (var i = 0; i < items.length; i++) {
                        if (items[i].RootContentFolderId == nodeId) {
                            items[i].Items = ws;
                            items[i].Expanded = 'true';
                            items[i].IsLoaded = true;
                        } else {
                            items[i].Expanded = visible[i];
                        }
                    }
                    cmp.set("v.items", items);
                } else {
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
    },
    
    handleSelectNode : function(cmp, event) {
        var component_target = event.currentTarget;
		var nodeId = component_target.dataset.node,
            path = component_target.dataset.path;

        var compEvent = $A.get("e.c:expand_node");
        compEvent.setParams({"nodeId": nodeId, "path": path, "append": false });
		compEvent.fire();
    },
    
    handleNodeSelected : function(cmp, event) {
        var nodeId = event.getParam('nodeId');
        cmp.set("v.selectedId", nodeId);
    },

})