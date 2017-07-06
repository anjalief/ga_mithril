var m = require("mithril");
var DateRangeHandler = require("./DateRangeHandler");

var FormReviewHandler = function() {
    DateRangeHandler.call(this);
    form_rows = [];

    this.load = function(id) {
        if (!this.validate()) {
            return;
        }
        that = this;  // Javascript is SILLY

        return m.request({
            method : "GET",
            url: $SCRIPT_ROOT + "/review_form",
            data: {from_date : this.from_date,
                   to_date : this.to_date,
                   id : id
                },
            withCredentials: true,
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