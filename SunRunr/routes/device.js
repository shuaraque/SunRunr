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


// GET request return one or "all" devices registered and last time of contact.
router.get('/status/:devid', function(req, res, next) {
  let deviceID = req.params.devid;
  let responseJson = { devices: [] };
  let query = ""

  if (deviceID == "all") {
     query = {};
  }
  else {
     query = {
      "deviceID" : deviceID
    };
  }
  
  Device.find(query, function(err, allDevices) {
    if (err) {
      let errorMsg = {"message" : err};
      res.status(400).json(errorMsg);
    }
    else {
      for(let doc of allDevices) {
        responseJson.devices.push({ "deviceID": doc.deviceID,  "lastContact" : doc.lastContact});
      }
    }
    res.status(200).json(responseJson);
  });
  next();
});

// POST: regsiter user
router.post('/register', function(req, res, next) {
    let responseJson = {
        registered: false,
        message: "",
        apikey: "none",
        deviceID: "none"
    };
    let email = "";

    // Make sure the request includes  deviceID 
    if (!req.body.hasOwnProperty("deviceID")) {
        responseJson.message = "Missing deviceID.";
        return res.status(400).json(responseJson);
    }

    // if x-auth exists, get email from token. Otherwise get email from body
    if (req.headers["x-auth"]) {
        try {
            let decoded = jwt.decode(req.headers["x-auth"], secret);
            email = decoded.email;
        } catch (exception) {
            responseJson.message = "Invalid authorization token.";
            return res.status(400).json(responseJson);
        }
    } else {
        if (!req.body.hasOwnProperty("email")) {
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
        } else {
            let newAPI = getNewApikey();
            let newDev = new Device({
                apikey: newAPI,
                email: email,
                deviceID: req.body.deviceID
            });

            // try to save
            newDev.save(function(err, newDev) {
                console.log("new device: " + newDev);
                if (err) {
                    responseJson.message = err;
                    return res.status(400).json(responseJson);
                } else {
                    User.findOneAndUpdate({email: email},{$push:{userDevices: req.body.deviceID}},(err,user)=>{
                        if(err) {
                            responseJson.message = err;
                            return res.status(400).json(responseJson);
                        }
                        else {
                            responseJson.registered = true;
                            responseJson.apikey = newAPI;
                            responseJson.deviceID = req.body.deviceID;
                            responseJson.message = "Device ID " + req.body.deviceID + " was registered to " + user.email + "'s device list.";
                            return res.status(201).json(responseJson);
                        }   
                    });  
                }
            });
        }
    });
});

// Delete a device from the database
router.delete('/remove/:deviceID', (req,res)=>{
  try {
      jwt.decode(req.headers["x-auth"], secret);
  } catch (ex) {
      console.log("bad authorization");
      responseJson.message = "Invalid authorization token. This is line 165";
      return res.status(400).json(responseJson);
  }
  Device.findOneAndRemove({deviceID: req.params.deviceID},(err, device)=>{
      User.findOneAndUpdate({email:device.email},{$pull:{userDevices: req.params.deviceID}},(err, user)=>{
        res.status(202).json({"message": "successful deletion", "deviceID": req.params.deviceID});
      });
  });
});

router.post('/ping', function(req, res, next) {
    let responseJson = {
        success: false,
        message: "",
    };
    let deviceExists = false;

    // Ensure the request includes the deviceID parameter
    if (!req.body.hasOwnProperty("deviceID")) {
        responseJson.message = "Missing deviceID.";
        return res.status(400).json(responseJson);
    }

    // If authToken provided, use email in authToken 
    try {
        let decoded = jwt.decode(req.headers["x-auth"], secret);
    } catch (ex) {
        responseJson.message = "Invalid authorization token.";
        return res.status(400).json(responseJson);
    }

    request({
        method: "POST",
        uri: "https://api.particle.io/v1/devices/" + req.body.deviceID + "/pingDevice",
        form: {
            access_token: particleAccessToken,
            args: "" + (Math.floor(Math.random() * 11) + 1)
        }
    });

    responseJson.success = true;
    responseJson.message = "Device ID " + req.body.deviceID + " pinged.";
    return res.status(200).json(responseJson);
});



module.exports = router;