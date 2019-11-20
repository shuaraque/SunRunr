var db = require("../db");

var deviceSchema = new db.Schema({
    apikey:       String, // not sure what this is used for
    email:        String,
    deviceID:     String,
    // lastContact:  { type: Date, default: Date.now }
});

var Device = db.model("Device", deviceSchema);

module.exports = Device;
