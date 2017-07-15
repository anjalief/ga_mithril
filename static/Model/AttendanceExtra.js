var m = require("mithril");

var AttendanceExtra = {
    reschedule_id : "",
    reschedule_from_date : "",
    reschedule_to_date : "",
    reschedule_message: "",
    save_reschedule: function() {
        return m.request({
            method : "POST",
            url : $BASE_URL + "/reschedule",
            data : { id : AttendanceExtra.reschedule_id,
                     from_date : AttendanceExtra.reschedule_from_date,
                     to_date : AttendanceExtra.reschedule_to_date },
            })
        .then(function(result) {
            // TODO: id doesn't reset nicely
            AttendanceExtra.reschedule_message = result.message;
            AttendanceExtra.reschedule_from_date = "";
            AttendanceExtra.reschedule_to_date = "";
            })
    },

    selected_extra : "",
    extra_practice_date : "",
    extra_practice_message : "",
    save_extra: function() {
      console.log("saving");
        return m.request({
            method : "POST",
            url : $BASE_URL + "/extra_practice",
            data : { id : AttendanceExtra.selected_extra,
                     date : AttendanceExtra.extra_practice_date },
            })
        .then(function(result) {
            // TODO: id doesn't reset nicely
            AttendanceExtra.extra_practice_message = result.message;
            AttendanceExtra.extra_practice_date = "";
            })
    }
}

module.exports = AttendanceExtra
