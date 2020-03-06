({
    highlightTreeNode : function(component, folderId) {
        var items = document.querySelectorAll("li[aria-selected=true]");
        
        for(var i = 0; i < items.length; i++) {
            items[i].setAttribute("aria-selected", false);
        }
        //if the tree view is not loaded, no need to do anything, otherwise highlight it
        var treeItem = document.querySelectorAll("li[data-id='" + folderId  +  "']");
        if (treeItem.length > 0) {
            treeItem[0].setAttribute("aria-selected", true);
        }
        
    }, 
    
    showNodeItems : function(component, folderId) {
        component.set("v.LoadingFolder", true);
        //get the last item and show it
        var path = component.get("v.Path");
        
        var action = component.get("c.loadNode");
        action.setParams({"folderId": folderId, foldersOnly: false});
        action.setCallback(this, function(response) {
            
            var result = response.getState();
            if (result === "SUCCESS") {
                
                var content = response.getReturnValue();
                if (content != null && content.length > 0) {
                    
                    for(var i = 0; i < content.length; i++) {
                        if (content[i].IsFolder) {
                            
                        } else {
                            content[i].ParsedSize = Math.round(content[i].ContentSize / 1000) + ' KB';
                            content[i].IconType = content[i].FileExtension;
                            let types = '.ai.attachment.audio.box_notes.csv.eps.excel.exe.flash.gdoc.gdocs.gform.gpres.ghseet.html.image.keynote.link.mp4.overlay.pack.pages.pdf.ppt.psd.quip_doc.quip_sheet.rtf.slide.stypi.txt.video.visio.webex.word.xml.zip';
                            //if type not in the list, try the conversion
                            if (types.indexOf(content[i].IconType) <0) {
                                if ('.docx.dot'.indexOf(content[i].IconType) >= 0) {content[i].IconType = 'word';}
                                else if ('.xlsx'.indexOf(content[i].IconType) >= 0) {content[i].IconType = 'excel';}
                                    else if ('.png.bmp.jpg.gif'.indexOf(content[i].IconType) >= 0) {content[i].IconType = 'image';}
                                        else if ('.mp3.wav.m4p.ogg.wma'.indexOf(content[i].IconType) >= 0) {content[i].IconType = 'audio';}
                                            else {content[i].IconType = 'unknown';}
                            }
                        }
                    }
                    
                    
                    $A.createComponent("c:File_Detail_Icons", {content: content}, function(new_component, status, errorMessage) {
                        if (status == 'SUCCESS')  {
                            component.set("v.body", [new_component]);
                            
                        } else {
                            
                        }
                    });
                    //hide the empty status
                    component.set("v.EmptyFolder", false);
                } else {
                    //show the empty status and empty the body
                    component.set("v.EmptyFolder", true);
                    component.set("v.body", []);
                }
            } else {
                component.find('notifLib').showNotice({
                    "variant": "error",
                    "header": "Something has gone wrong!",
                    "message": "Cannot load the folder content."
                });
            }
            component.set("v.LoadingFolder", false);
        });
        $A.enqueueAction(action);
    },
    
    loadPermissions : function(component, path) {
        var WorkspaceId = component.get("v.WorkspaceId");
        if (path.length > 0 && path[0].id != WorkspaceId) {
            component.set("v.WorkspaceId", path[0].id);
            
            var action = component.get("c.getFolderPermissions");
            action.setParams({"FolderId": path[0].id});
            action.setCallback(this, function(response) {
                debugger;
                var result = response.getState();
                if (result === "SUCCESS") {
                    var settings = response.getReturnValue();
                    component.set("v.FolderSettings", settings);
                }
            });
            $A.enqueueAction(action);
            
        } else {
            component.set("v.WorkspaceId", null);
        }
    }
})
