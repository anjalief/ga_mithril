var m = require("mithril");
var DateRangeHandler = require("./DateRangeHandler");

var ScoreReviewHandler = function() {
    DateRangeHandler.call(this);
    score_rows = [];

    this.load = function(archer) {
        if (!this.validate()) {
            return;
        }
        that = this;  // Javascript is SILLY

        return m.request({
            method : "GET",
            url: $BASE_URL + "/review_scores",
            data: {from_date : this.from_date,
                   to_date : this.to_date,
                   id : archer.id
                },
            })
        .then(function(result) {
                that.msg = "";
                that.score_rows = result.score_rows;
            });
    }
};

ScoreReviewHandler.prototype = Object.create(DateRangeHandler.prototype);
ScoreReviewHandler.prototype.constructor = ScoreReviewHandler;

module.exports = ScoreReviewHandler
