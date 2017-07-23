var today = new Date();

var today = new Date();
var dd = today.getDate();
var mm = today.getMonth()+1; //  January is 0
var yyyy = today.getFullYear();

if(dd<10) {
    dd = '0'+dd
        }

if(mm<10) {
    mm = '0'+mm
        }
var formatted_date = mm + '/' + dd + '/' + yyyy;

function DateRangeHandler() {
    this.to_date = formatted_date;
    this.from_date = "";
    this.msg = "Select date range to view records";
};

DateRangeHandler.prototype.reset = function() {
    this.to_date = formatted_date;
    this.from_date = "";
    this.msg = "Select date range to view records";
}
DateRangeHandler.prototype.set_to = function(new_to) {
    this.to_date = new_to;
}

DateRangeHandler.prototype.set_from = function(new_from) {
    this.from_date = new_from;
}

DateRangeHandler.prototype.validate = function() {
    if (this.to_date == "" ||
        this.from_date == "") {
        this.msg = "Please specify a start date and an end date";
        return false;
    }
    if (this.to_date < this.from_date) {
        this.msg = "Invalid date range: From Date must be earlier than To Date";
        return false;
    }
    return true;
}

module.exports = DateRangeHandler
