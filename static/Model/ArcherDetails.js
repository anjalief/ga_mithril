var m = require("mithril")
var Archer = require("./Archer")
var LambdaHandler = require("./LambdaHandler")

var ArcherDetails = {
    current_archer: {},
    setCurrent: function(id) {
      ArcherDetails.current_archer = Archer.getArcherById(id);
      ArcherDetails.msg = "";
    },
    setCurrentValue: function(attr, value) {
      ArcherDetails.current_archer[attr] = value;
      ArcherDetails.msg = "Unsaved Changes"
    },
    saveDetails: function() {
      LambdaHandler.invoke_lambda('edit_archer',
        {body: ArcherDetails.current_archer},
        function(result) {
          ArcherDetails.msg = result;
      })
   }
}

module.exports = ArcherDetails
