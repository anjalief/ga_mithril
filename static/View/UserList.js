// src/views/UserList.js
var m = require("mithril")
var Archer = require("../Model/Archer")

var UserList = {
    oninit: Archer.loadList,
    view: function(vnode) {
        var archerList = Archer.list.map(function(archer) {
                return m("option", {value: archer.id}, archer.firstname + " " + archer.lastname)
            });
        var default_select = m("option", {value: "", disabled: 'disabled', selected: 'selected'}, "Select Archer");
        archerList.unshift(default_select);
        return m("select", {onchange:  vnode.attrs.onchange}, archerList);
    },
    getSelectedArcher: function(vnode) {
      console.log(UserList.selectedIndex);
      return Archer.list[this.selectedIndex];
    }
}

module.exports = UserList
