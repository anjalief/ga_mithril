// src/views/UserList.js
var m = require("mithril")
var Archer = require("../Model/Archer")

var ArcherDropDown = {
    view: function(vnode) {
        var archers = Archer.getList();
        var options = [];
        for (id in archers) {
            var archer = archers[id];
            options.push(m("option", {value: id}, archer.firstname + " " + archer.lastname));
        }
        var default_select = m("option", {value: "", disabled: 'disabled', selected: 'selected'}, "Select Archer");
        options.unshift(default_select);
        return m("select", {onchange:  vnode.attrs.onchange}, options);
    }
}

module.exports = ArcherDropDown
