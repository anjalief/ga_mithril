var m = require("mithril");
var DateRangeHandler = require("./DateRangeHandler");

var AttendanceReviewHandler = function() {
    DateRangeHandler.call(this);
    this.attendance_rows = [];
    this.reschedule_rows = [];
    this.expected_attendance = "";
    this.joad_count = 0;
    this.extra_practice_count = 0;

    this.load = function(id) {
        if (!this.validate()) {
            return;
        }
        that = this;  // Javascript is SILLY

        return m.request({
            method : "GET",
                    url: $SCRIPT_ROOT + "/review_attendance",
                    data: {from_date : this.from_date,
                        to_date : this.to_date,
                        id : id
                        },
                    withCredentials: true,
                    })
        .then(function(result) {
                that.msg = "";
                that.attendance_rows = result.attendance_rows;
                that.reschedule_rows = result.reschedule_rows;
                that.expected_attendance = result.expected_attendance;

                that.joad_count = 0;
                that.extra_practice_count = 0;
                that.attendance_rows.forEach(function(element) {
                        if (element.is_joad_practice) {
                            that.joad_count++;
                        } else {
                            that.extra_practice_count++;
                        }
                    });
            });
    }
};

AttendanceReviewHandler.prototype = Object.create(DateRangeHandler.prototype);
AttendanceReviewHandler.prototype.constructor = AttendanceReviewHandler;


module.exports = AttendanceReviewHandler