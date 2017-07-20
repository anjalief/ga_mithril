var m = require("mithril");
var Archer = require("./Archer");
var LambdaHandler = require("./LambdaHandler")

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

        LambdaHandler.invoke_lambda('attendance',
            {queryStringParameters: {date : AttendanceHandler.date},
             httpMethod : 'GET'},
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
                  console.log(date_obj, today);
                  console.log(date_obj > today);
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
                      // we don't want to mess with the underlying model so just
                      // copy over the attributes we care about
                      rows.push({"firstname" : archer.firstname,
                                 "lastname" : archer.lastname,
                                 "id" : archer.id,
                                 "checked" : true});
                            });
                      // if it's already been entered, day must have passed
                      AttendanceHandler.disable_submit_btn = false;
                      AttendanceHandler.rows = rows;
            }
          })
    },

    save_rows: function() {
        id_list = [];
        [].forEach.call(AttendanceHandler.rows, function (element, index, array) {
                if (element.checked && element.id) {
                  id_list.push(element.id);
                }
            });
        console.log(id_list);

        LambdaHandler.invoke_lambda('attendance',
            {body: {id_list : id_list,
                    date : AttendanceHandler.date},
             httpMethod : 'POST'},
             function(result) {
                AttendanceHandler.message = result.message;
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
