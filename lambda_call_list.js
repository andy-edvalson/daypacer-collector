"use strict;"

var sdb = require('./sdb');
var db = new sdb();
var Call = require('./call.js')

module.exports = class lambda_call_list {

  getRows(event, context, callback) {
    var ctx = this;
    db.getAllRows().then((data) => {
      let rows = []
      if (data.hasOwnProperty("Items")) {
        data.Items.forEach((item) => {
          rows.push(new Call(item))
        })
      }
      ctx.sendDataResponse(event, context, callback, rows)
    }).catch((err) => {
      ctx.sendErrorResponse(event, context, callback, "error fetching rows", err)
    })
  };

  sendDataResponse(event, context, callback, data) {
    event.response = data
    callback(null, event)
  };

  sendErrorResponse(event, context, callback, msg, err) {
    console.log("error: ", err)
    event.response = {success: false, message: msg, error: err}
    callback(null, event)
  };

}