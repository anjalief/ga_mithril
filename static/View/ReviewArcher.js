var m = require("mithril");

var ArcherDetails = require("../Model/ArcherDetails");
var AttendanceReviewHandler = require("../Model/AttendanceReviewHandler");
var ScoreReviewHandler = require("../Model/ScoreReviewHandler");
var DatePicker = require("./DatePicker");
var Chart = require("chart.js");


var DetailsView = {
    view: function() {

        var table = m("table",
                      [ m("tr", [ m("td", "Discipline"),
                                  m("td", ArcherDetails.current.discipline) ]),
                        m("tr", [ m("td", "Owns Equipment?"),
                                  m("td", ArcherDetails.current.owns_equipment) ]),
                        m("tr", [ m("td", "Draw Weight"),
                                  m("td", ArcherDetails.current.draw_weight) ]),
                        m("tr", [ m("td", "Draw Length"),
                                  m("td", ArcherDetails.current.draw_length) ]),
                        m("tr", [ m("td", "Equipment Description"),
                                  m("td", ArcherDetails.current.equipment_description) ]),
                        m("tr", [ m("td", "Distance"),
                                  m("td", ArcherDetails.current.distance) ]),
                        m("tr", [ m("td", "JOAD Day"),
                                  m("td", ArcherDetails.current.joad_day) ])
            ]
        );
        return m("div", {class : "floater"}, [m("h4", "Details"), table]);
    }
}

var AttendanceTable = {
    view: function() {
        if (AttendanceReviewHandler.msg != "") {
            return m("div", AttendanceReviewHandler.msg);
        }
        return  m("table",
                      [ m("tr", [ m("td", "Number of joad days attended"),
                                  m("td", AttendanceReviewHandler.joad_count) ]),
                        m("tr", [ m("td", "Number of joad days expected to attend"),
                                  m("td", AttendanceReviewHandler.expected_attendance) ]),
                        m("tr", [ m("td", "Number of extra practices"),
                                  m("td", AttendanceReviewHandler.extra_practice_count) ]),
                        m("tr", [ m("td", "Number of reschedules"),
                                  m("td", AttendanceReviewHandler.reschedule_rows.length) ]),
            ]
            );
    }
};


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
                    id : "myChart"}) ]);
    }
}
var DateRangeView = {
    view: function(vnode) {
        var handler = vnode.attrs.handler;
        return m("div", {class : "floater"}, [
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
                                 handler.load(ArcherDetails.current.id)}},
                         "View Records"),
                     m(vnode.attrs.display)
                     ]
            )
    }
}

module.exports = {
    oninit: function(vnode) { ArcherDetails.load(vnode.attrs.key);
                              AttendanceReviewHandler.load(vnode.attrs.key);
                              ScoreReviewHandler.load(vnode.attrs.key);
    },
    view: function() {
        return m("div",
        [
            m("h1", ArcherDetails.current.firstname + " "
              + ArcherDetails.current.lastname
              + " (" + ArcherDetails.current.id + ")"),
            m("h4", ArcherDetails.current.gender),
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
                })
            ]
                );
    }
}