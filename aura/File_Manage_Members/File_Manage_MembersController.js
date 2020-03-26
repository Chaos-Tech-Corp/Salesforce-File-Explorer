({
	Initialize : function(component, event, helper) {
		var params = event.getParam('arguments'),
            folderId = params.folderId;

        component.set("v.loading", true);
        
        var action = component.get("c.getFolderMembers");
        action.setParams({"folderId": folderId});
        action.setCallback(this, function(response) {
            component.set("v.members", response.getReturnValue());
            component.set("v.loading", false);
        });
        $A.enqueueAction(action);
        
        component.set("v.display", true);
	},
    
    handleCloseManage : function(component, event, helper) {
        component.set("v.display", false);
    }
})