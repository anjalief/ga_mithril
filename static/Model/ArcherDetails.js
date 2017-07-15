var m = require("mithril")
var Archer = require("./Archer")

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
    return m.request({
        method: "POST",
        url: $BASE_URL + "/edit_archer",
        data: ArcherDetails.current_archer,
      //  "Content-type" : "application/json"
       //  withCredentials: true, // Not ready to erase ArcherDetails code
    })
    .then(function(result) {
      ArcherDetails.msg = result;
    })
   }
}

module.exports = ArcherDetails
