let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
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
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function sendReqForSummaryInfo(){  //done SUMMARY
    $.ajax({
    url: '/users/activities',
    type: 'GET',
    headers: { 'x-auth': window.localStorage.getItem("authToken") },
    data : { deviceID : $("#deviceInput2").val()},
    dataType: 'json'
  })
    .done(SummarySuccess)
    .fail(SummaryError);
}

// pre: nothing
// post: loads weather for the next 5 days in the summary.html page
function weather() {
  $.ajax({
    url: "https://api.openweathermap.org/data/2.5/forecast?lat=32.2216667&lon=-110.9258333&units=metric&appid=1ac5b46230b1f3ae861be919195faa05",
    type: "GET",
    dataType: "json",
    success: function(result) {
      console.log("success in weather");
      let allForcasts = [];
      let forcast, tempDate;
      let date = new Date(result.list[0].dt_txt);
      let temperature = 0;
      let count = 0;
      for(i of result.list) { 
        forcast = new Object();
        tempDate = new Date(i.dt_txt);
        if(tempDate.getDate() == date.getDate()) {
          temperature += i.main.temp;
          count++;
        } else {
            forcast.month = date.getMonth();
            forcast.day = date.getDate();
            forcast.year = date.getFullYear();
            forcast.temp = temperature / count;
            allForcasts.push(forcast);
            date = tempDate;
            temperature = i.main.temp;
            count = 1;
        }
      }

      var j = 0;
      for(j = 0; j < allForcasts.length; j++) {
        $("#f-date-" + i).html(months[allForcasts[i].month] + " " + allForcasts[i].day);
        $("#f-temp-" + i).html(allForcasts[i].temp.toFixed(1) + "&#8451;");
      }

    },
    error: function(error){ console.log("error in weather " + error);} 
  });
}

// pre: nothing
// post: loads uv for the next 5 days in the summary.html page
function uv() {
  $.ajax({
    url: "https://api.openweathermap.org/data/2.5/uvi/forecast?appid=1ac5b46230b1f3ae861be919195faa05&lat=32.2216667&lon=-110.9258333&units=metric&cnt=4",
    type: "GET",
    dataType: "json",
    success: function(result) {
      console.log("success in uv");
      for(i in result) {
        $("#f-uv-" + i).html("Ultraviolet radiation: " + result[i].value);
      }
    },
    error: function(error) { console.log("error: " + error); },
  });
}



function SummarySuccess(data, textSatus, jqXHR) {
  $("#deviceInputPage").hide();
  let totalTime = 0;
  let totalCalories = 0;
  let totalUVExposure = 0;
  
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
  
  totalCalories = calories + totalCalories;
  totalTime = time + totalTime;
  totalUVExposure = activity.UVSum + totalUVExposure;
    

}
  $("#activitySummaryPage").append("<li class='collection-item' id='UVOutput'>Total Activity Duration: " +  totalTime + " minutes</li>");
  $("#activitySummaryPage").append("<li class='collection-item' id='UVOutput'>Total UV Exposure: " + totalUVExposure + "</li>");
  $("#activitySummaryPage").append("<li class='collection-item' id='UVOutput'>Total Calories Burned: " + totalCalories + "</li>");
}

function SummaryError(jqXHR, textStatus, errorThrown) {
    $("#error").html("Error: " + status.message);
    $("#error").show();
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
  
  $("#registerdeviceInput").click(sendReqForSummaryInfo);
});

$(document).ready(function() {
  weather();
  uv();
});
