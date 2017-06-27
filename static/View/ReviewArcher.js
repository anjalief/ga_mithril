var m = require("mithril")
var ArcherDetails = require("../Model/ArcherDetails");

var DetailsView = {
    view: function() {
        return m("div", {class : "floater"},
        [
            m("h4", "Details"),
            m("label.label", "Discipline: "),
            m("div", ArcherDetails.current.discipline),
            m("label.label", "Owns Equipment? "),
            m("div", ArcherDetails.current.owns_equipment),
            m("label.label", "Draw Weight: "),
            m("div", ArcherDetails.current.draw_weight),
            m("label.label", "Draw Length: "),
            m("div", ArcherDetails.current.draw_length),
            m("label.label", "Equipment Description: "),
            m("div", ArcherDetails.current.equipment_description),
            m("label.label", "Distance: "),
            m("div", ArcherDetails.current.distance),
            m("label.label", "JOAD Day: "),
            m("div", ArcherDetails.current.joad_day),
            ])
    }
}

module.exports = {
    oninit: function(vnode) { ArcherDetails.load(vnode.attrs.key); },
    view: function() {
        return m("div",
        [
            m("h1", ArcherDetails.current.firstname + " "
              + ArcherDetails.current.lastname
              + " (" + ArcherDetails.current.id + ")"),
            m("h4", ArcherDetails.current.gender),
            m(DetailsView, {class : "floater"}),
            ]);
    }
}