var m = require("mithril");
var Archer = require("./Archer");
var UserHandler = require("./UserHandler");
var Config = require("./Config");

var FormHandler = {
    date: "",
    id_to_archer: null,
    message: "",
    load: function() {
        if (FormHandler.date == "") {
            return "";
        }

        UserHandler.validateSession();  // refresh id token
        return m.request({
              method : "GET",
              url : Config.BASE_URL + "/form_notes",
              headers: {
                "Authorization": UserHandler.id_token
              },
              data : {date : FormHandler.date},
              })
        .then(function(result) {
             var id_to_archer = result.id_to_archer;

             for (id in id_to_archer) {
               Archer.setArcherNamesById(id, id_to_archer[id]);

               // by default, current user enters values
               if (id_to_archer[id].new_form_list) {
                  id_to_archer[id].new_form_list.forEach(function(currentValue, index, array) {
                    currentValue.instructor = UserHandler.validated_user;
                  });
                }
             }
             FormHandler.message = result.message;
             FormHandler.id_to_archer = id_to_archer;
        })
        .catch(function(e) {
          FormHandler.message = "ERROR: Unable to load form notes";
          console.log(e.message);
        })
    },

    save_notes: function() {
        // Just pass the new form list
        var id_to_form_list = {};
        FormHandler.message = "";
        Object.keys(FormHandler.id_to_archer).forEach(function(key) {
                archer = FormHandler.id_to_archer[key];
                archer.new_form_list.forEach(function(element) {
                  // this is a ui thing, don't want to save it
                  delete element["must_enter"];

                  if (!element["category"]) {
                    FormHandler.message = "Missing category for " + archer.firstname + " " + archer.lastname;
                    return;
                  } else if (!element["status"]) {
                    FormHandler.message = "Missing status for " + archer.firstname + " " + archer.lastname;
                    return;
                  }
                });
                id_to_form_list[key] = archer.new_form_list;
            });
          if (FormHandler.message != "") {
            return;
          }

        UserHandler.validateSession();  // refresh id token
        return m.request({
                method : "POST",
                url : Config.BASE_URL + "/form_notes",
                headers: {
                  "Authorization": UserHandler.id_token
                },
                data : {id_to_form_list : id_to_form_list, date : FormHandler.date},
        })
        .then(function(result) {
            FormHandler.message = result.message;
        })
        .catch(function(e) {
            console.log(e.message);
            FormHandler.message = "Error: Unable to save form notes";
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
        FormHandler.id_to_archer[id].new_form_list.push({instructor : UserHandler.validated_user});
    },
};

module.exports = FormHandler
