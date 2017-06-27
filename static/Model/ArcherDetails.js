var m = require("mithril")

var ArcherDetails = {
    current: {},
    load: function(id) {
      return m.request({
          method: "GET",
          url: $SCRIPT_ROOT + "/edit_archer",
          data: {id: id},
          withCredentials: true,
    })
    .then(function(result) {
        ArcherDetails.current = result;
        })
    },

   save: function() {
   return m.request({
       method: "POST",
       url: $SCRIPT_ROOT + "/edit_archer",
       data: ArcherDetails.current,
       withCredentials: true,
   })
   }
}

module.exports = ArcherDetails
