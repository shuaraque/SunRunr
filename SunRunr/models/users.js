var db = require("../db");

var userSchema = new db.Schema({
  email:        { type: String, required: true, unique: true },
  name:         { type: String, required: true },
  hashedPassword: String,
  // lastAccess:   { type: Date, default: Date.now },
  devices:      [ String ],
});

var User = db.model("User", userSchema);

module.exports = User;
