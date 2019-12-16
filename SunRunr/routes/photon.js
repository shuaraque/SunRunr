let express = require('express');
let router = express.Router();
let User = require("../models/users");
let Device = require("../models/device");
let Activity = require("../models/activity");
let fs = require('fs');
let bcrypt = require("bcryptjs");
let jwt = require("jwt-simple");
var secret = fs.readFileSync(__dirname + '/../jwtkey.txt').toString();
//var weatherApikey = fs.readFileSync(__dirname+'/../../weatherAPI.txt');


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
// pre: activity (the small array in the activity schema), deviceID, APIkey and optionally: keepTransmitting and/or activityID
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

    if(!req.body.hasProperty("apikey")) {
        responseJson.message = "No apikey in body";
        return res.status(400).json(responseJson);
    }
    req.body.activity.pop(); 

    // If it works, comment this out and replace if statements with the variables
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

// pre: a responseJson, a request req, and a response res
// post: finds the device with the given deviceID, verifies matching apikeys, 
//      makes a request to openweathermap to get temperature and humidity, then saves the new activity, finds the uvThreshold by finding
//      user with the given deviceID
//      finally, returns a responseJson with activityID, uvThreshold, and a success message. Error message otherwise. 
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
                            temperature: weather.main.temp,
                            humidity: weather.main.humidity, 
                        });
                        activity.save(function(err, activity) {
                           if(err) {
                               responseJson.message = "Error with saving activity";
                               return res.status(400).json(responseJson);
                           } else {
                                User.findOne({devices: req.body.deviceID}, function(err, user) {
                                    if(err) {
                                        responseJson.message = "Error with User findOne";
                                        return res.status(400).json(responseJson);
                                    } else {
                                        responseJson.success = true;
                                        responseJson.message = "The activity with id " + activity._id + " begins!";
                                        responseJson.uvThreshold = user.uvThreshold;
                                        responseJson.activityID = activity._id;
                                        res.status(201).json(responseJson);
                                    }
                                });
                           }
                        });
                    }
                });
            }
        } else {
            responseJson.message = "No Device registed";
            return res.status(400).json(responseJson);
        }
    });
}

// pre: a responseJson, a request res, and response res
// post: finds the device with given deviceID and verifies apikey, finds the Activity with the deviceID 
//       and adds the body's activity to the activity(the small array), then finds the user with the deviceID and sets responseJson's
//       uvThreshold to the user's uvThreshold
//      returns a responseJson with activityID, uvThreshold, and a success message. Error message otherwise.  
function continueTransmission(responseJson, req, res) { 
    console.log("Continuing transmission");
    Device.findOne({deviceID: req.body.deviceID}, function(err, device) {
        if(err) {
            responseJson.message = "There was an error with finding the device";
            return res.status(400).json(responseJson);
        } 
        if(device !== null) {
            if(device.apikey != req.body.apikey) {
                responseJson.message = "Ay there, the apikey keys do not match. Device api: " + device.apikey + 
                ", your given apikey: " + req.body.apikey;
                return res.status(400).json(responseJson);
            } else {
                Activity.findOneAndUpdate({_id: req.body.activityID}, {$push: { activity: req.body.activity }}, function(err, activity) {
                    if(err) {
                        responseJson.message = "Error findingOneAndUpdate on activity in continueTransmission";
                        return res.status(400).json(responseJson);
                    } else {
                        User.findOne({devices: req.body.deviceID}, function(err, user){
                            if(err) {
                                responseJson.message = "Error with User.findOne in continueTransmission";
                                return res.status(400).json(responseJson);
                            } else {
                                responseJson.uvThreshold = user.uvThreshold;
                                responseJson.activityID = activity._id;
                                responseJson.success = true;
                                responseJson.message = "The activity is in progress. User, Activity ID: " 
                                    + user._id + ", " + activity._id;
                                return res.status(201).json(responseJson);
                            }
                        });
                    }
                });
            }
        } else {
            responseJson.message = "No device was found";
            return res.status(400).json(responseJson);
        }
    });
}

// pre: a responseJson, a request res, and response res
// post: 
function endTransmission(responseJson, req, res) {

}

module.exports = router;