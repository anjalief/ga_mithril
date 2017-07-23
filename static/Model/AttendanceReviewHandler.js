var m = require("mithril");
var DateRangeHandler = require("./DateRangeHandler");
var UserHandler = require("./UserHandler");
var Config = require("./Config");

var AttendanceReviewHandler = function() {
    DateRangeHandler.call(this);
    this.regular_joad_dates = [];
    this.extra_practice_dates = [];
    this.expected_attendance = "";
    this.show_details = false;

    this.reset = function() {
        DateRangeHandler.prototype.reset.call(this);
        this.regular_joad_dates = [];
        this.extra_practice_dates = [];
        this.expected_attendance = "";
        this.show_details = false;
    };
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
        UserHandler.validateSession();  // refresh id token
        return m.request({
              method : "GET",
              url : Config.BASE_URL + "/review_attendance",
              headers: {
                "Authorization": UserHandler.id_token
              },
              data : params,
              })
        .then(function(result) {
            that.msg = "";
            that.regular_joad_dates= result.regular_joad_dates;
            that.extra_practice_dates= result.extra_practice_dates;
            that.expected_attendance = result.expected_attendance;
        })
        .catch(function(e) {
          console.log(e);
          that.msg = "Error: Unable to load records";
        })
    }
};

AttendanceReviewHandler.prototype = Object.create(DateRangeHandler.prototype);
AttendanceReviewHandler.prototype.constructor = AttendanceReviewHandler;


module.exports = AttendanceReviewHandler
