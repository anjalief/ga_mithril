var m = require("mithril");
var AWSCognito = require("amazon-cognito-identity-js")
var AWSSDK = require('aws-sdk');

AWSSDK.Config.region = 'us-east-1';
var poolID = 'us-east-1_kNYzIyhAX';
var clientID = '5hirip2bfagqf5pq0gflihm13b';


const userPool = new AWSCognito.CognitoUserPool({
      UserPoolId: poolID,
      ClientId: clientID,
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
              // console.log('access token + ' + result.getAccessToken().getJwtToken());
              //
              //   //POTENTIAL: Region needs to be set if not already set previously elsewhere.
              //   AWS.config.region = '<region>';
              //
              //   AWS.config.credentials = new AWS.CognitoIdentityCredentials({
              //   IdentityPoolId : '...', // your identity pool id here
              //   Logins : {
              //       // Change the key below according to the specific region your user pool is in.
              //       'cognito-idp.<region>.amazonaws.com/<YOUR_USER_POOL_ID>' : result.getIdToken().getJwtToken()
              //   }
              // });

              // Instantiate aws sdk service objects now that the credentials have been updated.
              // example: var s3 = new AWS.S3();
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
