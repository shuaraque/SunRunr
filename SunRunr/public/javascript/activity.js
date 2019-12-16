function sendReqForDeviceInfo() {
  $.ajax({
    url: '/status/:devid',
    type: 'GET',
    headers: { 'x-auth': window.localStorage.getItem("authToken") },
    data: JSON.stringify({ deviceID: "all"}),
    dataType: 'json'
  })
    .done(activitiesInfoSuccess)
    .fail(activitiesInfoError);
}

function activitiesInfoSuccess(data, textSatus, jqXHR) {
console.log("Enters success");
}

function activitiesInfoError(jqXHR, textStatus, errorThrown) {
    console.log("Enters failure");
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
