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
   let responseJson = {
      success: false,
      message: "",
   };
   // Check that fields exist
   if(!req.body.name || !req.body.email || !req.body.password) {
      responseJson.message = "You must have a name, email, and password";
      return res.status(400).json(responseJson);
   }

   // check for valid email and strong password
   if(!strongPassword(req.body.password)) {
      responseJson.message = "Password is not strong enough";
      return res.status(400).json(responseJson);
   }

   if(!validEmail(req.body.email)) {
      responseJson.message = "Email must be valid";
      return res.status(400).json(responseJson);
   }

   // hash their password. If all goes well create a new user object
   bcrypt.hash(req.body.password, 10, function(err, hash) {
      if (err) {
        responseJson.message = err.errmsg;
        return res.status(400).json(responseJson);
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
             responseJson.message = err.errmsg;
             res.status(400).json(responseJson);
          }
          else {
             responseJson.success = true;
             responseJson.message = user.name + " has been created";
             res.status(201).json(responseJson);
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

// PUT: change the email of the user
// pre: an auth token and an email
// post: changes the email of the user, sends a json with the newToken, message, and success as json. Otherwise sends failure and message
//       as a json
router.put("/change/email", function(req, res){
   let responseJson = {};
   if (!req.headers["x-auth"]) {
      return res.status(401).json({success: false, message: "No authentication token"});
   }
   if(!req.body.email || !validEmail(req.body.email)){
      return res.status(400).json({success: false, message: "Invalid Email"});
   }

   var authToken = req.headers["x-auth"];
   try {
      var decoded = jwt.decode(authToken, secret);

      // find the user associated with email
      User.findOne({email: decoded.email}, function(err, user) {
         if(err || !user) {
            return res.status(200).json({success: false, message: "User does not exist."});
         }
         else {
            // at this point you have the email
            user.email = req.body.email;
            user.save(function(err, user){
               if (err) {
                  responseJson.success = false;
                  responseJson.message = "email already registered to another user which is not " + user;
                  return res.status(201).json(responseJson);
               } else {
                  // Find devices associated with user
		         Device.find({email : decoded.email}, function(err, devices) {
			      if (!err) {
			         for (device of devices) {
                     device.email = req.body.email;
                     device.save(function(err, device){
                        if (err || !device) {
                           responseJson.success = false;
                           responseJson.message = "Error updating device data in db.  " + err;
                           return res.status(201).json(responseJson);
                        }
                     });
			         }
               } else {
                  responseJson.success = false;
                  responseJson.message = "Error finding device data in db.  " + err;
                  return res.status(201).json(responseJson);
               }              
            });
            responseJson.success = true;
            responseJson.message = "email updated for user and all associated devices";
            responseJson.newToken = jwt.encode({email: req.body.email}, secret);
            return res.status(201).json(responseJson);
               }
            });
         }
      });
   }
   catch (ex) {
      return res.status(401).json({success: false, message: "Invalid authentication token."});
   }
   
});

// PUT: change the the password of the user
// pre: an auth token(that contains an email) and a user name in the body
// post: changes the name for user 
router.put('/change/name', function(req, res) {
   if (!req.headers["x-auth"]) {
      return res.status(401).json({success: false, message: "No authentication token"});
   }
   if(!req.body.name){
      return res.status(400).json({success: false, message: "No name provided."});
   }
   var authToken = req.headers["x-auth"];

   try {
      var decoded = jwt.decode(authToken, secret);
      var responseJson = {
         success: false,
         message: "",
      };
      User.findOne({email: decoded.email}, function(err, user) {
         if(err || !user) {
            responseJson.message = "user does not exist";
            return res.status(200).json(responseJson);
         }
         else {
            user.name = req.body.name;
            user.save(function(err, user){
               if (err) {
                  responseJson.message = "Error: Communicating with database for user " + user;
                  return res.status(201).json(responseJson);
               }
               else {
                  responseJson.success = true;
                  responseJson.message = "Name Updated Successfully";
                  return res.status(201).json(responseJson);
               }
            });
         }
      });
   } catch (ex) {
      responseJson.message = "Invalid auth token";
      return res.status(401).json(responseJson);
   }
});

// PUT 
// pre: an authToken, an old password, and a new password
// post:
router.put('/change/password', function(req, res) {
      let responseJson = {
         success: false,
         message: "",
      }

      // checking if required inputs exist
      if (!req.headers["x-auth"]) {
         responseJson.message = "No auth token";
         return res.status(401).json(responseJson);
      }
      if(!req.body.oldPassword||!req.body.newPassword){
         responseJson.message = "need both old and new password, buddy";
         return res.status(400).json(responseJson);
      }
      if(!strongPassword(req.body.newPassword)){
         responseJson = "Need to have 8 characters with at least 1 upper, 1 lower, and 1 special character";
         return res.status(400).json(responseJson);
      }


      var authToken = req.headers["x-auth"];
      try {
         var decodedToken = jwt.decode(authToken, secret);
         
         User.findOne({email: decodedToken.email}, function(err, user) {
            if(err || !user) {
               responseJson.message = "User doesn't exist";
               return res.status(400).json(responseJson);
            }
            else {
               bcrypt.compare(req.body.oldPassword, user.passwordHash, function(err, valid) {
                  if (err) {
                     responseJson.message = "Inputted old password and actual old password don't match. ";
                     res.status(401).json(responseJson);
                  }
                  else if(valid) {
                     bcrypt.hash(req.body.newPassword, null, null, function(err, hash) {
                        if (err) {
                           responseJson.message = "Hash error";
                           res.status(401).json(responseJson);
                        }
                        user.passwordHash = hash;
                        user.save(function(err, userf) {
                           if (err) {
                              responseJson.message = "Error: Communicating with database";
                              return res.status(201).json(responseJson);
                           }
                           else {
                              responseJson.success = true;
                              responseJson.message = "Password updated for " + userf.name;
                              return res.status(201).json(responseJson);
                           }
                        });
                     });
                  }
                  else {
                     res.status(400).json({success : false, message : "The old password provided was invalid."});         
                  }
               });
            }
         });
      }
      catch (ex) {
         return res.status(401).json({success: false, message: "Invalid authentication token."});
      }
});

router.put('/change/uvThreshold', function(req, res) {

});

module.exports = router;
