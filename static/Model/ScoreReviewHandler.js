var m = require("mithril");

var ScoreReviewHandler = {
    from_date : "",
    to_date : "",
    msg : "Select date range to view score records",
    score_rows : [],
    set_from : function(new_from) {
        ScoreReviewHandler.from_date = new_from;
    },
    set_to : function(new_to) {
        ScoreReviewHandler.to_date = new_to;
    },
    load : function(id) {
        if (ScoreReviewHandler.to_date == "" ||
            ScoreReviewHandler.from_date == "") {
            ScoreReviewHandler.msg = "Please specify a start and end date";
            return "";
        }
        if (ScoreReviewHandler.to_date < ScoreReviewHandler.from_date) {
            ScoreReviewHandler.msg = "Invalid date range: from date must be earlier than to date";
            return "";
        }
        return m.request({
            method : "GET",
            url: $SCRIPT_ROOT + "/review_score",
            data: {from_date : ScoreReviewHandler.from_date,
                   to_date : ScoreReviewHandler.to_date,
                   id : id
                },
            withCredentials: true,
            })
        .then(function(result) {
                ScoreReviewHandler.msg = "";
                ScoreReviewHandler.score_rows = result.score_rows;
            });
    }
}

module.exports = ScoreReviewHandler