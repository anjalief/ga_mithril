var m = require("mithril");
var ArcherList = require("../UserList");

var NameCell = {
    view: function(vnode) {
        var archer = vnode.attrs.archer;
        if ("id" in archer && "firstname" in archer) {
            return m("div", archer.firstname + " " + archer.lastname);
        } else {
            return  m(ArcherList,
                      {onchange: vnode.attrs.onchange,
                              value: vnode.attrs.value});
        }
    }
}

module.exports = NameCell
