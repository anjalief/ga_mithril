// src/views/UserForm.js
var m = require("mithril");

var ArcherBase = require("../Model/Archer");

var gender_select = {
    view: function(vnode) {
        return m("select", {onchange: vnode.attrs.onchange},
                  [ m("option", {value: "", disabled: 'disabled', selected: 'selected'}, "Select Gender"),
                    m("option", {value:"Male"}, "Male"),
                    m("option", {value:"Female"}, "Female") ])
    }
}

module.exports = {
    view: function(ctrl) {
        return m("form", {
          onsubmit: function(e) {
              ArcherBase.save()
              m.render(this);
          }
      }, [
            m("label.label", "First name"),
            m("input[name=first]",  {
                oninput: m.withAttr("value", function(value) {ArcherBase.new_archer.firstname = value}),
                value: ArcherBase.new_archer.firstName
            }),
            m("label.label", "Last name"),
            m("input[name=last]",  {
                oninput: m.withAttr("value", function(value) {ArcherBase.new_archer.lastname = value}),
                value: ArcherBase.new_archer.lastName
            }),
            m("label.label", "Gender"),
            m(gender_select, {
                onchange: m.withAttr("value", function(value) {ArcherBase.new_archer.gender = value}),
                value: ArcherBase.new_archer.gender
            } ),
            m("label.label", "Birth Year"),
            m("input[name=byear]", {
                type: "number",
                oninput: m.withAttr("value", function(value) {ArcherBase.new_archer.byear = value}),
                value: ArcherBase.new_archer.byear
            }),
            m("button", {onclick: ctrl.submit}, "Add New Archer")
        ]);
    }
}
