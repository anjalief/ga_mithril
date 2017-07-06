var m = require("mithril");

var AttendanceReviewHandler = {
    to_date: "",
    from_date: "",
    msg: "Select date range to view attendance records",
    attendance_rows: [],
    reschedule_rows: [],
    expected_attendance: "",
    joad_count: 0,
    extra_practice_count: 0,
    set_from : function(new_from) {
        AttendanceReviewHandler.from_date = new_from;
    },
    set_to : function(new_to) {
        AttendanceReviewHandler.to_date = new_to;
    },
    load : function(id) {
        if (AttendanceReviewHandler.to_date == "" ||
            AttendanceReviewHandler.from_date == "") {
            AttendanceReviewHandler.msg = "Please specify a start date and an end date";
            return "";
        }
        if (AttendanceReviewHandler.to_date < AttendanceReviewHandler.from_date) {
            AttendanceReviewHandler.msg = "Invalid date range: from date must be earlier than to date";
            return "";
        }
        return m.request({
            method : "GET",
            url: $SCRIPT_ROOT + "/review_attendance",
            data: {from_date : AttendanceReviewHandler.from_date,
                   to_date : AttendanceReviewHandler.to_date,
                   id : id
                },
            withCredentials: true,
            })
        .then(function(result) {
                AttendanceReviewHandler.msg = "";
                AttendanceReviewHandler.attendance_rows = result.attendance_rows;
                AttendanceReviewHandler.reschedule_rows = result.reschedule_rows;
                AttendanceReviewHandler.expected_attendance = result.expected_attendance;

                AttendanceReviewHandler.joad_count = 0;
                AttendanceReviewHandler.extra_practice_count = 0;
                AttendanceReviewHandler.attendance_rows.forEach(function(element) {
                        if (element.is_joad_practice) {
                            AttendanceReviewHandler.joad_count++;
                        } else {
                            AttendanceReviewHandler.extra_practice_count++;
                        }
                    });
            });
    }
}

module.exports = AttendanceReviewHandler