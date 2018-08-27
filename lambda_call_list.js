"use strict";

var sdb = require('./sdb')
var Call = require('./call.js')

exports.handler = function(event, context) {
  var self = this;

  self.init = function(event, context) {
    self.event = event;
    self.context = context;
    self.db = new sdb();
    self.getRows()
  };

  self.getRows = function() {
    self.db.getAllRows().then((data) => {
      let rows = []
      console.log("Items: ", data.Items)
      if (data.hasOwnProperty("Items")) {
        data.Items.forEach((item) => {
          rows.push(new Call(item))
        })
      }
      self.sendDataResponse(rows)
    }).catch((err) => {
      self.sendErrorResponse("error fetching rows", err)
    })
  }

  self.sendDataResponse = function(data) {
    self.event.response = data
    context.done(null, self.event)
  }

  self.sendErrorResponse = function(msg, err) {
    console.log(err)
    self.event.response = {success: false, message: msg, error: err}
    context.done(null, self.event);
  };

  this.init(event, context);
}