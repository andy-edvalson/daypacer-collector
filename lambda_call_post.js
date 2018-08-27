"use strict;"

var sdb = require('./sdb')
var db = new sdb()

exports.handler = function(event, context) {
  new handleCallPost(event, context)
}

function handleCallPost (event, context) {
  var self = this;
  console.log(self)

  self.init = function() {
    self.validateData()
  };

  self.validateData = function() {
    let phoneNumber = event['phone']
    // TODO: Require fields
    // TODO: Whitelist fields
    // TODO: Validate phone numbers

    db.phoneNumberExists(phoneNumber).then((exists) => {
      if (exists) { return self.sendRejectResponse("Phone number already exists") }
      self.addRow()
    }).catch((err) => {
      self.sendErrorResponse("Error Adding Row", err)
    })
  };

  self.addRow = function() {
    db.addRow(event).then(function(rowId) {
      self.sendAcceptResponse(rowId)
    }).catch((err) => {
      self.sendErrorResponse("Error Adding Row", err)
    })
  };

  self.sendAcceptResponse = function(rowId) {
    event.response = {success: true, accepted: true, id: rowId}
    context.done(null, event);
  };

  self.sendRejectResponse = function(msg) {
    event.response = {success: true, accepted: false, message: msg}
    console.log(event.response)
    context.done(null, event);
  };

  self.sendErrorResponse = function(msg, err) {
    console.log(err)
    event.response = {success: false, message: msg, error: err}
    context.done(null, event);
  };

  this.init();
}