var m = require("mithril");
var DateRangeHandler = require("./DateRangeHandler");
var UserHandler = require("./UserHandler");
var Config = require("./Config");

var FormReviewHandler = function() {
    DateRangeHandler.call(this);
    form_rows = [];

    this.reset = function() {
        DateRangeHandler.prototype.reset.call(this);
        form_rows = [];
    };

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

        UserHandler.validateSession();  // refresh id token
        return m.request({
                method : "GET",
                url : Config.BASE_URL + "/review_form",
                headers: {
                  "Authorization": UserHandler.id_token
                },
                data : params,
                })
          .then(function(result) {
            that.msg = "";
            that.date_to_notes = result.date_to_notes
        })
        .catch(function(e) {
            console.log(e.message);
            that.msg = "Error: unable to load records";
        })
    };
}

FormReviewHandler.prototype = Object.create(DateRangeHandler.prototype);
FormReviewHandler.prototype.constructor = FormReviewHandler;

module.exports = FormReviewHandler
