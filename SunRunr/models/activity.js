var db = require("../db");
var autoIncrement = require("mongoose-auto-increment");
autoIncrement.initialize(db);

var activitySchema = new db.Schema({
	type: String,
	deviceID: String,
	activity: [{ 
		longitude: Number,
		latitude: Number,
		ultraviolet: Number,
		speed: Number
	}],
	beginTime: Number,
	endTime: Number,
	averageSpeed: Number,
	uvIndex: Number,
	temperature: Number,
	humidity: Number,
	submissionTime: {type: Date, default: Date.now }
});

activitySchema.plugin(autoIncrement.plugin, "Activity");
var activity = db.model("Activity", activitySchema);
module.exports = Activity;
