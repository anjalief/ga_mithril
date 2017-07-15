var m = require("mithril");

var ScoreHandler = require("../Model/ScoreHandler");
var Archer = require("../Model/Archer");

// UI Components
var DatePicker = require("./DatePicker");
var NameCell = require("./Helpers/NameCell");
var DistanceSelect = require("./Helpers/DistanceSelect");
var DeleteRow = require("./Helpers/DeleteRow");

var set_value = function(value, current_value) {
  return {value : value, selected : current_value == value};
}

var TargetSelect = {
    view: function(vnode) {
        return m("select", {onchange: vnode.attrs.onchange},
                 [ m("option", {value: "", disabled: 'disabled', selected: !vnode.attrs.value}, "Select Target"),
                   m("option", set_value("40cm", vnode.attrs.value), "40cm"),
                   m("option", set_value("60cm", vnode.attrs.value), "60cm"),
                   m("option", set_value("80cm", vnode.attrs.value), "80cm"),
                   m("option", set_value("120cm", vnode.attrs.value), "120cm")
                     ])
    }
};

var ScorePerRoundEntry = {
    view: function(vnode) {
        var archer = vnode.attrs.archer;
        var boxes = [];
        for (let i = 0; i < archer.number_rounds; i++) {
            boxes.push(m("input", {type : "number",
                            onchange : function() {
                            archer.score[i] = this.value;
                            ScoreHandler.set_total(archer);
                        }, value : archer.score[i]
                               }));
        }
        return m("div", boxes);
    }
};

var ScoreTableRow = {
    view: function(vnode) {
        var archer = vnode.attrs.archer;

        return m("tr", [ m("td", m(NameCell, {archer : archer,
                                value : archer.id || "",
                            onchange: m.withAttr("value", function(value) {
                                    archer.id = value;
                                    var selected_archer = Archer.getArcherById(value);
                                })
                        })
                    ),
                m("td", m(DistanceSelect, {
                    onchange: m.withAttr("value", function(value) {
                            archer.distance = value;
                        }),
                    value: archer.distance }
                        )
                    ),
                m("td", m(TargetSelect, {
                    onchange: m.withAttr("value", function(value) {
                            archer.target_size = value;
                        }),
                                value : archer.target_size })
                    ),
                m("td", m("input",
                           { type: "checkbox",
                                   onchange: m.withAttr("checked", function(checked) {
                                           archer.is_tournament = checked;
                                       }),
                                   checked: archer.is_tournament || false,
                                   })
                    ),
                m("td", m("input",
                           { type: "number",
                                   onchange: m.withAttr("value", function(value) {
                                           archer.number_rounds = value;
                                       }),
                                   value: archer.number_rounds
                                   })
                    ),
                m("td", m("input",
                           { type: "number",
                                   onchange: m.withAttr("value", function(value) {
                                           archer.arrows_per_round = value;
                                       }),
                                   value: archer.arrows_per_round
                                   })
                    ),
                m("td", m(ScorePerRoundEntry, {archer : archer})
                    ),
                m("td", m("input", {type: "number",
                                onchange: m.withAttr("value", function(value) {
                                  archer.total_score = value;
                              }),
                                value: archer.total_score
                        })
                    ),
                    m("td", m(DeleteRow, { onclick : function() {
                                    ScoreHandler.rows.splice(vnode.attrs.row_index, 1); }
                            })),
                ]
            )
    }
}

var ScoreTable = {
    view: function() {
        if (ScoreHandler.date == "") {
            return m("div", "Select a date to enter scores");
        }

        var header = m("tr", [ m("th", "Name"),
                               m("th", "Distance"),
                               m("th", "Target Size"),
                               m("th", "Is tournament?"),
                               m("th", "Number of Rounds"),
                               m("th", "Arrows per Round"),
                               m("th", "Score per Round"),
                               m("th", "Total Score"),
                           ] );

        table_rows = [];
        function createRows(element, index, array) {
            table_rows.push(m(ScoreTableRow,
                              {archer: element, row_index : index}));
        };
        [].forEach.call(ScoreHandler.rows, createRows);

        var submit_button = m("button", {type : "input",
                                         onclick : ScoreHandler.save_rows
            },
            "Save Scores");

        var add_row_button = m("button", {type : "input",
                                          onclick : function () {
                    ScoreHandler.add_row({"checked" : true})
                }},
            "Add Row");

        var assemble_table = m("table", {class : "center_table"}, [header, table_rows]);
        return m("div", [assemble_table,
                         m("div", ScoreHandler.message),
                         add_row_button,
                         submit_button]);
    }
}

module.exports = {
    view : function() {
        return  m("div",
                  [
                      m(DatePicker, {id : "date_picker_score",
                                     onchange: function() {
                                         ScoreHandler.date = this.value;
                                         ScoreHandler.load();
                              }, value : ScoreHandler.date}
                          ),
                      m(ScoreTable),
                   ]
            )
    }
}
