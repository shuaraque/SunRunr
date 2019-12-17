function sendReqForDeviceInfo() {
  $.ajax({
    url: '/device/status/all',
    type: 'GET',
    headers: { 'x-auth': window.localStorage.getItem("authToken") },
    dataType: 'json'
  })
    .done(activitiesInfoSuccess)
    .fail(activitiesInfoError);
}

function activitiesInfoSuccess(data, textSatus, jqXHR) {
    string htmlString = "";
   for (var device of data.devices) {
   htmlString += "<li class='collection-item' id='" + device.deviceID + "'><a href='#!' id='" + device.deviceID + "'>"  + device.deviceID + "</a></li>";
   }
  
  console.log(htmlString);
}

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
  
  // Register event listeners
});
