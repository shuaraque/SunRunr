var db = require("../db");

var userSchema = new db.Schema({
	email:	{ type: String, required: true, unique: true },
	name:	{ type: String, required: true },
	longitude:	{ type: Number, default: -110 },
	latitude:	{ type: Number, default: 32 },
	city:	{ type: String, default: "Tucson, Arizona, United States of America" },  
	hashedPassword: String,
	lastAccess:   { type: Date, default: Date.now },
	devices:      [ String ],
	uvThreshold:  { type: Number, default: 10 },
});

var User = db.model("User", userSchema);
module.exports = User;
