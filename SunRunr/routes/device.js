let express = require('express');
let router = express.Router();
let Device = require("../models/device");
let fs = require('fs');
let jwt = require("jwt-simple");

/* Authenticate user */
var secret = fs.readFileSync(__dirname + '/../jwtkey.txt').toString();

// Function to generate a random apikey consisting of 32 characters
function getNewApikey() {
  let newApikey = "";
  let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
  for (let i = 0; i < 32; i++) {
    newApikey += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }

  return newApikey;
}

// // GET request return one or "all" devices registered and last time of contact.
// router.get('/status/:devid', function(req, res, next) {
//   let deviceID = req.params.devid;
//   let responseJson = { devices: [] };

//   if (deviceID == "all") {
//     let query = {};
//   }
//   else {
//     let query = {
//       "deviceID" : deviceID
//     };
//   }
  
//   Device.find(query, function(err, allDevices) {
//     if (err) {
//       let errorMsg = {"message" : err};
//       res.status(400).json(errorMsg);
//     }
//     else {
//       for(let doc of allDevices) {
//         responseJson.devices.push({ "deviceID": doc.deviceID,  "lastContact" : doc.lastContact});
//       }
//     }
//     res.status(200).json(responseJson);
//   });
//   next();
// });

router.post('/register', function(req, res, next) {
  let responseJson = {
    registered: false,
    message : "",
    apikey : "none",
    deviceID : "none"
  };
  let deviceExists = false;
  
  // Ensure the request includes the deviceID parameter
  if( !req.body.hasOwnProperty("deviceID")) {
    responseJson.message = "Missing deviceID.";
    return res.status(400).json(responseJson);
  }

  let email = "";
    
  // If authToken provided, use email in authToken 
  if (req.headers["x-auth"]) {
    try {
      let decodedToken = jwt.decode(req.headers["x-auth"], secret);
      email = decodedToken.email;
    }
    catch (ex) {
      responseJson.message = "Invalid authorization token.";
      return res.status(400).json(responseJson);
    }
  }
  else {
    // Ensure the request includes the email parameter
    if( !req.body.hasOwnProperty("email")) {
      responseJson.message = "Invalid authorization token or missing email address.";
      return res.status(400).json(responseJson);
    }
    email = req.body.email;
  }
    
  // See if device is already registered
  Device.findOne({ deviceID: req.body.deviceID }, function(err, device) {
    if (device !== null) {
      responseJson.message = "Device ID " + req.body.deviceID + " already registered.";
      return res.status(400).json(responseJson);
    }
    else {
      // Get a new apikey
	   deviceApikey = getNewApikey();
	    
	    // Create a new device with specified id, user email, and randomly generated apikey.
      let newDevice = new Device({
        deviceID: req.body.deviceID,
        userEmail: email,
        apikey: deviceApikey
      });

      // Save device. If successful, return success. If not, return error message.
      newDevice.save(function(err, newDevice) {
        if (err) {
          responseJson.message = err;
          // This following is equivalent to: res.status(400).send(JSON.stringify(responseJson));
          return res.status(400).json(responseJson);
        }
        else {
          responseJson.registered = true;
          responseJson.apikey = deviceApikey;
          responseJson.deviceID = req.body.deviceID;
          responseJson.message = "Device ID " + req.body.deviceID + " was registered.";
          return res.status(201).json(responseJson);
        }
      });
    }
  });
});

router.post('/ping', function(req, res, next) {
    let responseJson = {
        success: false,
        message : "",
    };
    let deviceExists = false;
    
    // Ensure the request includes the deviceID parameter
    if( !req.body.hasOwnProperty("deviceID")) {
        responseJson.message = "Missing deviceID.";
        return res.status(400).json(responseJson);
    }
    
    // If authToken provided, use email in authToken 
    try {
        let decodedToken = jwt.decode(req.headers["x-auth"], secret);
    }
    catch (ex) {
        responseJson.message = "Invalid authorization token.";
        return res.status(400).json(responseJson);
    }
    
    request({
       method: "POST",
       uri: "https://api.particle.io/v1/devices/" + req.body.deviceID + "/pingDevice",
       form: {
	       access_token : particleAccessToken,
	       args: "" + (Math.floor(Math.random() * 11) + 1)
        }
    });
            
    responseJson.success = true;
    responseJson.message = "Device ID " + req.body.deviceID + " pinged.";
    return res.status(200).json(responseJson);
});

module.exports = router;
