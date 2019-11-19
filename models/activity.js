var db = require("../db");

var activitySchema = new db.Schema({
    deviceID: String,
    longitude: Number,
    latitude: Number,
    ultraviolet: Number,
    speed: Number,
    submissionTime: { type: Date, default: Date.now }
});

// Creates a Activity(s) collection in the database using the Activity schema
var Activity = db.model("Activity", activitySchema);

module.exports = Activity;
