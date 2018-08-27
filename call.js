module.exports = class Call {
  constructor(sdbObject) {
    let allAttributes = {}
    this.id = sdbObject.Name
    sdbObject.Attributes.forEach(function(attr) {
      allAttributes[attr.Name] = attr.Value
    });

    this.phone = allAttributes.phone
    this.name = allAttributes.name
  }
}
