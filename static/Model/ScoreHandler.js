var m = require("mithril");
var Archer = require("./Archer");
var LambdaHandler = require("./LambdaHandler")

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

        LambdaHandler.invoke_lambda('score_entry',
            {queryStringParameters: {date : ScoreHandler.date},
             httpMethod : 'GET'},
            function(result) {
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
        LambdaHandler.invoke_lambda('score_entry',
            {body: {rows : ScoreHandler.rows,
                    date : ScoreHandler.date},
             httpMethod : 'POST'},
             function(result) {
                ScoreHandler.message = result.message;
            })
    },
}

module.exports = ScoreHandler
