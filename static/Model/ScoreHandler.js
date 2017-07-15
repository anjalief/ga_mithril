var m = require("mithril");
var Archer = require("./Archer");

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
            url: $BASE_URL + "/score_entry",
            data: {date : ScoreHandler.date},
            })
        .then(function(result) {
                var rows = [];
                for (idx in result.rows) {
                  var row = result.rows[idx];
                  Archer.setArcherNamesById(row.id, row);
                  rows.push(row);
                }
                ScoreHandler.rows = rows;
                ScoreHandler.message = result.message;
            })
    },
    save_rows: function() {
        // TODO: validation? assert date != ""?
        return m.request({
            method : "POST",
            url : $BASE_URL + "/score_entry",
            data: {rows : ScoreHandler.rows, date : ScoreHandler.date},
            })
        .then(function(result) {
                ScoreHandler.message = result.message;
            })
    },
}

module.exports = ScoreHandler
