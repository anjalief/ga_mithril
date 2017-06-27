var m = require("mithril");


var ScoreHandler = {
    date: "",
    rows: [],
    message: "",
    add_row: function() {
        var new_row = {};
        new_row.score = [];
        ScoreHandler.rows.push(new_row);
    },
    set_total: function(archer) {
        var sum = 0;
        archer.score.forEach(function(element, index, array) {
                var i = parseInt(element);
                if (!i) {
                    return;
                }
                sum += i;
            }
        )
        archer.total_score = sum;
    },
    load: function() {
        if (ScoreHandler.date == "") {
            return "";
        }
        return m.request({
            method : "GET",
            url: $SCRIPT_ROOT + "/score_entry",
            data: {date : ScoreHandler.date},
            withCredentials: true,
            })
        .then(function(result) {
                ScoreHandler.rows = result.rows;
                ScoreHandler.message = result.message;
            })
    },
    save_rows: function() {
        // TODO: validation? assert date != ""?
        return m.request({
            method : "POST",
            url : $SCRIPT_ROOT + "/score_entry",
            data: {rows : ScoreHandler.rows, date : ScoreHandler.date},
            withCredentials: true,
            })
        .then(function(result) {
                ScoreHandler.message = result.message;
            })
    },
}

module.exports = ScoreHandler