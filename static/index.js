// index.js
var m = require("mithril")

var UserList = require("./View/UserList")
var Layout = require("./View/Layout")
var AddArcher = require("./View/AddArcher")
var EditArcher = require("./View/EditArcher")
var Attendance = require("./View/Attendance")
var FormNotes = require("./View/FormNotes")
var Dash = require("./View/Dash")
var ReviewArcher = require("./View/ReviewArcher")
var ScoreEntry = require("./View/ScoreEntry")

    m.route(document.body, "/dash",  {
    "/dash": {
        render: function() {
            return m(Layout, m(Dash))
        }
    },
    "/add_archer": {
        render: function() {
            return m(Layout, m(AddArcher))
        }
    },
    "/attendance": {
        render: function() {
            return m(Layout, m(Attendance))
        }
    },
    "/score_entry": {
        render: function() {
            return m(Layout, m(ScoreEntry))
        }
    },
    "/form_notes": {
        render: function() {
            return m(Layout, m(FormNotes))
        }
    },
    "/edit_archer/:key": {
        render: function(vnode) {
            return m(Layout, m(EditArcher, vnode.attrs))
        }
    },
    "/review_archer/:key": {
        render: function(vnode) {
            return m(Layout, m(ReviewArcher, vnode.attrs))
        }
    },
})
