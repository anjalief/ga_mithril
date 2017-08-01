var m = require("mithril");

var ArcherDetails = require("../Model/ArcherDetails");
var AttendanceReviewHandlerMeta = require("../Model/AttendanceReviewHandler");
var ScoreReviewHandlerMeta = require("../Model/ScoreReviewHandler");
var FormReviewHandlerMeta = require("../Model/FormReviewHandler");
var DatePicker = require("./DatePicker");
var Chart = require("chart.js");

var AttendanceReviewHandler = new AttendanceReviewHandlerMeta();
var ScoreReviewHandler = new ScoreReviewHandlerMeta();
var FormReviewHandler = new FormReviewHandlerMeta();

var DetailsView = {
    view: function() {

        var table = m("table",
                      [ m("tr", [ m("td", "Discipline"),
                                  m("td", ArcherDetails.current_archer.discipline) ]),
                        m("tr", [ m("td", "Owns Equipment?"),
                                  m("td", ArcherDetails.current_archer.owns_equipment) ]),
                        m("tr", [ m("td", "Draw Weight"),
                                  m("td", ArcherDetails.current_archer.draw_weight) ]),
                        m("tr", [ m("td", "Draw Length"),
                                  m("td", ArcherDetails.current_archer.draw_length) ]),
                        m("tr", [ m("td", "Equipment Description"),
                                  m("td", ArcherDetails.current_archer.equipment_description) ]),
                        m("tr", [ m("td", "Distance"),
                                  m("td", ArcherDetails.current_archer.distance) ]),
                        m("tr", [ m("td", "JOAD Day"),
                                  m("td", ArcherDetails.current_archer.joad_day) ])
            ]
        );
        return m("div", {class : "floater"}, [m("h4", "Details"), table]);
    }
}

var AttendanceDetails = {
  view : function() {
      if (!AttendanceReviewHandler.show_details) {
          return m("button", {onclick : function() {
              AttendanceReviewHandler.show_details = true;
            }
          }, "Show Details"
        )
      }
      var joad_dates = "";
      AttendanceReviewHandler.regular_joad_dates.forEach(function(element) {
        joad_dates += element + " ";
      })
      var extra_dates = "";
      AttendanceReviewHandler.extra_practice_dates.forEach(function(element) {
        extra_dates += element + " ";
      })
      return m("div", [
                  m("h5", "JOAD DAYS:"), m("div", joad_dates),
                  m("h5", "EXTRA PRACTICES:"), m("div", extra_dates),
                  m("button", {onclick : function() {
                          AttendanceReviewHandler.show_details = false }}, "Hide Details")
                ]
              )
    }
}

var AttendanceTable = {
    view: function() {
        if (AttendanceReviewHandler.msg != "") {
            return m("div", AttendanceReviewHandler.msg);
        }
        return  m("div", [
                  m("table",
                      [ m("tr", [ m("td", "Number of joad days attended"),
                                  m("td", AttendanceReviewHandler.regular_joad_dates.length) ]),
                        m("tr", [ m("td", "Number of joad days expected to attend"),
                                  m("td", AttendanceReviewHandler.expected_attendance) ]),
                        m("tr", [ m("td", "Number of extra practices"),
                                  m("td", AttendanceReviewHandler.extra_practice_dates.length) ]),
                       ]),
                  m(AttendanceDetails)
                ]
            );
    }
};

var FormInnerTable = {
    view: function(vnode) {
        var rows = vnode.attrs.rows;
        var table_rows = []
        rows.forEach(function(element) {
                var row = [ m("td", element.category),
                            m("td", element.status),
                            m("td", element.note),
                            m("td", element.instructor) ];
                table_rows.push(m("tr", row));
            });

        return m("table", {class : "inner_table"}, table_rows);
    }
}

var FormTable = {
    view: function() {
        if (FormReviewHandler.msg != "") {
            return m("div", FormReviewHandler.msg);
        }

        var table_rows = [];
        for (date in FormReviewHandler.date_to_notes) {
            var notes = FormReviewHandler.date_to_notes[date];
            var row = [ m("td", date),
                        m("td", m(FormInnerTable, {rows : notes}))
                      ];
            table_rows.push(m("tr", row));
        }
        return m("table", {class : "center_table"}, table_rows);
     }
};




