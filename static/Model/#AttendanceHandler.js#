var m = require("mithril");

var AttendanceHandler = {
    date: "",
    rows: null,
    message: "",
    load: function() {
        if (AttendanceHandler.date == "") {
            return "";
        }
        return m.request({
            method : "GET",
            url: $SCRIPT_ROOT + "/attendance_list",
            data: {date : AttendanceHandler.date},
            withCredentials: true,
            })
        .then(function(result) {
                AttendanceHandler.rows = result.rows;
                AttendanceHandler.message = result.message;

                if (result.set_checked || "") {
                    [].forEach.call( AttendanceHandler.rows, function (element, index, array) {
                            AttendanceHandler.set_val_by_index(index,
                                                               "checked", true);
                        });
                }
            })
    },

    save_rows: function() {
        return m.request({
            method : "POST",
            url : $SCRIPT_ROOT + "/attendance_list",
            data: {rows : AttendanceHandler.rows, date : AttendanceHandler.date},
            withCredentials: true,
            })
        .then(function(result) {
                AttendanceHandler.message = result.message;
            })
    },

    add_row: function(new_row) {
        if (AttendanceHandler.rows == null) {
            return;
        }
        AttendanceHandler.rows.push(new_row);
    },

    set_val_by_index: function(id, key, val) {
        AttendanceHandler.rows[id][key] = val;
    },

};

module.exports = AttendanceHandler