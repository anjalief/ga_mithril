var m = require("mithril");
var Archer = require("./Archer");
var LambdaHandler = require("./LambdaHandler")

var ScoreHandler = {
    date: "",
    rows: [],
    message: "",
    disable_submit_btn: false,
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

        var parts = ScoreHandler.date.split('/');
        var month_offset = 1;
        var date_obj = new Date(parts[2],parts[0]-month_offset,parts[1]);
        var today = new Date();
        if (date_obj > today) {
          ScoreHandler.disable_submit_btn = true;
          ScoreHandler.rows = [];
          ScoreHandler.message = "Cannot enter scores for dates that haven't happened";
          return;
        }
        ScoreHandler.disable_submit_btn = false;

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
        ScoreHandler.message = "";
        var validate_row = function(row, val, index) {
            if (!(val in row) || row[val] == "") {
              ScoreHandler.message = "Missing " + val +  " in row " + (parseInt(index) + 1);
              return false;
            }
            return true;
        }
        for (var index in ScoreHandler.rows) {
            var row = ScoreHandler.rows[index];
            console.log(row);
            if (!validate_row(row, "id", index) ||
                !validate_row(row, "number_rounds", index) ||
                !validate_row(row, "arrows_per_round", index) ||
                !validate_row(row, "target_size", index) ||
                !validate_row(row, "distance", index) ||
                !validate_row(row, "total_score", index)) {
                  return;
            }
        }

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
