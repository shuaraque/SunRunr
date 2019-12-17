var db = require("../db");
var deviceSchema = new db.Schema({
	apikey: String,
	email: String,
	deviceID: String,
	lastContact: { type: Date, default: Date.now },
	activities : [ String ],
});

var Device = db.model("Device", deviceSchema);
module.exports = Device;
