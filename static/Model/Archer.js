// src/models/User.js
var m = require("mithril")

var ArcherBase = {
    list: [],
    loadList: function() {
        return m.request({
            method: "GET",
            url: $SCRIPT_ROOT + "/get_archers",
            withCredentials: true,
        })
        .then(function(result) {
            ArcherBase.list = result
        })
    },

    getArcherByIndex: function(index) {
        return ArcherBase.list[index];
    },

   new_archer: {},
   save: function() {
   return m.request({
       method: "POST",
       url: $SCRIPT_ROOT + "/add_archer",
       data: ArcherBase.new_archer,
       withCredentials: true,
   })
   }
}

module.exports = ArcherBase
