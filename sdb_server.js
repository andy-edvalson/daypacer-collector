var
  sdb         = require('./sdb')
  bodyParser  = require('body-parser'),
  express     = require('express')

module.exports = class sdb_server {
  constructor() {
    this.db  = new sdb();
    this.app = express();
    this.app.post('/call', bodyParser.json(), (req, res, next) => { this.validateData(req, res, next) });
  }

  start() {
    this.app.listen(3000, function () {
      console.log('SimpleDB-powered REST server started.');
    });
  }

  validateData(req, res, next) {
    let ctx = this;
    let phoneNumber = req.body['phone']
    // TODO: Whitelist fields
    this.db.phoneNumberExists(phoneNumber).then((exists) => {
      if (exists) { return this.sendRejectResponse(res, "Phone number already exists") }
      ctx.addRow(req, res, next)
    }).catch((err) => {
      ctx.sendErrorResponse(res, "Error Adding Row", err)
    })
  }

  addRow(req, res, next) {
    let ctx = this

    this.db.addRow(req.body).then(function(rowId) {
      ctx.sendAcceptResponse(res, rowId)
    }).catch((err) => {
      ctx.sendErrorResponse(res, "Error Adding Row", err)
    })
  }

  sendAcceptResponse(res, rowId) {
    res.send({status: 'ok', accepted: true, id: rowId})
  }

  sendRejectResponse(res, msg) {
    res.send({status: 'ok', accepted: false, message: msg})
  }

  sendErrorResponse(res, msg, err) {
    console.log(err)
    res.send({status: 'error', message: msg})
  }
}