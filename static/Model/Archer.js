var m = require("mithril")

var Archer = {
    id_to_archer: [],
    loaded: false,
    loadList: function() {
        // set it here so that if it errors we don't keep trying
        Archer.loaded = true;
        return m.request({
            method: "GET",
            url: $BASE_URL + "/get_archers",
        })
        .then(function(result) {
            Archer.id_to_archer = result
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
   save: function() {
     console.log("trying to save");
   return m.request({
       method: "POST",
       url: $BASE_URL + "/add_archer",
       data: Archer.current_archer,
     //  "Content-type" : "application/json"
      //  withCredentials: true, // Not ready to erase this code
   })
   .then(function(result) {
     Archer.current_archer = {};
     Archer.msg = result.message;
   })
 },

}

module.exports = Archer
