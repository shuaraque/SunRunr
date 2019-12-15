let express = require('express');
let router = express.Router();
let User = require("../models/users");
let Device = require("../models/device");
let Activity = require("../models/activity");
let fs = require('fs');
let bcrypt = require("bcryptjs");
let jwt = require("jwt-simple");
var secret = fs.readFileSync(__dirname + '/../jwtkey.txt').toString();


// pre: an array called activityArray that contains activities, which then contain speed 
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

// pre: an activityArray that contains activities
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
// pre: activity, deviceID, and optionally activityID
// post: 
router.post('/hit', (req, res)=> {
    User.findOne();
});
module.exports = router;