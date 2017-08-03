var m = require("mithril");
// var OverviewHandler = require("../Model/OverviewHandler");
var Archer = require("../Model/Archer");

module.exports = {
    oninit: Archer.reset,
    view : function(vnode) {
        Archer.setCurrent(vnode.attrs.key);

        if (Archer.msg != "") {
            return m("h4", Archer.msg);
        }
        if (!Archer.current_archer) {
            return m("h4", "Archer does not exist");
        }

        var msg = "Are you sure you wish to remove " +
                  Archer.current_archer.firstname + " " +
                  Archer.current_archer.lastname +
                  "? This will erase all form and score records, and it CANNOT " +
                  " be undone. If there is a chance of the archer returning to the program," +
                  " you should instead marked them as Suspended.";

        return m("div", {class : "floater"}, [
            m("div", msg),
            m("button", {onclick : Archer.remove}, "Remove Archer")
          ]);
    }
}
