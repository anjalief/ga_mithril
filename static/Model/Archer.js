var m = require("mithril");
var UserHandler = require('./UserHandler');
var Config = require("./Config");

var Archer = {
    id_to_archer: [],
    loaded: false,
    cached_location: '',
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
            Archer.cached_region = Config.location;
            Archer.id_to_archer = result;
        })
        .catch(function(e) {
            console.log("ERROR getting archers")
            console.log(e.message);
        })
    },
    getList: function() {
      // if the location changed, we have to reload

      if (!Archer.loaded || Archer.cached_region != Config.location) {
         Archer.loadList();
      }

        return Archer.id_to_archer;
    },
    resetList: function() {
        Archer.loaded = false;
        Archer.id_to_archer = {};
    },
    getArcherById: function(id) {
        if (!Archer.loaded) {
            Archer.loadList();
            // we shouldn't really hit this because layout always calls loadList
            return false;
          }
          // client must check if ret value is valid
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
   reset : function() {
     Archer.msg = "";
     Archer.current_archer = {};
   },
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
           console.log(e.message);
       })
   },
   setCurrent: function(id) {
       Archer.current_archer = Archer.getArcherById(id)
   },
   remove: function() {
      UserHandler.validateSession();
      return m.request({
          method: "POST",
          url: Config.BASE_URL + "/remove_archer",
          data: Archer.current_archer.id,
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
          Archer.msg = "ERROR removing archers";
          console.log(e.message);
      })
   }
}

module.exports = Archer
