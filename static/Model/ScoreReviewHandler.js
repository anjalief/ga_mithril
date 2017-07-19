var m = require("mithril");
var DateRangeHandler = require("./DateRangeHandler");
var LambdaHandler = require("./LambdaHandler");

var ScoreReviewHandler = function() {
    DateRangeHandler.call(this);
    score_rows = [];

    this.load = function(archer) {
        if (!this.validate()) {
            return;
        }
        that = this;  // Javascript is SILLY

        var params = {
            from_date : this.from_date,
            to_date : this.to_date,
            id : archer.id
        };
        LambdaHandler.invoke_lambda('review_scores',
          {queryStringParameters: params},
          function(result) {
            that.msg = "";
            that.score_rows = result.score_rows;
        })
    }
};

ScoreReviewHandler.prototype = Object.create(DateRangeHandler.prototype);
ScoreReviewHandler.prototype.constructor = ScoreReviewHandler;

module.exports = ScoreReviewHandler
