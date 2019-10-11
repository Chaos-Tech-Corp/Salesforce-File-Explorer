({
	handleClick : function(component, event, helper) {
		var component_target = event.currentTarget;
		var docId = component_target.dataset.id,
            isFolder = component_target.dataset.folder,
        	docName = component_target.dataset.name;
        if (isFolder == 'true') {
            var compEvent = $A.get("e:expand_node");
            compEvent.setParams({"nodeId": docId, "path": docId, "name": docName, "append": true });
			compEvent.fire();
        } else {
        	$A.get('e.lightning:openFiles').fire({
            	recordIds: [docId]
        	});
        }
	}
})