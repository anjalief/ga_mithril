// src/views/UserList.js
var m = require("mithril")
var Archer = require("../Model/Archer")

var ArcherDropDown = {
    view: function(vnode) {
        var show_suspended;
        if (vnode.attrs.show_suspended) {
            show_suspended = vnode.attrs.show_suspended;
        } else {
            // default hide suspended
            show_suspended = false;
        }
        var archers = Archer.getList();
        var options = [];
        for (id in archers) {
            var archer = archers[id];
            if (!show_suspended && archer.joad_day == "Suspended") {
                  continue;
            }
            options.push(m("option", {value: id, sort_key : archer.firstname}, archer.firstname + " " + archer.lastname));
        }

        options.sort(function(a, b) {
            var nameA = a.attrs.sort_key;
            var nameB = b.attrs.sort_key;
            if (nameA < nameB) {
                return -1;
              }
            if (nameA > nameB) {
              return 1;
            }
            //  must be equal
            return 0;
          });

        var default_select = m("option", {value: "", disabled: 'disabled', selected: 'selected'}, "Select Archer");
        options.unshift(default_select);
        return m("select", {onchange:  vnode.attrs.onchange}, options);
    }
}

module.exports = ArcherDropDown
