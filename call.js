module.exports = class Call {
  constructor(sdbObject) {
    let allAttributes = {}
    this.id = sdbObject.Name
    sdbObject.Attributes.forEach(function(attr) {
      allAttributes[attr.Name] = attr.Value
    });

    this.phone = allAttributes.phone
    this.first_name = allAttributes.first_name
    this.last_name = allAttributes.last_name
    this.city = allAttributes.city
    this.state = allAttributes.state
    this.zip = allAttributes.zip
    this.url = allAttributes.url
    this.vendor = allAttributes.vendor
    this.ip = allAttributes.ip
  }
}
