var m = require("mithril");
var DateRangeHandler = require("./DateRangeHandler");

var FormReviewHandler = function() {
    DateRangeHandler.call(this);
    form_rows = [];

    this.load = function(archer) {
        if (!this.validate()) {
            return;
        }
        that = this;  // Javascript is SILLY

        return m.request({
            method : "GET",
            url: $BASE_URL + "/review_form",
            data: {from_date : this.from_date,
                   to_date : this.to_date,
                   id : archer.id
                },
            })
        .then(function(result) {
                that.msg = "";
                that.date_to_notes = result.date_to_notes
            });
    };
}

FormReviewHandler.prototype = Object.create(DateRangeHandler.prototype);
FormReviewHandler.prototype.constructor = FormReviewHandler;

module.exports = FormReviewHandler
