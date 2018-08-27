"use strict;"

var sdb = require('./sdb');
var db = new sdb();
var Call = require('./call.js')

exports.handler = function(event, context, callback) {
  new handleCallGet(event, context, callback)
}

function handleCallGet (event, context, callback) {
  var self = this;

  self.init = function() {
    self.getRows()
  };

  self.getRows = function() {
    db.getAllRows().then((data) => {
      let rows = []
      if (data.hasOwnProperty("Items")) {
        data.Items.forEach((item) => {
          rows.push(new Call(item))
        })
      }
      self.sendDataResponse(rows)
    }).catch((err) => {
      self.sendErrorResponse("error fetching rows", err)
    })
  };

  self.sendDataResponse = function(data) {
    event.response = data
    callback(null, event)
  };

  self.sendErrorResponse = function(msg, err) {
    console.log("error: ", err)
    event.response = {success: false, message: msg, error: err}
    callback(null, event)
  };

  this.init();
}