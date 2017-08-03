// src/views/UserForm.js
var m = require("mithril");

var Archer = require("../Model/Archer");

var gender_select = {
    view: function(vnode) {
        return m("select", {onchange: vnode.attrs.onchange},
                  [ m("option", {value: "", disabled: 'disabled', selected: 'selected'}, "Select Gender"),
                    m("option", {value:"Male"}, "Male"),
                    m("option", {value:"Female"}, "Female") ])
    }
}

module.exports = {
    oninit : Archer.reset,
    view: function(ctrl) {
        return m("div",
        [
            m("label.label", "First name"),
            m("input[name=first]",  {
                oninput: m.withAttr("value", function(value) {Archer.current_archer.firstname = value}),
                value: Archer.current_archer.firstname || ""
            }),
            m("label.label", "Last name"),
            m("input[name=last]",  {
                oninput: m.withAttr("value", function(value) {Archer.current_archer.lastname = value}),
                value: Archer.current_archer.lastname || ""
            }),
            m("label.label", "Gender"),
            m(gender_select, {
                onchange: m.withAttr("value", function(value) {Archer.current_archer.gender = value}),
                value: Archer.current_archer.gender || ""
            } ),
            m("label.label", "Birth Year"),
            m("input[name=byear]", {
                type: "number",
                oninput: m.withAttr("value", function(value) {Archer.current_archer.byear =  Math.round( value )}),
                value: Archer.current_archer.byear || ""
            }),
            m("h4", Archer.msg),
            m("button", {onclick: Archer.save}, "Add New Archer")
        ]);
    }
}
