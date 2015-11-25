var log = require("ringo/logging").getLogger(module.id);
var store = require("./store");

var Enquirer = module.exports = store.defineEntity("Enquirer", {
   "table": "t_enquirer",
   "id": {
      "column": "enq_id",
      "sequence": "enquirer_id"
   },
   "properties": {
      "created": {
         "column": "enq_created",
         "type": "timestamp"
      },
      "name": {
         "type": "string",
         "column": "enq_name",
         "length": 1000
      },
      "email": {
         "type": "string",
         "column": "enq_email",
         "length": 1000
      },
      "twitter": {
         "type": "string",
         "column": "enq_twitter",
         "length": 1000
      },
      "facebook": {
         "type": "string",
         "column": "enq_facebook",
         "length": 1000
      },
      "phone": {
         "type": "string",
         "column": "enq_phone",
         "length": 1000
      },
      "gaeCountry": {
         "type": "string",
         "column": "enq_gaecountry",
         "length": 1000
      },
      "gaeRegion": {
         "type": "string",
         "column": "enq_gaeregion",
         "length": 1000
      },
      "gaeCity": {
         "type": "string",
         "column": "enq_gaecity",
         "length": 1000
      },
      "gaeCityLatLong": {
         "type": "string",
         "column": "enq_gaelatlong",
         "length": 100
      }
   }
});

Enquirer.create = function(name, email, twitter, phone, gaeCountry, gaeRegion, gaeCity, gaeCityLatLong) {
   var enquirer = new Enquirer({
      "name": name,
      "email": email,
      "twitter": twitter,
      "facebook": "", // FIXME not supported right now
      "phone": phone,
      "gaeCountry": gaeCountry,
      "gaeRegion": gaeRegion,
      "gaeCity": gaeCity,
      "gaeCityLatLong": gaeCityLatLong,
      "created": new Date()
   });
   enquirer.save();
   return enquirer;
};

Enquirer.prototype.toString = function() {
   return "[Enquirer " + this.id + "]";
};