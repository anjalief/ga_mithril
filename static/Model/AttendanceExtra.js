var m = require("mithril");
var UserHandler = require("./UserHandler");
var Config = require("./Config");

var AttendanceExtra = {
    reschedule_id : "",
    reschedule_from_date : "",
    reschedule_to_date : "",
    reschedule_message: "",
    save_reschedule: function() {
      if (AttendanceExtra.reschedule_from_date == "" &&
            AttendanceExtra.reschedule_to_date == "") {
            AttendanceExtra.reschedule_message = "You must specify a from_date or a to_date";
            return;
      }
      if (AttendanceExtra.reschedule_id == "") {
            AttendanceExtra.reschedule_message = "You must specify an archer";
            return;
      }

      UserHandler.validateSession();  // refresh id token
      return m.request({
            method : "POST",
            url : Config.BASE_URL + "/reschedule",
            headers: {
              "Authorization": UserHandler.id_token
            },
            data : { id : AttendanceExtra.reschedule_id,
                     from_date : AttendanceExtra.reschedule_from_date,
                     to_date : AttendanceExtra.reschedule_to_date },
            })
      .then(function(result) {
            AttendanceExtra.reschedule_message = result.message;
            AttendanceExtra.reschedule_from_date = "";
            AttendanceExtra.reschedule_to_date = "";
      })
      .catch(function(e) {
          AttendanceExtra.reschedule_message = "ERROR: Attendance not updated";
          console.log(e.message);
      })
    },

    selected_extra : "",
    extra_practice_date : "",
    extra_practice_message : "",
    save_extra: function() {
      body = {
        id : AttendanceExtra.selected_extra,
        date : AttendanceExtra.extra_practice_date };

      UserHandler.validateSession();  // refresh id token
      return m.request({
            method : "POST",
            url : Config.BASE_URL + "/extra_practice",
            headers: {
              "Authorization": UserHandler.id_token
            },
            data : body,
            })
      .then(
          function(result) {
            // TODO: id doesn't reset nicely
            AttendanceExtra.extra_practice_message = result.message;
            AttendanceExtra.extra_practice_date = "";
      })
      .catch(function(e) {
          AttendanceExtra.extra_practice_message = "ERROR: Attendance not updated";
          console.log(e.message);
    })
  }
}

module.exports = AttendanceExtra
