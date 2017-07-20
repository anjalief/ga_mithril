var m = require("mithril")
var UserHandler = require("../Model/UserHandler")
var SignIn = {
  view: function() {
    if (UserHandler.new_password_needed) {
      return m("div",
          [ m("h4", "Please change your password"),
            m("div", UserHandler.username),
            m("label.label", "Old Password"),
            m("input", {type : "password"}),
            m("label.label", "New Password"),
            m("input", {type : "password",
                onchange : function() {
                    UserHandler.new_password = this.value
                }
            }),
            m("label.label", "Re-type New Password"),
            m("input", {type : "password",
                onchange : function() {
                    UserHandler.new_password_confirm = this.value
                }
            }),
            m("div", UserHandler.msg),
            m("button", {onclick : UserHandler.changePassword}, "Change Password")
          ]
        )
    }
      return m("div",
          [ m("h4", "Please sign in"),
            m("label.label", "Username"),
            m("input", {type : "text",
              onchange : function() {
                  UserHandler.username = this.value;
                }
              }),
            m("label.label", "Password"),
            m("input", {type :"password",
                onchange : function() {
                  UserHandler.password = this.value;
                }
              }),
              m("div", UserHandler.msg),
            m("button", {onclick : UserHandler.login}, "Login")
          ]
        )
    }
}

module.exports = SignIn