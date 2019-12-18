var db = require("../db");
var autoIncrement = require("mongoose-auto-increment");
autoIncrement.initialize(db);

var activitySchema = new db.Schema({
	type: String,
	activityID : String,
	deviceID: String,
	UVSum: Number,
	beginTime: Number,
	endTime: Number,
	averageSpeed: Number,
	temperature: Number,
	humidity: Number,
	submissionTime: {type: Date, default: Date.now }
});

activitySchema.plugin(autoIncrement.plugin, "Activity");
var Activity = db.model("Activity", activitySchema);
module.exports = Activity;
