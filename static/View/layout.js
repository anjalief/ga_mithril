var m = require("mithril")

var ArcherList = require("../View/UserList")


var state = {
    id: "",
    load_archer_details: function() {
        // TODO force select archer
        // save the state for this route in case user presses back button
        m.route.set(m.route.get(), null, {replace: true, state: {id: state.id}});

        // navigate away
        location.href = "#!/edit_archer/" + state.id
    },
    review_archer: function() {
        m.route.set(m.route.get(), null, {replace: true, state: {id: state.id}});
        location.href = "#!/review_archer/" + state.id
    }
};

module.exports = {
    oninit: function(vnode) {
        state.id = vnode.attrs.id || "" // populated from the `history.state` property if the user presses the back button
  },
    view: function(vnode) {
        return m("main.layout", [
                     m("nav.sidenav", [
                           m("a[href='/dash']", {oncreate: m.route.link}, "Dash"),
                           m("a[href='/add_archer']", {oncreate: m.route.link}, "Add Archer"),
                           m("a[href='/attendance']", {oncreate: m.route.link}, "Manage Attendance"),
                           m("a[href='/form_notes']", {oncreate: m.route.link}, "Enter Form Notes"),
                           m("a[href='/score_entry']", {oncreate: m.route.link}, "Enter Scores"),
                           m(ArcherList,
                               {onchange: m.withAttr("value", function(value)
                                   { state.id = value; } )
                               },
                               { value: state.id }
                             ),
                           m("a", {onclick: state.load_archer_details}, "Edit Archer Details"),
                           m("a", {onclick: state.review_archer}, "Review Archer")
                           ]),
                     m("section", vnode.children)
                     ])
    }
}
