"use strict;"

var sdb = require('./sdb')
var db = new sdb()

module.exports = class lambda_incoming_call {
  constructor() {}

  recordCall(event, context) {
    let eventInput = (event.query.hasOwnProperty('phone') ? event.query : event.body)
    let phoneNumber = eventInput.phone
    // TODO: Require fields
    // TODO: Whitelist fields
    // TODO: Validate phone numbers
    db.phoneNumberExists(phoneNumber).then((exists) => {
      this.addRow(event, context, !exists)
    }).catch((err) => {
      this.sendErrorResponse(event, context, "Error Adding Row", err)
    })
  };

  addRow(event, context, accepted) {
    let eventInput = (event.query.hasOwnProperty('phone') ? event.query : event.body)
    var ctx = this;
    event.accepted = (accepted) ? "accepted" : "rejected"
    if (!accepted) {
      event.message = "Phone number already exists"
    }

    let newCall = {
      first_name: eventInput.first_name,
      last_name: eventInput.last_name,
      phone: eventInput.phone,
      city: eventInput.city,
      state: eventInput.state,
      zip: eventInput.zip,
      url: eventInput.url,
      vendor: eventInput.vendor,
      ip: eventInput.ip
    }

    db.addRow(newCall).then(function(rowId) {
      return (accepted)
       ? ctx.sendAcceptResponse(event, context, rowId)
       : ctx.sendRejectResponse(event, context)
    }).catch((err) => {
      this.sendErrorResponse(event, context, "Error Adding Row", err)
    })
  };

  sendAcceptResponse(event, context, rowId) {
    event.response = {success: true, accepted: true, id: rowId}
    context.done(null, event);
  };

  sendRejectResponse(event, context) {
    event.response = {success: true, accepted: false, message: event.message}
    context.done(null, event);
  };

  sendErrorResponse(event, context, msg, err) {
    console.log(err)
    event.response = {success: false, message: msg, error: err}
    context.done(null, event);
  };
}