var db = require("../db");
var autoIncrement = require("mongoose-auto-increment");
autoIncrement.initialize(db);

var graphSchema = new db.Schema({
	activityID : String,
	UV: Number,
	Speed: Number,
	time: Number
});

graphSchema.plugin(autoIncrement.plugin, "Graph");
var Graph = db.model("Graph", graphSchema);
module.exports = Graph;
