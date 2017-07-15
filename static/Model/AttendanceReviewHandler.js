var m = require("mithril");
var DateRangeHandler = require("./DateRangeHandler");

var AttendanceReviewHandler = function() {
    DateRangeHandler.call(this);
    this.regular_joad_dates = [];
    this.extra_practice_count = [];
    this.expected_attendance = "";

    this.load = function(archer) {
        if (!this.validate()) {
            return;
        }
        that = this;  // Javascript is SILLY

        return m.request({
            method : "GET",
                    url: $BASE_URL + "/review_attendance",
                    data: {from_date : this.from_date,
                        to_date : this.to_date,
                        id : archer.id,
                        joad_day : archer.joad_day
                        }
          })
        .then(function(result) {
                that.msg = "";
                that.regular_joad_dates= result.regular_joad_dates;
                that.extra_practice_dates= result.extra_practice_dates;
                that.expected_attendance = result.expected_attendance;
            });
    }
};

AttendanceReviewHandler.prototype = Object.create(DateRangeHandler.prototype);
AttendanceReviewHandler.prototype.constructor = AttendanceReviewHandler;


module.exports = AttendanceReviewHandler
