// src/views/UserForm.js

var m = require("mithril");
var AttendanceHandler = require("../Model/AttendanceHandler");
var ArcherList = require("./UserList");
var DatePicker = require("./DatePicker");

var AttendanceExtra = require("../Model/AttendanceExtra");
var NameCell = require("./Helpers/NameCell");

var AttendanceRow = {
    view: function(vnode) {
        archer = vnode.attrs.archer;

        return m("tr", [ m("td", vnode.attrs.row_index + 1),
                         m("td", m(NameCell, {archer : archer,
                                         value : archer.id || "",
                                         onchange : function() {
                                             AttendanceHandler.set_val_by_index(
                                                 vnode.attrs.row_index, "id", this.value);
                                     }
                                 })
                             ),
                         m("td", [m("input",
                                    { type: "checkbox",
                                      checked: archer.checked || false,
                                      onchange: function() {
                                            AttendanceHandler.set_val_by_index(
                                                vnode.attrs.row_index, "checked", this.checked)}
                                    })]
                             )
                     ])
    }
};

var AttendanceTable = {
    view: function(vnode) {
        if (AttendanceHandler.date == "" || AttendanceHandler.rows == null) {
            return m("div", "Select a date to view attendance");
        }

        var header = m("tr", [ m("th"), m("th", "Name"), m("th", "Present?") ] );

        table_rows = [];
        function createRows(element, index, array) {
            table_rows.push(m(AttendanceRow,
                              {archer: element, row_index : index}));
        };
        [].forEach.call(AttendanceHandler.rows, createRows);

        var submit_button = m("button", {type : "input",
                                         onclick : AttendanceHandler.save_rows},
            "Enter Attendance");

        var add_row_button = m("button", {type : "input",
                                          onclick : function () {
                    AttendanceHandler.add_row({"checked" : true}) }},
            "Add Row");

        var assemble_table = m("table", {class : "center_table"}, [header, table_rows]);
        return m("div", [assemble_table,
                         m("div", AttendanceHandler.message),
                         add_row_button,
                         submit_button]);
    }
}

var AttendanceMain = {
    view: function() {
        return m("div", {class : "hdivider"},
                 [ m(DatePicker, {id : "datepicker_1",
                                  onchange : function() {
                                 AttendanceHandler.date = this.value;
                                 AttendanceHandler.load();
                             },
                                  value : AttendanceHandler.date }),
                     m(AttendanceTable)
]);
    }
}

var reschedule = {
    view: function() {
        return m("div", {class : "floater"},
                 [ m(ArcherList, {onchange : function() {
                                 AttendanceExtra.reschedule_id = this.value;
                             }, value : AttendanceExtra.reschedule_id }),
                     m("label", {for : "datepicker_from"}, "From:"),
                     m(DatePicker, {id : "datepicker_from",
                                    onchange : function() {
                                 AttendanceExtra.reschedule_from_date = this.value;
                             }, value : AttendanceExtra.reschedule_from_date }),
                     m("label.label", "To:"),
                     m(DatePicker, {id : "datepicker_to",
                                    onchange : function() {
                                 AttendanceExtra.reschedule_to_date = this.value;
                             }, value : AttendanceExtra.reschedule_to_date }),
                     m("button", {type : "input",
                                  onclick : AttendanceExtra.save_reschedule},
                         "Reschedule") ])
    }
}

var ExtraPractice = {
    view: function() {
        return m("div", {class : "floater"},
                 [ m(ArcherList, {onchange : function() {
                                 AttendanceExtra.selected_extra = this.value;
                             }, value : AttendanceExtra.selected_extra }),
                     m("label", "Date:"),
                     m(DatePicker, {id : "datepicker_extra",
                                    onchange : function() {
                                 AttendanceExtra.extra_practice_date = this.value;
                             }, value : AttendanceExtra.extra_practice_date }),
                     m("button", {type : "input",
                                  onclick : AttendanceExtra.save_extra},
                         "Add Extra Practice") ])
    }
}


module.exports = {
    view: function() {
        return m("div", [ m(AttendanceMain),
                          m(reschedule),
                          m(ExtraPractice)]);
     }
}
