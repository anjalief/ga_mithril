var m = require("mithril");

 var DeleteRow = {
      view: function(vnode) {
         if (vnode.attrs.must_enter) {
             return "";
         }
         return m("button", {onclick : vnode.attrs.onclick}, "Remove");
     }
 };

module.exports = DeleteRow;