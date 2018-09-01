"use strict;"

var lambda_incoming_call = require('./lambda_incoming_call')
var lambda_call_list = require('./lambda_call_list')

λ = {
  lambda_incoming_call: undefined,
  lambda_call_list: undefined
}

exports.handler = function(event, context, callback) {
  let action = event.action

  switch(action) {
    case 'POST':
      λ.lambda_incoming_call = λ.lambda_incoming_call || new lambda_incoming_call()
      λ.lambda_incoming_call.recordCall(event, context, callback)
      break;

    case 'LIST':
      λ.lambda_call_list = λ.lambda_call_list || new lambda_call_list()
      λ.lambda_call_list.getRows(event, context, callback)
      break;
  }
}