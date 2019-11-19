var db = require("../db");

var activitySchema = new db.Schema({
    deviceID: String,
    longitude: Number,
    latitude: Number,
    ultraviolet: Number,
    speed: Number,
    submissionTime: { type: Date, default: Date.now }
});

// Creates a Devices (plural) collection in the db using the device schema
var Activity = db.model("Activity", activitySchema);

module.exports = Activity;
