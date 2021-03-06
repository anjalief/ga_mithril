var m = require("mithril");
var AWSCognito = require("amazon-cognito-identity-js")
var AWSSDK = require('aws-sdk');
var myConfig = require('./Config');

var userPool;

var UserHandler = {
  new_password_needed: false,
  username: "",
  password: "",
  msg: "",
  validated_user: "",
  cognitoUser: {},
  id_token: null,
  validateSession: function() {
      if (!userPool) {
        return false;
      }
      var cognitoUser = userPool.getCurrentUser();
      var isValid = false;

      if (cognitoUser != null) {
          cognitoUser.getSession(function(err, session) {
              if (err) {
                  alert(err);
                  return;
              }

              isValid = session.isValid();
              // refresh credentials
              UserHandler.validated_user = cognitoUser.username;
              UserHandler.id_token = session.getIdToken().getJwtToken();
          });
      }
      return isValid;
  },
  setCredentials: function() {
      var cognitoUser = userPool.getCurrentUser();

      if (cognitoUser != null) {
          cognitoUser.getSession(function(err, session) {
              if (err) {
                  alert(err);
                  return;
              }
              isValid = session.isValid();
              if (isValid) {
                // refresh?
              }
          });
      }
      return isValid;
  },
  login: function() {
    myConfig.set_config(); // make sure we've updated region
    AWSSDK.Config.region = myConfig.REGION;
    userPool = new AWSCognito.CognitoUserPool({
          UserPoolId: myConfig.USER_POOL_ID,
          ClientId: myConfig.CLIENT_ID,
    });
    var userData = {
        Username : UserHandler.username,
        Pool : userPool
      };

      UserHandler.cognitoUser = new AWSCognito.CognitoUser(userData);

        var authenticationData = {
          Username : UserHandler.username,
          Password : UserHandler.password,
        };

        var authenticationDetails = new AWSCognito.AuthenticationDetails(authenticationData);

        UserHandler.cognitoUser.authenticateUser(authenticationDetails, {
          onSuccess: function (result) {
              UserHandler.id_token = result.getIdToken().getJwtToken();
              m.route.set('/dash');
        },

        onFailure: function(err) {
            alert(err);
        },
        newPasswordRequired: function(userAttributes, requiredAttributes) {
          UserHandler.new_password_needed = true;
          m.redraw();
        }
      });
  },
  old_password : "",
  new_password : "",
  new_password_confirm : "",
  changePassword: function() {
    if (UserHandler.new_password != UserHandler.new_password_confirm) {
      UserHandler.msg = "Error: Passwords do not match";
      return;
    }

    UserHandler.cognitoUser.completeNewPasswordChallenge(UserHandler.new_password, {}, {
            onSuccess: function(result) {
              UserHandler.msg = "Password Changed";
              // TODO : route to login page
        },
            onFailure: function(error) {
                UserHandler.msg = error.message;
          }
      })
  },
  signOut: function() {
    var cognitoUser = userPool.getCurrentUser()
    cognitoUser.signOut();
    UserHandler.id_token = null;
    UserHandler.validated_user = "";
    m.route.set('/sign_in');
  }
}

module.exports = UserHandler
