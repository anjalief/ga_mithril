var m = require("mithril");
var Archer = require("./Archer");
var UserHandler = require("./UserHandler");
var Config = require("./Config");

var month_array = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var AttendanceHandler = {
    date: "",
    rows: null,
    message: "",
    disable_submit_btn : true,
    load: function() {
        if (AttendanceHandler.date == "") {
            return "";
        }

        UserHandler.validateSession();  // refresh id token
        return m.request({
            method : "GET",
            url: Config.BASE_URL + "/attendance",
            headers: {
              "Authorization": UserHandler.id_token
            },
            data: {date : AttendanceHandler.date},
            })
        .then(
            function(result) {
                // we haven't entered attendance for this date. We need to figure out
                // who to expect based on JOAD day
                if (!result.rows) {
                  var absent_ids = result.absent_ids;
                  var present_ids = result.present_ids;
                  AttendanceHandler.message = "";

                  // should be able to get this directly from datepicker, but it's
                  // buried too deep
                  var month_offset = 1;
                  var parts = AttendanceHandler.date.split('/');
                  var date_obj = new Date(parts[2],parts[0]-month_offset,parts[1]);
                  var today = new Date();
                  // can't enter attendance for dates that haven't happened
                  AttendanceHandler.disable_submit_btn = date_obj > today;

                  var day_index = date_obj.getDay();
                  var day_of_week = month_array[day_index];

                  var all_archers = Archer.getList();
                  var expected_archers = [];
                  for (id in all_archers) {
                    if (all_archers[id].joad_day == day_of_week) {
                      if (absent_ids.indexOf(id) < 0) {
                        expected_archers.push(all_archers[id]);
                      }
                    } else if (present_ids.indexOf(id) >= 0) {
                      expected_archers.push(all_archers[id]);
                    }
                  }
                  AttendanceHandler.rows = expected_archers;
                  return;
                } else {
                    AttendanceHandler.message = result.message;
                    // we've already entered attendance for this date, mark all as checked
                    var rows = [];
                    [].forEach.call( result.rows, function (element, index, array) {
                        var archer = Archer.getArcherById(element);
                        // Archer might not exist if we've removed them
                        if (archer) {
                            // we don't want to mess with the underlying model so just
                            // copy over the attributes we care about
                            rows.push({"firstname" : archer.firstname,
                                   "lastname" : archer.lastname,
                                   "id" : archer.id,
                                   "checked" : true});
                        }
                      });
                      // if it's already been entered, day must have passed
                      AttendanceHandler.disable_submit_btn = false;
                      AttendanceHandler.rows = rows;
            }
          })
          .catch(function(e) {
              AttendanceHandler.message = "ERROR: Unable to load attendance";
              console.log(e.message);
          })
    },

    save_rows: function() {
        id_list = [];
        [].forEach.call(AttendanceHandler.rows, function (element, index, array) {
                if (element.checked && element.id) {
                  id_list.push(element.id);
                }
            });

        UserHandler.validateSession();  // refresh id token
        return m.request({
            method : "POST",
            url: Config.BASE_URL + "/attendance",
            headers: {
              "Authorization": UserHandler.id_token
            },
            data: {id_list : id_list,
                   date : AttendanceHandler.date},
            })
        .then(function(result) {
            AttendanceHandler.message = result.message;
        })
        .catch(function(e) {
            AttendanceHandler.message = "ERROR: unable to save attendance";
            console.log(e);
        })
    },

    add_row: function(new_row) {
        if (AttendanceHandler.rows == null) {
            return;
        }
        AttendanceHandler.rows.push(new_row);
        AttendanceHandler.message = "";
    },

    set_val_by_index: function(row_idx, key, val) {
        AttendanceHandler.rows[row_idx][key] = val;
        AttendanceHandler.message = "";
    },

};

module.exports = AttendanceHandler
