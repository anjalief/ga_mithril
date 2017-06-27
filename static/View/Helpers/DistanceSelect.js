var m = require("mithril");

var set_value = function(value, current_value) {
    return {value : value, selected : current_value == value};
};

module.exports = {
    view: function(vnode) {
        return m("select", {onchange: vnode.attrs.onchange},
                 [ m("option", {value: "", disabled: 'disabled', selected: !vnode.attrs.value}, "Select Distance"),
                    m("option", set_value("5", vnode.attrs.value), "5"),
                    m("option", set_value("10", vnode.attrs.value), "10"),
                    m("option", set_value("15", vnode.attrs.value), "15"),
                    m("option", set_value("20", vnode.attrs.value), "20"),
                    m("option", set_value("25", vnode.attrs.value), "25"),
                    m("option", set_value("30", vnode.attrs.value), "30"),
                    m("option", set_value("40", vnode.attrs.value), "40"),
                    m("option", set_value("50", vnode.attrs.value), "50"),
                    m("option", set_value("60", vnode.attrs.value), "60"),
                    m("option", set_value("70", vnode.attrs.value), "70")
                   ])
    }
}