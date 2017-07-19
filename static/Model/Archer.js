var m = require("mithril")
var LambdaHandler = require('./LambdaHandler')
var LambdaHandler = require("./LambdaHandler")

var Archer = {
    id_to_archer: [],
    loaded: false,
    loadList: function() {
        // set it here so that if it errors we don't keep trying
        LambdaHandler.invoke_lambda('get_archers', {}, function(result) {
          Archer.id_to_archer = result;
          Archer.loaded = true;
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
     LambdaHandler.invoke_lambda(
          'add_archer',
          {body: Archer.current_archer},
          function(result) {
              Archer.current_archer = {};
              Archer.msg = result.message;
     })
   },
}

module.exports = Archer
