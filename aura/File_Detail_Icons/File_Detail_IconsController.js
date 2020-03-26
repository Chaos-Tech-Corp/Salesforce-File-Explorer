({
    handleFolderClick : function(component, event, helper) {
        var pathEvent = component.getEvent("pathChangeEvent");
        pathEvent.setParams({"id" : event.target.dataset.id, "title": event.target.dataset.title, "append": true });
        pathEvent.fire();
    }
})