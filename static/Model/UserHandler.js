var m = require("mithril");
var AWSCognito = require("amazon-cognito-identity-js")
var AWSSDK = require('aws-sdk');
var myConfig = require('./Config')
var LambdaHandler = require('./LambdaHandler')

AWSSDK.Config.region = myConfig.REGION;

const userPool = new AWSCognito.CognitoUserPool({
      UserPoolId: myConfig.USER_POOL_ID,
      ClientId: myConfig.CLIENT_ID,
});

var UserHandler = {
  new_password_needed: false,
  username: "",
  password: "",
  msg: "",
  cognitoUser: {},
  validateSession: function() {
      var cognitoUser = userPool.getCurrentUser();
      var isValid = false;

      if (cognitoUser != null) {
          cognitoUser.getSession(function(err, session) {
              if (err) {
                  alert(err);
                  return;
              }
              isValid = session.isValid();
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
                  var logins  = {};
                  var login = 'cognito-idp.' + myConfig.REGION + '.amazonaws.com/' + myConfig.USER_POOL_ID
                  logins[login] = session.getIdToken().getJwtToken()

                  AWSSDK.config.update({region: myConfig.REGION});
                  AWSSDK.config.credentials = new AWSSDK.CognitoIdentityCredentials({
                    IdentityPoolId : myConfig.ID_POOL_ID,
                    Logins : logins
                  });
              }
          });
      }
      return isValid;
  },
  login: function() {
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
    m.route.set('/sign_in');
  }
}

module.exports = UserHandler
