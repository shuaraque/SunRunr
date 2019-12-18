function sendReqForDeviceInfo() {
  $.ajax({
    url: '/device/status/all',
    type: 'GET',
    headers: { 'x-auth': window.localStorage.getItem("authToken") },
    dataType: 'json'
  })
    .done(devicesInfoSuccess)
    .fail(devicesInfoError);
}

function devicesInfoSuccess(data, textSatus, jqXHR) {
   for (var device of data.devices) {
   $("#knownDevices").append("<li class='collection-item'>" + device.deviceID + "</li>'");
   }
}

function devicesInfoError(jqXHR, textStatus, errorThrown) {
    $("#error").html("Error: " + status.message);
    $("#error").show();
}

function sendReqForActivityInfo(){
    $.ajax({
    url: '/users/activities',
    type: 'GET',
    headers: { 'x-auth': window.localStorage.getItem("authToken") },
    data : { deviceID : $("#deviceInput2").val()},
    dataType: 'json'
  })
    .done(activitiesInfoSuccess)
    .fail(activitiesInfoError);
}

function activitiesInfoSuccess(data, textSatus, jqXHR) {
  $("#deviceInputPage").hide();
  for (var activity of data.activities) {
  let time = (activity.endTime - activity.beginTime)/(60000);
  let calories = 0;
    
  if(activity.type == "walking"){
    calories = 250 * (time/60);
  }
    
  if(activity.type == "running"){
    calories = 700 * (time/60);
  }
    
  if(activity.type == "biking"){
    calories = 572 * (time/60);
  }
  
    
  $("#activitySummaryPage").append("<li class='collection-item' id='UVOutput'>Total Activity Duration: " + time + " minutes</li>");
  $("#activitySummaryPage").append("<li class='collection-item' id='UVOutput'>Total UV Exposure: " + activity.UVSum + "</li>");
  $("#activitySummaryPage").append("<li class='collection-item' id='UVOutput'>Total Calories Burned: " + calories + "</li>");
}}

function activitiesInfoError(jqXHR, textStatus, errorThrown) {
    $("#error").html("Error: " + status.message);
    $("#error").show();
}

// Handle authentication on page load
$(function() {
  // If there's no authToekn stored, redirect user to 
  // the sign-in page (which is index.html)
  if (!window.localStorage.getItem("authToken")) {
    window.location.replace("index.html");
  }
  else {
    sendReqForDeviceInfo();
  }
  
  $("#registerdeviceInput").click(sendReqForActivityInfo);
});