var ScoreDetails = {
  view : function() {
      if (!ScoreReviewHandler.show_details_btn) {
        return "";
      }
      if (!ScoreReviewHandler.show_details) {
          return m("button", {onclick : function() {
              ScoreReviewHandler.show_details = true;
            }
          }, "Show Details"
        )
      }
      var score_display = [];
      for (key in ScoreReviewHandler.score_rows) {
        var row = ScoreReviewHandler.score_rows[key];
        row.practice.forEach(function(element) {
          score_display.push(element);
        });
        row.tournament.forEach(function(element) {
          score_display.push(element);
        });
      }

      score_display.sort(function(a, b) {
          var dateA = a.date; // ignore upper and lowercase
          var dateB = b.date; // ignore upper and lowercase
          if (dateA < dateB) {
              return -1;
            }
          if (dateA > dateB) {
            return 1;
          }
          //  must be equal
          return 0;
        });

      var table_rows = [];
      var header = m("tr", [ m("th", "Date"),
                             m("th", "Distance"),
                             m("th", "Target Size"),
                             m("th", "Is tournament?"),
                             m("th", "Inner 10?"),
                             m("th", "# Rounds"),
                             m("th", "# Arrows"),
                             m("th", "Total Score"),
                             m("th", "Arrow Average"),
                             m("th", "Note"),
                         ] );
      table_rows.push(header);
      score_display.forEach(function(element) {
          var row = [
                m("td", {style : "width:100px" }, element.date.split("T00:00:00")[0]),
                m("td", element.distance),
                m("td", element.target_size),
                m("td", (element.is_tournament ? "Yes" : "No")),
                m("td", (element.is_inner10 ? "Yes" : "No")),
                m("td", element.number_rounds),
                m("td", element.arrows_per_round),
                m("td", element.total_score),
                m("td", (Math.round(element.arrow_average * 100) / 100)),
                m("td", {style : "width:200px" }, (element.note))
              ];
          element.score.forEach(function(round) {
              row.push(m("td", round));
          });
          table_rows.push(m("tr", row));
      });

      return m("div", [
                  m("table", {style : "text-align:center"}, table_rows),
                  m("button", {onclick : function() {
                          ScoreReviewHandler.show_details = false }}, "Hide Details")
                ]
              )
    }
}

// hopefully we don't have more than this many data sets to display
var html_colors = [
    "#800000", // maroon
    "#008000", // green
    "#008080", // teal
    "#800080", // purple
    "#00FFFF", // acqua
    "#FF0000", // red
    "#808000", // olive
    "#FF00FF", // fushcia
    "#000080", // navy
    "#00FF00", // lime
    "#FFFF00", // yellow
    "#0000FF", // blue
    "#C0C0C0", // silver
    "#000000", // black
    ];
var num_colors = html_colors.length;

var create_graph_cfg = function(color_count, key, is_tournament) {
    data_set = {};
    if (is_tournament) {
        data_set.pointStyle = "triangle";
    } else {
        data_set.pointStyle = "circle";
    }
    data_set.label = key;
    var color = html_colors[color_count % num_colors];
    data_set.pointBackgroundColor = color;
    data_set.borderColor = color;
    data_set.backgroundColor = color;
    data_set.data = [];
    return data_set;
}

