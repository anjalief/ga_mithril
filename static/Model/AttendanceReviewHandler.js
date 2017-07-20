var m = require("mithril");
var DateRangeHandler = require("./DateRangeHandler");
var LambdaHandler = require("./LambdaHandler")

var AttendanceReviewHandler = function() {
    DateRangeHandler.call(this);
    this.regular_joad_dates = [];
    this.extra_practice_dates = [];
    this.expected_attendance = "";
    this.show_details = false;

    this.load = function(archer) {
        if (!this.validate()) {
            return;
        }
        that = this;  // Javascript is SILLY

        var params = {
            from_date : this.from_date,
            to_date : this.to_date,
            id : archer.id,
            joad_day : archer.joad_day
          };
        LambdaHandler.invoke_lambda('review_attendance',
          {queryStringParameters: params},
          function(result) {
            that.msg = "";
            that.regular_joad_dates= result.regular_joad_dates;
            that.extra_practice_dates= result.extra_practice_dates;
            that.expected_attendance = result.expected_attendance;
        })
    }
};

AttendanceReviewHandler.prototype = Object.create(DateRangeHandler.prototype);
AttendanceReviewHandler.prototype.constructor = AttendanceReviewHandler;


module.exports = AttendanceReviewHandler
