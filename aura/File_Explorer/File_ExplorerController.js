({
    init: function (cmp,event,helper) {
        
        var action = cmp.get("c.loadRoot");
        action.setCallback(this, function(response) {
            
            var state = response.getState();
            if (state === "SUCCESS") {
                var ws = response.getReturnValue();
                
                for(var i = 0; i<ws.length; i++) {
                    ws[i].Items = [];
                    ws[i].Expanded = 'false';
                    ws[i].IsLoaded = false;
                }
                
                cmp.set("v.items",ws);
                
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
            cmp.set("v.content",[]);
            cmp.set("v.pathItems",[]);
            cmp.set("v.contentLoaded",true);
        });
        $A.enqueueAction(action);
        
    },
    
    handleRefreshClick: function(cmp) {
        debugger;
        var lll = cmp.get("v.items");
        var pathIds = cmp.get("v.pathIds");
        if (pathIds != null && pathIds.length > 0) {
            var nodeId = pathIds[pathIds.length - 1];
            
            var compEvent = $A.get("e.c:expand_node");
            compEvent.setParams({"nodeId": nodeId, "path": null, "append": false });
            compEvent.fire();
        }
    },
    
    changeViewType: function(cmp, event) {
        var selectedOptionValue = event.getParam("value"),
            iconName = cmp.get("v.viewIconName");
        cmp.set('v.viewtype', selectedOptionValue);
        
        if (selectedOptionValue == 'large_icon') {iconName = 'utility:apps';}
        else if (selectedOptionValue == 'previews') {iconName = 'utility:tile_card_list';}
            else if (selectedOptionValue == 'details') {iconName = 'utility:table';}
                else if (selectedOptionValue == 'tiles') {iconName = 'utility:snippet';}
        cmp.set('v.viewIconName', iconName);
        
        var menuItems = cmp.find("menuItems");
        menuItems.forEach(function (menuItem) {
            // For each menu item, if it was checked, un-check it. This ensures that only one
            // menu item is checked at a time
            if (menuItem.get("v.checked")) {
                menuItem.set("v.checked", false);
            }
            // Check the selected menu item
            if (menuItem.get("v.value") === selectedOptionValue) {
                menuItem.set("v.checked", true);
            }
        });
    },
    
    handleSelectNode: function(cmp, event, helper) {
        var nodeId = event.getParam('nodeId'),
            path = event.getParam('path'),
            name = event.getParam('name'),
            append = event.getParam('append'),
            action = cmp.get("c.loadNode");
        var pathItems = cmp.get("v.pathItems");
		var pathIds = cmp.get("v.pathIds");
        
        if (append == true) {
             pathItems.push(name); cmp.set("v.pathItems", pathItems);
             pathIds.push(path); cmp.set("v.pathIds", pathIds);
        }  else {
            if (nodeId == null || nodeId == '') {
                //refresh
                nodeId = pathIds[pathIds.length - 1];
            }
            else if (path == null || path == '') {
                //navigation outside the tree view
                //check if the id is there
                let tmpPath = [],
                    tmpItems = [];
                for(var i = 0; i < pathIds.length; i++ ) {
                    tmpPath.push(pathIds[i]);
                    tmpItems.push(pathItems[i]);
                    if (pathIds[i] == nodeId) {
                        break;
                    }
                }
                cmp.set("v.pathItems", tmpItems);
                cmp.set("v.pathIds", tmpPath);
            }
            else {
                //tree view navigation
        		cmp.set("v.pathItems", helper.findName(cmp.get("v.items"),path.split(':'),0));
            	cmp.set("v.pathIds", path.split(':'));
            }
        }
        
        action.setParams({"id":nodeId});
        cmp.set("v.contentLoaded",false);
        action.setCallback(this, function(response) {
            var state = response.getState();
            
            if (state === "SUCCESS") {
                var ws = response.getReturnValue();
                for(var i = 0; i < ws.length; i++) {
                    if (ws[i].IsFolder) {
                        
                    } else {
                        ws[i].ParsedSize = Math.round(ws[i].ContentSize / 1000) + ' KB';
                        ws[i].IconType = ws[i].FileExtension;
                        let types = '.ai.attachment.audio.box_notes.csv.eps.excel.exe.flash.gdoc.gdocs.gform.gpres.ghseet.html.image.keynote.link.mp4.overlay.pack.pages.pdf.ppt.psd.quip_doc.quip_sheet.rtf.slide.stypi.txt.video.visio.webex.word.xml.zip';
                        //if type not in the list, try the conversion
                        if (types.indexOf(ws[i].IconType) <0) {
                            if ('.docx.dot'.indexOf(ws[i].IconType) >= 0) {ws[i].IconType = 'word';}
                            else if ('.xlsx'.indexOf(ws[i].IconType) >= 0) {ws[i].IconType = 'excel';}
                                else if ('.png.bmp.jpg.gif'.indexOf(ws[i].IconType) >= 0) {ws[i].IconType = 'image';}
                                    else if ('.mp3.wav.m4p.ogg.wma'.indexOf(ws[i].IconType) >= 0) {ws[i].IconType = 'audio';}
                                        else {ws[i].IconType = 'unknown';}
                        }
                    }
                }
                
                cmp.set("v.content", ws);
                cmp.set("v.selectedId", nodeId);
                
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
            cmp.set("v.contentLoaded",true);
        });
        $A.enqueueAction(action);
    },
    
    handleNavClick: function(cmp, event) {
        var component_target = event.currentTarget;
        var ix = component_target.dataset.ix;
        var pathIds = cmp.get("v.pathIds"),
            pathId = pathIds[ix];
        
        var compEvent = $A.get("e.c:expand_node");
        compEvent.setParams({"nodeId": pathId });
        compEvent.fire();
        
    },
    
    createFolder : function (cmp, event, helper) {
        var pathIds = cmp.get("v.pathIds");
        if (pathIds != null && pathIds.length > 0) {
            pathIds = pathIds[pathIds.length-1];
        } else {
            pathIds = null;
        }
        $A.createComponent("c:New_Folder", {"folderId":pathIds}, function(component, status, errorMessage) {
            if (status == 'SUCCESS')  {
                var body = cmp.get("v.body");
                    body.push(component);
                    cmp.set("v.body", body);
            } else {
                
            }
        });

    },
    
    handleUploadClick: function(cmp, event, helper) {
        var pathIds = cmp.get("v.pathIds"),
            folderId = null,
            recordId = null;
        if (pathIds != null && pathIds.length > 0) {
            folderId = pathIds[pathIds.length-1];
            recordId = pathIds[0];
        } 
        
        $A.createComponent("c:Upload_File", {"recordId":recordId,"folderId":folderId}, function(component, status, errorMessage) {
            if (status == 'SUCCESS')  {
                var body = cmp.get("v.body");
                    body.push(component);
                    cmp.set("v.body", body);
            } else {
                
            }
        });
    }
});