var ScoreTable = {
    view: function() {
        if (ScoreReviewHandler.msg == "") {
            // build dataset from score rows
            // tournaments have different point type
            // target/distance differences have different colors
            var datasets = [];
            var labels = [];
            var color_count = 0;
            for (var key in ScoreReviewHandler.score_rows) {
                var val = ScoreReviewHandler.score_rows[key];
                var practice_data = create_graph_cfg(color_count, key, false);
                val.practice.forEach(function(element) {
                        data_dict = {x : element.date,
                                     y : element.arrow_average};
                        practice_data.data.push(data_dict);
                    });

                var tournament_data = create_graph_cfg(color_count, key, true);
                val.tournament.forEach(function(element) {
                        data_dict = {x : element.date,
                                     y : element.arrow_average};
                        tournament_data.data.push(data_dict);
                    });
                datasets.push(practice_data);
                datasets.push(tournament_data);
                labels.push( { text : key,
                            usePointStyle: true,
                            fillStyle : html_colors[color_count]
                            })
                color_count++;
            }

            var myChart = new Chart("myChart", {
                type: "scatter",
                responsive: false,
                data: {
                    datasets: datasets
                    },
                options: {
                    showLines: false,
                    fill: false,
                    scales: {
                        xAxes: [{
                                type: 'time',
                                unit: 'day',
                                position: 'bottom'
                                }]
                        },
                    legend: {
                        position: 'right',
                        onClick : function(e, legendItem) {
                                // show/hide tournament and non-tournament data sets together
                                var index = legendItem.datasetIndex;

                                let ci = this.chart;
                                [ci.getDatasetMeta(index),
                                 ci.getDatasetMeta(index + 1)].forEach(function(meta) {
                                         meta.hidden = meta.hidden === null? !ci.data.datasets[index].hidden : null;
                                     });
                                ci.update();
                            },
                        labels: {
                            filter : function(item, data) {
                                    if (item.pointStyle == "triangle") {
                                        return false;
                                    }
                                    return true;
                                }
                        }
                    }
                }
                });
        }

        return m("div", {class: "chart-container",
                         resize: "both",
                         overflow: "auto",
                         style: "resize: both; position: relative; height:auto; width:auto"},
            [ m("div", ScoreReviewHandler.msg), m("canvas", {
                    id : "myChart"}), m(ScoreDetails) ]);
    }
}
var DateRangeView = {
    view: function(vnode) {
        var handler = vnode.attrs.handler;
        return m("div", {class: vnode.attrs.class}, [
                     m("h4", vnode.attrs.title),
                     m("label.label", "From:"),
                     m(DatePicker, {id : "datepicker_from_" + vnode.attrs.id,
                                    onchange : function() {
                                 handler.set_from(this.value);
                             },
                         value : handler.from_date
                                 }),
                     m("label.label", "To:"),
                     m(DatePicker, {id : "datepicker_to_" + vnode.attrs.id,
                                 onchange : function() {
                                 handler.set_to(this.value);
                             },
                                 value:  handler.to_date
                                 }),
                     m("button", {type : "input",
                                 onclick : function () {
                                 handler.load(ArcherDetails.current_archer)}},
                         "View Records"),
                     m(vnode.attrs.display)
                     ]
            )
    }
}

module.exports = {
    oninit: function() {
        AttendanceReviewHandler.reset();
        ScoreReviewHandler.reset();
        FormReviewHandler.reset();
        ArcherDetails.reset();
    },
    view: function(vnode) {
        // have to do this inside view function here so it gets recalled
        // after ajax finishes
        ArcherDetails.setCurrent(vnode.attrs.key);

        if (!ArcherDetails.current_archer) {
            return m("div", "Loading...");
          }
        return m("div",
        [
            m("h1", ArcherDetails.current_archer.firstname + " "
              + ArcherDetails.current_archer.lastname
              + " (" + ArcherDetails.current_archer.id + ")"),
            m("h4", ArcherDetails.current_archer.gender),
            m(DetailsView, {class : "floater"}),
            m(DateRangeView, {
                    id : "attendance_review",
                    class : "floater",
                    title : "Attendance",
                    display : AttendanceTable,
                    handler : AttendanceReviewHandler
                }),
            m(DateRangeView, {
                id : "score_review",
                class : "floater",
                title : "Scores",
                display : ScoreTable,
                handler : ScoreReviewHandler
                }),
            m(DateRangeView, {
                id : "form_review",
                title : "Form Notes",
                class : "floater",
                display : FormTable,
                handler : FormReviewHandler})
            ]
                );
    }
}
