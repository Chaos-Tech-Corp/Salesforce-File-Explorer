({
    ///path = [id,id,id,id]
    findNode : function(nodes, path, level, value) {
        
        var name = path[0];
        for(var i = 1; i <= level; i++){
            name = name + ':' + path[i];
        }
        
        for(var i = 0; i < nodes.length; i++){
            if (nodes[i].name == name) {
                if(level == path.length - 1) {
                    nodes[i].items = value;
                    nodes[i].expanded = true;
                    break;
                } else {
                    this.findNode(nodes[i].items, path, level+1, value);
                }
            }
        }
    },
    
    findName : function(nodes, id, level) {
        var idPath = [],
            idName = '';
        level = level || 0;
        idName = id[level];
        for(var i = 0; i < nodes.length; i++){
            if (nodes[i].RootContentFolderId != null && nodes[i].RootContentFolderId == idName) {
                idPath.push(nodes[i].Name);
                if (id.length > level+1) {
                    idPath.push(...this.findName(nodes[i].Items,id,level+1));
                }
                break;
            }
        }
        
        return idPath;
    },
    
    createCookie: function (name, value, minutes) {
        var expires;
        if (minutes) {
            const date = new Date();
            //date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)); -- for days
            date.setTime(date.getTime() + (minutes * 60 * 1000));
            expires = "; expires=" + date.toGMTString();
        }
        else {
            expires = "";
        }
        document.cookie = name + "=" + escape(value) + expires + "; path=/";
    },
    
    getCookie: function(name) {
        var cookieString = "; " + document.cookie;
        var parts = cookieString.split("; " + name + "=");
        if (parts.length === 2) {
            return parts.pop().split(";").shift();
        }
        return null;
    }
})