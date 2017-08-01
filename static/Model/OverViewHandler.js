var Archer = require("./Archer")
var OverviewHandler = {
    day_to_archer : {},
    active_count : 0,
    processArchers : function() {
        if (!Archer.loaded) {
            Archer.loadList();
            return;
        }
        // We want these to be in order
        OverviewHandler.day_to_archer = {
          "Monday" : 0,
          "Tuesday" : 0,
          "Wednesday" : 0,
          "Thursday" : 0,
          "Friday" : 0,
          "Saturday" : 0,
          "Sunday" : 0,
          "Not set" : 0,
          "Suspended" : 0
        };
        OverviewHandler.active_count = 0;
        for (id in Archer.id_to_archer) {
            var archer = Archer.id_to_archer[id];
            var joad_day;
            if ("joad_day" in archer) {
                joad_day = archer.joad_day;
            }
            else {
                joad_day = "Not set";
            }
            OverviewHandler.day_to_archer[joad_day] = 1;
            if (joad_day != "Suspended") {
              OverviewHandler.active_count += 1;
            }
        }
    }
}


module.exports = OverviewHandler;
