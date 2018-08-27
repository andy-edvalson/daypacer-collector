"use strict;"

var sdb = require('./sdb')

exports.handler = function(event, context) {
  var self = this;

  self.init = function(event, context) {
    self.event = event;
    self.context = context;
    self.db = new sdb();
    self.validateData(event)
  };

  self.validateData = function(obj) {
    let phoneNumber = obj['phone']
    // TODO: Require fields
    // TODO: Whitelist fields
    // TODO: Validate phone numbers

    self.db.phoneNumberExists(phoneNumber).then((exists) => {
      if (exists) { return self.sendRejectResponse("Phone number already exists") }
      self.addRow(obj)
    }).catch((err) => {
      self.sendErrorResponse("Error Adding Row", err)
    })
  };

  self.addRow = function(obj) {
    this.db.addRow(obj).then(function(rowId) {
      self.sendAcceptResponse(rowId)
    }).catch((err) => {
      self.sendErrorResponse("Error Adding Row", err)
    })
  };

  self.sendAcceptResponse = function(rowId) {
    self.event.response = {success: true, accepted: true, id: rowId}
    self.context.done(null, self.event);
  };

  self.sendRejectResponse = function(msg) {
    self.event.response = {success: true, accepted: false, message: msg}
    context.done(null, self.event);
  };

  self.sendErrorResponse = function(msg, err) {
    console.log(err)
    self.event.response = {success: false, message: err}
    context.done(null, self.event);
  };

  this.init(event, context);
}