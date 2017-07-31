// index.js
var m = require("mithril");

var UserList = require("./View/UserList");
var Layout = require("./View/Layout");
var AddArcher = require("./View/AddArcher");
var EditArcher = require("./View/EditArcher");
var Attendance = require("./View/Attendance");
var FormNotes = require("./View/FormNotes");
var Dash = require("./View/Dash");
var Overview = require("./View/Overview");
var ReviewArcher = require("./View/ReviewArcher");
var ScoreEntry = require("./View/ScoreEntry");
var SignIn = require("./View/SignIn");
var UserHandler = require("./Model/UserHandler");

m.route(document.body, "/dash",  {
      "/sign_in": {
          render: function() {
              return m(SignIn)
          }
      },
    "/dash": {
        render: function() {
            if (!UserHandler.validateSession())
              return m(SignIn);
            return m(Layout, m(Dash))
        }
    },
    "/overview": {
        render: function() {
            if (!UserHandler.validateSession())
              return m(SignIn);
            return m(Layout, m(Overview))
        }
    },
    "/add_archer": {
        render: function() {
          if (!UserHandler.validateSession())
            return m(SignIn);
            return m(Layout, m(AddArcher))
        }
    },
    "/attendance": {
        render: function() {
          if (!UserHandler.validateSession())
            return m(SignIn);
            return m(Layout, m(Attendance))
        }
    },
    "/score_entry": {
        render: function() {
          if (!UserHandler.validateSession())
            return m(SignIn);
            return m(Layout, m(ScoreEntry))
        }
    },
    "/form_notes": {
        render: function() {
          if (!UserHandler.validateSession())
            return m(SignIn);
            return m(Layout, m(FormNotes))
        }
    },
    "/edit_archer/:key": {
        render: function(vnode) {
          if (!UserHandler.validateSession())
            return m(SignIn);
            return m(Layout, m(EditArcher, vnode.attrs))
        }
    },
    "/review_archer/:key": {
        render: function(vnode) {
          if (!UserHandler.validateSession())
            return m(SignIn);
            return m(Layout, m(ReviewArcher, vnode.attrs))
        }
    },
})
