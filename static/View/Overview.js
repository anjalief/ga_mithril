var m = require("mithril");
var OverviewHandler = require("../Model/OverviewHandler");

module.exports = {
    view : function() {
        // we have to do this here, not oninit so that
        // it gets recalled after the ajax call finishes
        OverviewHandler.processArchers();

        var day_list = [];
        day_list.push(m("tr", [ m("th", "Day"),
                                m("th", "Number of Archers") ]));
        for (day in OverviewHandler.day_to_archer) {
          day_list.push(m("tr", [ m("td", day),
                                  m("td", OverviewHandler.day_to_archer[day]) ]));
        }
        day_list.push(m("tr", [ m("th", "Total Active"),
                                m("th", OverviewHandler.active_count) ]));
        return m("div", {class : "floater"}, m("table", day_list));
    }
}
