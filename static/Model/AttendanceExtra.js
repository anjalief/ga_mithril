var m = require("mithril");

var AttendanceExtra = {
    reschedule_id : "",
    reschedule_from_date : "",
    reschedule_to_date : "",
    save_reschedule: function() {
        return m.request({
            method : "POST",
            url : $SCRIPT_ROOT + "/reschedule",
            data : { id : AttendanceExtra.reschedule_id,
                     from_date : AttendanceExtra.reschedule_from_date,
                     to_date : AttendanceExtra.reschedule_to_date },
            withCredentials: true,
            })
        .then(function(result) {
            // TODO: id doesn't reset nicely
            AttendanceExtra.reschedule_from_date = "";
            AttendanceExtra.reschedule_to_date = "";
            })
    },

    selected_extra : "",
    extra_practice_date : "",
    save_extra: function() {
        return m.request({
            method : "POST",
            url : $SCRIPT_ROOT + "/extra_practice",
            data : { id : AttendanceExtra.selected_extra,
                     date : AttendanceExtra.extra_practice_date },
            withCredentials: true,
            })
        .then(function(result) {
            // TODO: id doesn't reset nicely
            AttendanceExtra.extra_practice_date = "";
            })
    }
}

module.exports = AttendanceExtra