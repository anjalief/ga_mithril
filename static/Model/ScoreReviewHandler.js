var m = require("mithril");
var DateRangeHandler = require("./DateRangeHandler");
var UserHandler = require("./UserHandler");
var Config = require("./Config");

var ScoreReviewHandler = function() {
    this.show_details = false;
    this.show_details_btn = false;
    DateRangeHandler.call(this);
    score_rows = [];

    this.reset = function() {
        DateRangeHandler.prototype.reset.call(this);
        this.show_details = false;
        this.show_details_btn = false;
        score_rows = [];
    };

    this.load = function(archer) {
        if (!this.validate()) {
            return;
        }
        this.show_details_btn = true;
        that = this;  // Javascript is SILLY

        var params = {
            from_date : this.from_date,
            to_date : this.to_date,
            id : archer.id
        };
        UserHandler.validateSession();  // refresh id token
        return m.request({
                method : "GET",
                url : Config.BASE_URL + "/review_scores",
                headers: {
                  "Authorization": UserHandler.id_token
                },
                data : params,
        })
        .then(function(result) {
            that.msg = "";
            that.score_rows = result.score_rows;
        })
        .catch(function(e) {
            console.log(e.message);
            that.msg = "Error: Unable to load scores";
        })
    }
};

ScoreReviewHandler.prototype = Object.create(DateRangeHandler.prototype);
ScoreReviewHandler.prototype.constructor = ScoreReviewHandler;

module.exports = ScoreReviewHandler
