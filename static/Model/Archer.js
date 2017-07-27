var m = require("mithril")
var UserHandler = require('./UserHandler')
var Config = require("./Config")

var Archer = {
    id_to_archer: [],
    loaded: false,
    loadList: function() {
        // set it here so that if it errors we don't keep trying
        Archer.loaded = true;
        UserHandler.validateSession();  // refresh id token
        return m.request({
            method: "GET",
            url: Config.BASE_URL + "/get_archers",
            headers: {
              "Authorization": UserHandler.id_token
            },
          })
        .then(function(result) {
            Archer.id_to_archer = result;
        })
        .catch(function(e) {
            console.log("ERROR getting archers")
            console.log(e.message);
        })
    },
    getList: function() {
      if (!Archer.loaded) {
         Archer.loadList();
      }

        return Archer.id_to_archer;
    },
    getArcherById: function(id) {
      if (!Archer.loaded) {
         Archer.loadList();
      }
      // if we're still not loaded, this is probably off of a refresh
      // just redirect. Not worth trying to fix
      if (!Archer.loaded) {
          m.route.set('/dash');
      }
          return Archer.id_to_archer[id];
    },
    setArcherNamesById: function(id, row) {
      var archer = Archer.getArcherById(id);
      row["firstname"] = archer.firstname;
      row["lastname"] = archer.lastname;
      row["id"] = archer.id;
    },

   current_archer: {},
   msg : "",
   validate_archer : function(val, err) {
      if (!Archer.current_archer[val] || Archer.current_archer[val] == "") {
        Archer.msg = "Must specify " + err;
        return false;
      }
      return true;
   },
   save: function() {
     if (!Archer.validate_archer("firstname", "first name") ||
         !Archer.validate_archer("lastname", "last name") ||
         !Archer.validate_archer("gender", "gender") ||
         !Archer.validate_archer("byear", "birth year")) {
         return
       }

       UserHandler.validateSession();
       return m.request({
           method: "POST",
           url: Config.BASE_URL + "/add_archer",
           data: Archer.current_archer,
           headers: {
             "Authorization": UserHandler.id_token
           },
         })
       .then(function(result) {
            Archer.current_archer = {};
            Archer.msg = result.message;
            Archer.loadList();
       })
       .catch(function(e) {
           Archer.msg = "ERROR adding archers";
           console.log("ERROR adding archers")
           console.log(e.message);
       })
   },
}

module.exports = Archer
