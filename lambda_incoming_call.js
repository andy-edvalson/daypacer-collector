"use strict;"

var sdb = require('./sdb')
var db = new sdb()

module.exports = class lambda_incoming_call {
  constructor() {}

  recordCall(event, context) {
    let phoneNumber = this.getIncomingParam(event, context, "phone", true)
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

    let newCall = {
      first_name: this.getIncomingParam(event, context, "first_name", true),
      last_name:  this.getIncomingParam(event, context, "last_name",  true),
      phone:      this.getIncomingParam(event, context, "phone",      true),
      city:       this.getIncomingParam(event, context, "city",       true),
      state:      this.getIncomingParam(event, context, "state",      true),
      zip:        this.getIncomingParam(event, context, "zip",        true),
      url:        this.getIncomingParam(event, context, "url",        true),
      vendor:     this.getIncomingParam(event, context, "vendor",     true),
      ip:         this.getIncomingParam(event, context, "ip",         true),
    }

    db.addRow(newCall).then(function(rowId) {
      return (accepted)
       ? ctx.sendAcceptResponse(event, context, rowId)
       : ctx.sendRejectResponse(event, context, "Phone number already exists")
    }).catch((err) => {
      this.sendErrorResponse(event, context, "Error Adding Row", err)
    })
  };

  getIncomingParam(event, context, name, required) {
    let val = event.body[name]
    if (required && !val) { this.sendRejectResponse(event, context, name + " is required") }
    return event.body[name] || ''
  }

  sendAcceptResponse(event, context, rowId) {
    event.response = {success: true, accepted: true, id: rowId}
    context.done(null, event);
  };

  sendRejectResponse(event, context, message) {
    event.response = {success: true, accepted: false, message: message}
    context.done(null, event);
  };

  sendErrorResponse(event, context, msg, err) {
    console.log(err)
    event.response = {success: false, message: msg, error: err}
    context.done(null, event);
  };
}