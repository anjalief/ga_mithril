var $ = require("jquery");
var datepicker = require("jquery-ui/ui/widgets/datepicker");
var m = require("mithril");

var DatePicker = {
    oncreate: function(vnode) {
        var sel = "#" + vnode.attrs.id;
        $(sel).datepicker();
    },
    view: function(vnode) {
        return m("input", {id : vnode.attrs.id,
                           class : "datepicker",
                           type : "text",
                           value : vnode.attrs.value,
                           onchange : vnode.attrs.onchange})
    }
};

module.exports = DatePicker