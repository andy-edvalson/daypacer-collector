var
  aws         = require('aws-sdk'),
  simpledb;

const dbName = 'nodeCalls'

aws.config.loadFromPath('credentials.json');

//We'll use the Northern Virginia datacenter, change the region / endpoint for other datacenters http://docs.aws.amazon.com/general/latest/gr/rande.html#sdb_region
simpledb = new aws.SimpleDB({
  region    : 'US-East',
  endpoint  : 'https://sdb.amazonaws.com'
})

var params = {
  DomainName: dbName /* required */
};

simpledb.createDomain(params, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
});
;
