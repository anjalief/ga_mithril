var m = require("mithril");
var LambdaHandler = require("./LambdaHandler")

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
      body = {
        id : AttendanceExtra.reschedule_id,
        from_date : AttendanceExtra.reschedule_from_date,
        to_date : AttendanceExtra.reschedule_to_date };
      LambdaHandler.invoke_lambda('reschedule',
          {body : body},
          function(result) {
            AttendanceExtra.reschedule_message = result.message;
            AttendanceExtra.reschedule_from_date = "";
            AttendanceExtra.reschedule_to_date = "";
      })
    },

    selected_extra : "",
    extra_practice_date : "",
    extra_practice_message : "",
    save_extra: function() {
      body = {
        id : AttendanceExtra.selected_extra,
        date : AttendanceExtra.extra_practice_date };
      LambdaHandler.invoke_lambda('extra_practice',
          {body : body},
          function(result) {
            // TODO: id doesn't reset nicely
            AttendanceExtra.extra_practice_message = result.message;
            AttendanceExtra.extra_practice_date = "";
      })
    }
}

module.exports = AttendanceExtra
