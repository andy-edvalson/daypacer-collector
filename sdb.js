var
  aws         = require('aws-sdk'),
  cuid        = require('cuid'),
  sql         = require('sqlstring');

  aws.config.loadFromPath('aws.credentials.json');

  var simpledb = new aws.SimpleDB({
    region        : 'US-East',
    endpoint  : 'https://sdb.amazonaws.com'
  });

  var sdbDomain = 'nodeCalls'

module.exports = class sdb {
  constructor() {
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

  getAllRows(limit = 100) {
    return  new Promise(function(resolve, reject) {

      let query = sql.format("select * from `" + sdbDomain + "` limit ?", [limit])
      console.log(query)

      let params = {
        SelectExpression: query, /* required */
        ConsistentRead: false,
      };
      simpledb.select(params, function(err, data) {
        if (err) {
          console.log("SDB", err)
          reject(err)
        } // an error occurred
        else {
          resolve(data)       // successful response
        }
      })

    })
  }

  getRowsByPhoneNumber(phone, limit = 100) {
    return  new Promise(function(resolve, reject) {

      let query = sql.format("select * from `" + sdbDomain + "` where phone = ? and accepted = ? limit ?", [phone, 'accepted', limit])
      console.log(query)

      let params = {
        SelectExpression: query, /* required */
        ConsistentRead: false,
        //NextToken: 'STRING_VALUE'
      };

      simpledb.select(params, function(err, data) {
        if (err) {
          console.log('err')
          reject(err)
        } // an error occurred
        else {
          resolve(data)       // successful response
        }
      })
    })
  }

  addRow(obj) {
    return new Promise(function(resolve, reject) {
      let rowId = cuid()
      let sdbAttributes   = []

      Object.keys(obj).forEach(function(anAttributeName) {
        sdbAttributes.push({
          Name  : anAttributeName,
          Value : obj[anAttributeName]
        });
      });

      sdbAttributes.push({
        Name: 'date',
        Value: new Date().toString()
      })

      simpledb.putAttributes({
        DomainName    : sdbDomain,
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