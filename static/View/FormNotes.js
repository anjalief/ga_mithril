var m = require("mithril");
var FormHandler = require("../Model/FormHandler");
var DatePicker = require("./DatePicker");
var DeleteRow = require("./Helpers/DeleteRow");

var note_header = {
    view: function(vnode) {
        return m("tr", [ m("th", {class : "highlight"}, vnode.attrs.cell1),
                               m("th", "Status"),
                               m("th", "Note"),
                               m("th", "Added by") ] );
    }
}

var CategorySelecter = {
    view: function(vnode) {
        return m("select", {onchange:  vnode.attrs.onchange,
                            value : vnode.attrs.value,
                            disabled : vnode.attrs.disabled},
            [
                m("option", {value: "Select Category", disabled : true, selected : !vnode.attrs.value}, "Select Category"),
                m("option", {value: "Anchor"}, "Anchor"),
                m("option", {value: "Alignment"}, "Alignment"),
                m("option", {value: "Bow Arm"}, "Bow Arm"),
                m("option", {value: "Bow Grip"}, "Bow Grip"),
                m("option", {value: "Follow Through"}, "Follow Through"),
                m("option", {value: "Front Shoulder"}, "Front Shoulder"),
                m("option", {value: "Head Position"}, "Head Position"),
                m("option", {value: "New Equipment"}, "New Equipment"),
                m("option", {value: "Release"}, "Release"),
                m("option", {value: "Stance"}, "Stance")
                ]
            )
    }
};

var StatusSelecter = {
    view: function(vnode) {
        return m("select", {onchange:  vnode.attrs.onchange,
                            value : vnode.attrs.value},
            [ m("option", {value: "", disabled : true, selected : !vnode.attrs.value}, "Select Status"),
              m("option", {value: "Completed"}, "Completed"),
              m("option", {value: "In Progress (good)"}, "In Progress (good)"),
              m("option", {value: "In Progress (no change)"}, "In Progress (no change)"),
              m("option", {value: "On Hold"}, "On Hold"),
              m("option", {value: "Dropped"}, "Dropped")
                ]
            )
    }
};

var NoteBox = {
    view: function(vnode) {
        return m("textarea", {onchange:  vnode.attrs.onchange,
                              value : vnode.attrs.value})
    }
};

var InstructorBox = {
    view : function(vnode) {
        return m("input", {onchange : vnode.attrs.onchange,
                           value : vnode.attrs.value})
    }
}

var NotesCellInputter = {
    view: function(vnode) {
        var form_list = FormHandler.get_new_form_list(vnode.attrs.id);

        var table_rows = [];
        [].forEach.call( form_list, function (element, index, array) {
                var row = [
                    m("td", m(CategorySelecter,
                            {value : element.category,
                             disabled : element.must_enter || false,
                             onchange : function() {
                                  FormHandler.message = "";
                                  form_list[index].category = this.value}
                            })),
                    m("td", m(StatusSelecter,
                            {value : element.status,
                             onchange : function() {
                                    FormHandler.message = "";
                                    form_list[index].status = this.value}
                            })),
                    m("td", m(NoteBox, {value : element.note || "",
                                        onchange : function () {
                                    FormHandler.message = "";
                                    form_list[index].note = this.value}
                            })),
                    m("td", m(InstructorBox, {value : element.instructor || "",
                                              onchange : function () {
                                    FormHandler.message = "";
                                    form_list[index].instructor = this.value}
                            })),
                    m("td", m(DeleteRow, {must_enter : element.must_enter || false,
                                          onclick : function() {
                                    FormHandler.message = "";
                                    form_list.splice(index, 1); }
                            })),

                    ];
            table_rows.push(m("tr", row));
            });

        var add_row_button = m("button", {type : "input",
                                          onclick : function () {
                    FormHandler.message = "";
                    FormHandler.add_new_form_row(vnode.attrs.id);
                }
            },
            "Add Row");
        var cell1 = "";
        if (form_list.length != 0) {
            if (vnode.attrs.most_recent_date == FormHandler.date) {
                cell1 = "PREVIOUSLY ENTERED";
            }
        }

        var assembled_table = m("table", {class : "inner_table"},
                 [m(note_header, {cell1 : cell1}),
                  table_rows]);
        return m("div", [assembled_table, add_row_button]);
    }
}
var NotesCellPrev = {
    view: function(vnode) {
        if (!vnode.attrs.form_list) {
            return m("div", "No previous notes");
        }

        var table_rows = [];
        [].forEach.call( vnode.attrs.form_list, function (element, index, array) {
                var row = [ m("td", element.category),
                            m("td", element.status),
                            m("td", element.note),
                            m("td", element.instructor) ];
            table_rows.push(m("tr", row));
            });

        return m("table", {class : "inner_table"},
                                [ m(note_header, {cell1 : vnode.attrs.most_recent_date}),
                                  table_rows]);
    }
}

var FormRow = {
    view: function(vnode) {
        archer = vnode.attrs.archer;

        var name_cell = archer.firstname + " " + archer.lastname;

        return m("tr", [ m("td", vnode.attrs.row_index),
                         m("td", name_cell),
                         m("td", m(NotesCellPrev, {form_list : archer.form_list,
                                                   most_recent_date : archer.most_recent_date})),
                         m("td", m(NotesCellInputter, {
                              id : archer.id,
                              most_recent_date : archer.most_recent_date}))
                     ])
    }
};

var FormTable = {
    view: function(vnode) {
        if (FormHandler.date == "" || FormHandler.id_to_archer == null) {
            return m("div", "Select a date to enter form notes");
        }

        var header = m("tr",
                       [ m("th"),
                         m("th", "Name"),
                         m("th", "Most Recent Notes"),
                         m("th", "Today's Notes") ] );

        table_rows = [];
        var value;
        var count = 1;
        Object.keys(FormHandler.id_to_archer).forEach(function(key) {
                archer = FormHandler.id_to_archer[key];
                table_rows.push(m(FormRow,
                                  {archer : archer, row_index : count++}));
            });

        var submit_button = m("button", {type : "input",
                                         onclick : FormHandler.save_notes},
            "Save Notes");

        var assemble_table = m("table", {class : "center_table"}, [header, table_rows]);
        return m("div", [assemble_table,
                         m("h4", FormHandler.message),
                         submit_button]);
    }
}

module.exports = {
    view: function() {
        return m("div",
                 [ m(DatePicker, {id : "datepicker_form",
                                  onchange : function() {
                                 FormHandler.date = this.value;
                                 FormHandler.load();
                             },
                                  value : FormHandler.date }),
                     m(FormTable)
                     ]
            )
    }
}
