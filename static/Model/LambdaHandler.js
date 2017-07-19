var AWSSDK = require('aws-sdk');
var myConfig = require('./Config');
var UserHandler = require('./UserHandler');
var m = require("mithril");

var LambdaHandler = {
    lambda: {},
    init_lambda: function() {
        if (!AWSSDK.config.credentials) {
          if (!UserHandler.setCredentials()) {
            console.log("Unable to set user credentials");
            return false;
          }
        }
        LambdaHandler.lambda = new AWS.Lambda();
        return true;
    },
    invoke_lambda: function(function_name, data, callback) {
      /// first initialize lambda
      if (!LambdaHandler.lambda.invoke) {
        if (!LambdaHandler.init_lambda()) {
          return false;
        }
      }
        var params = {
            FunctionName : myConfig.LAMBDA_PREFIX + function_name,
            InvocationType : 'RequestResponse',
            LogType : 'None',
            Payload : JSON.stringify(data)
          };
        AWSSDK.config.update({region: myConfig.REGION});
        LambdaHandler.lambda.invoke(params, function(err, data) {
        if (err) {
            console.log("ERR");
            console.log(err);
        } else {
            var results = JSON.parse(data.Payload);
            callback(JSON.parse(results['body']));
            m.redraw();  // loading is async
        }
      });
    }
}

module.exports = LambdaHandler
