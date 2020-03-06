({
	initialize : function(component, event, helper) {
		var items = component.get("v.items"),
            index = component.get("v.index");

        if (items != null && items.length > 0 && items[index] != null) {
            var body = component.get("v.body");
            body.push(items[index]);
            component.set("v.body", body);
        }
	}
})