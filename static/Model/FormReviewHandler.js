var m = require("mithril");
var DateRangeHandler = require("./DateRangeHandler");
var LambdaHandler = require("./LambdaHandler")

var FormReviewHandler = function() {
    DateRangeHandler.call(this);
    form_rows = [];

    this.load = function(archer) {
        if (!this.validate()) {
            return;
        }
        that = this;  // Javascript is SILLY

        var params = {
            from_date : this.from_date,
            to_date : this.to_date,
            id : archer.id
          };
        LambdaHandler.invoke_lambda('review_form',
          {queryStringParameters: params},
          function(result) {
            that.msg = "";
            that.date_to_notes = result.date_to_notes
        })
    };
}

FormReviewHandler.prototype = Object.create(DateRangeHandler.prototype);
FormReviewHandler.prototype.constructor = FormReviewHandler;

module.exports = FormReviewHandler
