var
  aws         = require('aws-sdk')
  cuid        = require('cuid'),
  sql         = require('sqlstring');

module.exports = class sdb {
  constructor() {
    aws.config.loadFromPath('aws.credentials.json');
    this.simpledb = new aws.SimpleDB({
      region        : 'US-East',
      endpoint  : 'https://sdb.amazonaws.com'
    });
    this.sdbDomain = 'nodeCalls'
  }

  phoneNumberExists(phoneNumber) {
    var ctx = this;
    return new Promise(function(resolve, reject) {
      ctx.getRowsByPhoneNumber(phoneNumber, 1)
      .then(function(existingRows) {
        // TODO: Date range checks, allow duplicates after X days?
        resolve(existingRows.hasOwnProperty('Items'))
      })
      .catch((err) => {
        console.log(err)
        reject(err)
      })
    })
  }

  getRowsByPhoneNumber(phone, limit = 100) {
    let ctx = this;
    return  new Promise(function(resolve, reject) {

      let query = sql.format("select * from `" + ctx.sdbDomain + "` where phone = ? limit ?", [phone, limit])
      console.log(query)

      let params = {
        SelectExpression: query, /* required */
        ConsistentRead: false,
        //NextToken: 'STRING_VALUE'
      };

      ctx.simpledb.select(params, function(err, data) {
        if (err) {
          reject(err)
        } // an error occurred
        else {
          console.log(data);
          resolve(data)       // successful response
        }
      })
    })
  }

  addRow(obj) {
    let ctx = this
    return new Promise(function(resolve, reject) {
      let rowId = cuid()
      let sdbAttributes   = []

      Object.keys(obj).forEach(function(anAttributeName) {
        sdbAttributes.push({
          Name  : anAttributeName,
          Value : obj[anAttributeName]
        });
      });

      ctx.simpledb.putAttributes({
        DomainName    : ctx.sdbDomain,
        ItemName      : rowId,
        Attributes    : sdbAttributes
      }, function(err,awsResp) {
        if (err) {
          console.log(err)
          reject(err);  //server error to user
        } else {
          resolve(rowId)
        }
      });
    })
  }
};