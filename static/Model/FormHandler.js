var m = require("mithril");
var Archer = require("./Archer");

var FormHandler = {
    date: "",
    id_to_archer: null,
    message: "",
    load: function() {
        if (FormHandler.date == "") {
            return "";
        }
        return m.request({
            method : "GET",
            url: $BASE_URL + "/form_notes",
            data: {date : FormHandler.date},
            })
        .then(function(result) {
            var id_to_archer = result.id_to_archer;

            for (id in id_to_archer) {
              Archer.setArcherNamesById(id, id_to_archer[id]);
            }
            FormHandler.message = result.message;
            FormHandler.id_to_archer = id_to_archer;
            });
    },

    save_notes: function() {
        // Just pass the new form list
        var id_to_form_list = {};
        Object.keys(FormHandler.id_to_archer).forEach(function(key) {
                archer = FormHandler.id_to_archer[key];
                id_to_form_list[key] = archer.new_form_list;
            });
        return m.request({
            method : "POST",
            url : $BASE_URL + "/form_notes",
                    data: {id_to_form_list : id_to_form_list, date : FormHandler.date},
            })
        .then(function(result) {
                FormHandler.message = result.message;
            })
    },

    get_new_form_list: function(id) {
        if (FormHandler.id_to_archer[id].new_form_list == null) {
            FormHandler.id_to_archer[id].new_form_list = [];
        }
        return FormHandler.id_to_archer[id].new_form_list;
    },

    get_most_recent_date: function(id) {
        if (FormHandler.id_to_archer[id].most_recent_date) {
            return FormHandler.id_to_archer[id].most_recent_date;
          }
          return "";
    },

    add_new_form_row: function(id) {
        if (FormHandler.id_to_archer[id].new_form_list == null) {
            FormHandler.id_to_archer[id].new_form_list = [];
        }
        FormHandler.id_to_archer[id].new_form_list.push({});
    },
};

module.exports = FormHandler
