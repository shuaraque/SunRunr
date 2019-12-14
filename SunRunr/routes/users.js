let express = require('express');
let router = express.Router();
let User = require("../models/users");
let Device = require("../models/device");
let Activity = require("../models/activity");
let fs = require('fs');
let bcrypt = require("bcryptjs");
let jwt = require("jwt-simple");
var secret = fs.readFileSync(__dirname + '/../jwtkey.txt').toString();

// Helper functions 

// pre: a String email
// post: returns true if the email is in standard email-format, false otherwise
function validEmail(email) {
   var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
   return re.test(String(email).toLowerCase());
}

// pre: a String password
// post: returns true if the password is at least 8 characters long with at least 1 lower, 1 upper, 1 number, and 1 special character,
//       false otherwise
function strongPassword(password) {
   var re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
   return re.test(String(password));
}
/////////////////////////////////////////////////////////////////////////////////////////////////////

// POST: Sign in
// pre: email, password
// post: email and password match database, returns a success and authToken, otherwise a json {false, message}
router.post('/signin', function(req, res, next) {
   // response for errors
  let responseJson = {
   success: false,
   message: "",
   };
   
   if(!req.body.email || !req.body.password) {
      responseJson.message = "You need an email and password"
      return res.status(401).json(responseJson);
   }

  // Try to find an email in the database, if none found return an error, otherwise try to decrypt
  User.findOne({email: req.body.email}, function(err, user) {
    if (err) {
       responseJson.message = "Can't connect to database";
       res.status(401).json(responseJson);
    } else if(!user) {
       responseJson.message = "Email or password is invalid";
       res.status(401).json(responseJson);
    } else {
      bcrypt.compare(req.body.password, user.hashedPassword, function(err, valid) {
         if (err) {
           responseJson.message = "Error with authentication"; 
           res.status(401).json(responseJson);
         }
         else if(valid) {
            res.status(201).json({success:true, authToken: jwt.encode({email: req.body.email}, secret)});
         }
         else {
            responseJson.message = "Email or password is invalid";
            res.status(401).json(responseJson);
         }
      });
    }
  });
  next();
});

// POST: Register a new user 
// pre: a valid email, a strong password, name (first and last)
// post: hashes password, creates a new user, and saves it to database. Returns a json message upon completion
router.post('/register', function(req, res, next) {

   // Check that fields exist
   if(!req.body.name || !req.body.email || !req.body.password) {
      return res.status(400).json({success: false, message: "You must have a name, email, and password"});
   }

   // check for valid email and strong password
   if(!strongPassword(req.body.password)) {
      return res.status(400).json({success: false, message: "Password is not strong enough"});
   }

   if(!validEmail(req.body.email)) {
      return res.status(400).json({success: false, message: "Email must be valid"});
   }

   // hash their password. If all goes well create a new user object
   bcrypt.hash(req.body.password, 10, function(err, hash) {
      if (err) {
        return res.status(400).json({success: false, message: err.errmsg});
      }
      else {
        var newUser = new User ({
            email: req.body.email,
            name: req.body.name,
            hashedPassword: hash,
        });

        // try to save user to database
        newUser.save(function(err, user) {
          if (err) {
             res.status(400).json({success : false, message : err.errmsg});
          }
          else {
             res.status(201).json({success : true, message : user.name + " has been created"});
          }
        });
      }
   });
   next();
});

// GET: get details for the account of a specific user
// pre: authToken
// post: returns userInformation.
//    UserInformation includes all fields for the userObject bar the password and deviceIDs, but with a list of devices objects 
//    associated with user
router.get("/account" , function(req, res) {
   // Check for authentication token in x-auth header
   if (!req.headers["x-auth"]) {
      return res.status(401).json({success: false, message: "No auth token. Line 77"});
   }
   var authToken = req.headers["x-auth"];
   try {
      var decoded = jwt.decode(authToken, secret);
      var userInformation = {};

      User.findOne({email: decoded.email}, function(err, user) {
         if(err) {
            return res.status(400).json({success: false, message: "user does not exist"});
         }
         else {
            userInformation['success'] = true;
            userInformation['email'] = user.email;
            userInformation['name'] = user.name;
            userInformation['longitude'] = user.longitude;
            userInformation['latitude'] = user.latitude;
            userInformation['city'] = user.city;
            userInformation['lastAccess'] = user.lastAccess;
            userInformation['uvThreshold'] = user.uvThreshold;

		      Device.find({ userEmail : decoded.email}, function(err, allDevices) {
               if(err) {
                  return res.status(400).json({success: false, message: "could not search devices."});
               }
			      let foundDevices = [];
			      for (device of allDevices) {
				      foundDevices.push({ deviceID: device.deviceID, apikey: device.apikey});
               }
			      userInformation['devices'] = foundDevices;
               return res.status(200).json(userInformation);
		      });
         }
      });
   } catch (ex) {
      return res.status(401).json({success: false, message: "Invalid auth token."});
   }
});

// GET: get activities associated with deviceID
// pre: auth token and deviceID
// post: returns activites associated with deviceID
router.get('/activities',(req,res)=>{
   // auth token validation
   if (!req.headers["x-auth"]) {
      return res.status(401).json({success: false, message: "No authentication token"});
   }
   try {
      jwt.decode(req.headers["x-auth"], secret);
   } catch {
      return res.status(401).json({ success: false, message: "Invalid auth token."});
   }

   // make sure deviceID exists
   if(!req.query.deviceID){
      return res.status(401).json({success: false, message: "No device ID specified."});
   }

   Activity.find({deviceID: req.query.deviceID}, function(err, activities) {
      if(err) {
         return res.status(400).json({success: false, message: "there is an issue with activity storing."});
      }
      else {
         return res.status(200).json({success: true, 'activities': activities});
      }
   });
});

// PUT: change the name, UV threshold, or the password of a user
// pre:
// post:
router.put('/change/email', function(req, res) {

});

router.put('/change/password', function(req, res) {

});

router.put('/change/name', function(req, res) {

});

router.put('/change/uvThreshold', function(req, res) {

});

module.exports = router;