var m = require("mithril");
var Archer = require("./Archer");
var UserHandler = require("./UserHandler");
var Config = require("./Config")

var ArcherDetails = {
    current_archer: {},
    reset: function() {
        ArcherDetails.msg = "";
        ArcherDetails.current_archer = {};
    },
    setCurrent: function(id) {
        ArcherDetails.current_archer = Archer.getArcherById(id)
    },
    setCurrentValue: function(attr, value) {
        ArcherDetails.current_archer[attr] = value;
        ArcherDetails.msg = "Unsaved Changes";
    },
    saveDetails: function() {
        UserHandler.validateSession();  // refresh id token
        return m.request({
          method: "POST",
          url: Config.BASE_URL + "/edit_archer",
          data: ArcherDetails.current_archer,
          headers: {
            "Authorization": UserHandler.id_token
          },
    })
    .then(function(result) {
        ArcherDetails.msg = result;
    })
    .catch(function(e) {
        ArcherDetails.msg = "ERROR: Details not updated"
        console.log(e.message);
    })
   }
}

module.exports = ArcherDetails
