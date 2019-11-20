var express = require('express');
var router = express.Router();
var Device = require("../models/device");
var Activity = require("../models/activity");

/* POST: Register new device. */
router.post('/activate', function(req, res, next) {
  var responseJson = {
    status : "",
    message : ""
  };

  // Ensure the POST data include properties id and email
  if( !req.body.hasOwnProperty("deviceID") ) {
    responseJson.status = "ERROR";
    responseJson.message = "Request missing deviceID parameter.";
    return res.status(201).send(JSON.stringify(responseJson));
  }

  /*if( !req.body.hasOwnProperty("apikey") ) {
    responseJson.status = "ERROR";
    responseJson.message = "Request missing apikey parameter.";
    return res.status(201).send(JSON.stringify(responseJson));
  }*/

  if( !req.body.hasOwnProperty("longitude") ) {
    responseJson.status = "ERROR";
    responseJson.message = "Request missing longitude parameter.";
    return res.status(201).send(JSON.stringify(responseJson));
  }

  if( !req.body.hasOwnProperty("latitude") ) {
    responseJson.status = "ERROR";
    responseJson.message = "Request missing latitude parameter.";
    return res.status(201).send(JSON.stringify(responseJson));
  }

    if( !req.body.hasOwnProperty("ultraviolet") ) {
    responseJson.status = "ERROR";
    responseJson.message = "Request missing ultraviolet parameter.";
    return res.status(201).send(JSON.stringify(responseJson));
  }

    if( !req.body.hasOwnProperty("speed") ) {
    responseJson.status = "ERROR";
    responseJson.message = "Request missing speed parameter.";
    return res.status(201).send(JSON.stringify(responseJson));
  }

  // Find the device and verify the apikey
  /*Device.findOne({ deviceID: req.body.deviceID }, function(err, device) {
    if (device !== null) {
      if (device.apikey != req.body.apikey) {
        responseJson.status = "ERROR";
        responseJson.message = "Invalid apikey for device ID " + req.body.deviceID + ".";
        return res.status(201).send(JSON.stringify(responseJson));
      }
      else {
        // Create a new activity data with user email time stamp*/
        var newActData = new activity({
          userEmail: device.userEmail,
          deviceID: req.body.deviceID,
          longitude: req.body.longitude,
          latitude: req.body.latitude,
          ultraviolet: req.body.ultraviolet,
          speed: req.body.speed
        });

        // Save device. If successful, return success. If not, return error message.
        newActData.save(function(err, newActData) {
          if (err) {
            responseJson.status = "ERROR";
            responseJson.message = "Error saving data in db.";
            return res.status(201).send(JSON.stringify(responseJson));
          }
          else {
            responseJson.status = "OK";
            responseJson.message = "Data saved in db with object ID " + newActData._id + ".";
            return res.status(201).send(JSON.stringify(responseJson));
          }
        });
      }
    }
    else {
      responseJson.status = "ERROR";
      responseJson.message = "Device ID " + req.body.deviceID + " not registered.";
      return res.status(201).send(JSON.stringify(responseJson));
    }
  });
});

module.exports = router;
