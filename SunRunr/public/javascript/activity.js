function sendReqForDeviceInfo() {
  $("#activitySummaryPage").html("");
  $("#activitySelectionPage").html("");
  $("#activityDetailPage").html("");
  
  $("#activitySummaryPage").hide();
  $("#activitySelectionPage").hide();
  $("#activityDetailPage").hide();
  
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
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function sendReqForActivitySummaryInfo(){ //Done
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
  
  $("#activitySummaryPage").append("<li class='collection-item' id='ID'><h5>" + activity.activityID + "</h5></li>");
  $("#activitySummaryPage").append("<li class='collection-item' id='duration'>Duration of Activity: " + time + " minutes</li>");
  $("#activitySummaryPage").append("<li class='collection-item' id='UVOutput'>UV Exposure: " + activity.UVSum + "</li>");
  $("#activitySummaryPage").append("<li class='collection-item' id='calories'>Calories Burned: " + calories + "</li>");
  $("#activitySummaryPage").append("<li class='collection-item' id='temperature'>Temperature: " + activity.temperature + "</li>");
  $("#activitySummaryPage").append("<li class='collection-item' id='humidity'>Humidity: " + activity.humidity + "</li>");
  $("#activitySummaryPage").append("<li class='collection-item' id='date'>Date: " + activity.submissionTime.type + "</li>");
  $("#activitySelectionPage").append("<p><input type='radio' name='ActivitySelected' value='" + activity.activityID + " id='" + activity.activityID + "'><label for='"+ activity.activityID + "'>" + activity.activityID + "</label></p>");
}
  $("#activitySelectionPage").append("<button id='activitySelect' class='waves-effect waves-light btn'>Submit</button>");
}

function activitiesInfoError(jqXHR, textStatus, errorThrown) {
    $("#error").html("Error: " + status.message);
    $("#error").show();
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function sendReqForActivityDetailInfo(){
    $.ajax({
    url: '/users/activity/' + $('input[name ="ActivitySelected"]').val(), //TODO Write routes function to get a specific activity detailed
    type: 'GET',
    headers: { 'x-auth': window.localStorage.getItem("authToken") },
    data : { deviceID : $("#deviceInput2").val()},
    dataType: 'json'
  })
    .done(activitiesDetailSuccess)
    .fail(activitiesDetailError);
}

function activitiesDetailSuccess(data, textSatus, jqXHR) {
  let time = (data.endTime - data.beginTime)/(60000);
  let calories = 0;
  let divTime = 0;
  let timeStamp = 0;
  let value = 0;
  let speedString = "";
    
  if(data.type == "walking"){
    calories = 250 * (time/60);
  }
    
  if(data.type == "running"){
    calories = 700 * (time/60);
  }
    
  if(data.type == "biking"){
    calories = 572 * (time/60);
  } 
  
  $("#title").html("<h5>Activity Detail</h5>");
  $("#activityDetailPage").append("<ul class='collection with-header'><li class='collection-header'><h5>" + data.activityID + "</h5></li>");
  $("#activityDetailPage").append("<li class='collection-item' id='duration'>Duration of Activity: " + time + " minutes</li>");
  $("#activityDetailPage").append("<li class='collection-item' id='UVOutput'>UV Exposure: " + data.UVSum + "</li>");
  $("#activityDetailPage").append("<li class='collection-item' id='calories'>Calories Burned: " + calories + "</li>");
  $("#activityDetailPage").append("<li class='collection-item' id='temperature'>Temperature: " + data.temperature + "</li>");
  $("#activityDetailPage").append("<li class='collection-item' id='humidity'>Humidity: " + data.humidity + "</li>");
  $("#activityDetailPage").append("<li class='collection-item' id='activityType'>Activity Type: " + data.type + "</li>");
  $("#activityDetailPage").append("<li class='collection-item' id='date'>Date: " + data.submissionTime.type + "</li>");
  $("#activityDetailPage").append("</ul>");
  
  let min = data.averageSpeed - (data.averageSpeed * 0.2);
  let max = data.averageSpeed + (data.averageSpeed * 0.2);
  var speedData = new Array ( );
  
  divTime = time/20;
  for(let i = 0; i<21; i++{
     value = Math.floor(Math.random() * (max - min) + min);
     speedData[i] = "[" + timeStamp + " , " + value + "],";
     timeStamp = timeStamp + divTime;
   }

    $("#activityDetailPage").append("<html><head><script type='text/javascript' src='https://www.gstatic.com/charts/loader.js'></script>");
    $("#activityDetailPage").append("<script type='text/javascript'>");
    $("#activityDetailPage").append("google.charts.load('current', {'packages':['corechart']}); google.charts.setOnLoadCallback(drawChart);");
    $("#activityDetailPage").append("<span id='googleCharts'></span>");
    $("#activityDetailPage").append("function drawChart() { var data = google.visualization.arrayToDataTable([");
    $("#activityDetailPage").append("['Time', 'Speed'],");
    
   for(let j = 0; j<21; j++{
     $("#activityDetailPage").append(speedData[j]);
   }
   
   
    $("#activityDetailPage").append("]);");
    $("#activityDetailPage").append("var options = {");
    $("#activityDetailPage").append("title: 'Activity Speed',");
    $("#activityDetailPage").append("curveType: 'function',");
    $("#activityDetailPage").append("legend: { position: 'bottom' }");
    $("#activityDetailPage").append("};");
    $("#activityDetailPage").append("var chart = new google.visualization.LineChart(document.getElementById('curve_chart'));");
    $("#activityDetailPage").append("chart.draw(data, options);}");
    $("#activityDetailPage").append("</script></head><body>");
    $("#activityDetailPage").append("<div id='curve_chart' style='width: 900px; height: 500px'></div>");
    $("#activityDetailPage").append("</body>");
  
  //TODO Graph Stuff
}

function activitiesDetailError(jqXHR, textStatus, errorThrown) {
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
  
  $("#registerdeviceInput").click(sendReqForActivitySummaryInfo);
  $("#activitySelect").click(sendReqForActivityDetailInfo);
});
