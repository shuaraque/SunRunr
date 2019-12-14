var db = require("../db");
var deviceSchema = new db.Schema({
<<<<<<< HEAD
    apikey:       String, // not sure what this is used for
    email:        String,
    deviceID:     String,
    lastContact:  { type: Date, default: Date.now }
=======
	apikey: String,
	email: String,
	deviceID:String,
	lastContact:  { type: Date, default: Date.now }
>>>>>>> 01ee1e7bb262b55d4a3d7200af12bd8947c5e1ad
});

var Device = db.model("Device", deviceSchema);
module.exports = Device;
