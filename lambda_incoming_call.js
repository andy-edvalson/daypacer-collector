"use strict;"

var sdb = require('./sdb')
var db = new sdb()

module.exports = class lambda_incoming_call {
  constructor() {}

  recordCall(event, context) {
    let phoneNumber = event['phone']
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
    var ctx = this;
    event.accepted = (accepted) ? "accepted" : "rejected"
    if (!accepted) {
      event.message = "Phone number already exists"
    }
    db.addRow(event).then(function(rowId) {
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