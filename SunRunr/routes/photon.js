let express = require('express');
let router = express.Router();
let User = require("../models/users");
let Device = require("../models/device");
let Activity = require("../models/activity");
let fs = require('fs');
let bcrypt = require("bcryptjs");
let jwt = require("jwt-simple");
var secret = fs.readFileSync(__dirname + '/../jwtkey.txt').toString();
var weatherApikey = fs.readFileSync(__dirname+'/../../weatherAPI.txt');


// pre: an array called activityArray that contains activities (this is the activity fild of the activity schema in models)
// post: returns the average speed in the activityArray
function calculateAverageSpeed(activityArray) {
    let averageSpeed = 0.0;
    let type = "";

    for(activity of activityArray) {
        averageSpeed += parseFloat(activity.speed);
    }
    averageSpeed /= activityArray.length;

    if(speed <= 5) {
        type = "walking";
    } else if (speed > 5 && speed <= 9) {
        type = "running";
    } else if (speed > 9){
        type = "biking";
    }
    return {"averageSpeed": averageSpeed, "type": type};
}

// pre: an activityArray that contains activities (this is the activity fild of the activity schema in models)
// post: returns the average ultraviolet index in the activityArrays
function calculateUV(activityArray){
    let averageUV = 0.0;
    for(activity of activityArray) {
        averageUV += activity.ultraviolet;
    }
    averageUV /= activity.length;
    return averageUV;
}

// POST
// pre: activity, deviceID, APIkey and optionally: keepTransmitting and/or activityID
// post: 
router.post('/hit', function(req, res) {
    let responseJson = {
        success: false,
        message: "",
        activityID: "",
        uvThreshold: "",
    }

    // Check if mandatory body fields exist
    if(!req.body.hasProperty("activity")) {
        responseJson.message = "No activity in body";
        return res.status(400).json(responseJson);
    }

    if(!req.body.hasProperty("deviceID")) {
        responseJson.message = "No deviceID in body";
        return res.status(400).json(responseJson);
    }

    if(!req.body.hasProperty("APIkey")) {
        responseJson.message = "No APIkey in body";
        return res.status(400).json(responseJson);
    }
    req.body.activity.pop(); 

    // If it works, comment this out and replace if statements
    // let keepTransmitting = req.body.keepTransmitting;
    // let hasID = req.body.activityID;

    if(req.body.keepTransmitting && !req.body.activityID) {
        return beginTransmission(responseJson, req, res);

    } else if(req.body.keepTransmitting && req.body.activityID) {
        return continueTransmission(responseJson, req, res);

    } else if (!req.body.keepTransmitting && req.body.activityID) {
        return endTransmission(responseJson, req, res);

    } else { // !keepTransmitting && !hasID
         return shortActivity(responseJson, req, res);
    }
}); 

// pre: a responseJson, a request, and a response
function beginTransmission(responseJson, req, res) {
    console.log("Beginning transmission");
    Device.findOne({ device: req.body.deviceID }, function(err, device) {
        if(err) {
            responseJson.message = "Error with finding device: " + err;
            return res.status(400).json(responseJson);
        } 
        if(device !== null) {
            if(device.apikey != req.body.apikey) {
                responseJson.message = "device apikey and body apikey do not match. device apikey: " 
                + device.apikey + ", body apikey: " + req.body.apikey;
                return res.status(400).json(responseJson);
            } else {
                let url = "http://api.openweathermap.org/data/2.5/weather?" + "lat=" + req.body.activity[0].latitude + "&lon=" 
                        + req.body.activity[0].longitude + "&appid=" + weatherApikey;
                request(url, function(err, response, body){
                    if(err) {
                        console.log(err);
                    } else {
                        let weather = JSON.parse(body);
                        let activity = new Activity({
                            deviceID: req.body.deviceID,
                            activity: req.body.activity,
                            
                        });
                    }
                });
            }
        }
    });
}

module.exports = router;