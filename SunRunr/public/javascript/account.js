function sendReqForAccountInfo() {
  $("#addUVForm").slideUp();
  $.ajax({
    url: '/users/account',
    type: 'GET',
    headers: { 'x-auth': window.localStorage.getItem("authToken") },
    dataType: 'json'
  })
    .done(accountInfoSuccess)
    .fail(accountInfoError);
}

function accountInfoSuccess(data, textSatus, jqXHR) {
  $("#email").html(data.email);
  $("#fullName").html(data.name);
  $("#lastAccess").html(data.lastAccess);
  $("#main").show();
  $("#UVDisplay").html(data.uvThreshold);
  }

function accountInfoError(jqXHR, textStatus, errorThrown) {
  // If authentication error, delete the authToken 
  // redirect user to sign-in page (which is index.html)
  if( jqXHR.status === 401 ) {
    window.localStorage.removeItem("authToken");
    window.location.replace("index.html");
  } 
  else {
    $("#error").html("Error: " + status.message);
    $("#error").show();
  } 
}

function sendReqForDeviceInfo() {
  $.ajax({
    url: '/device/status/all',
    type: 'GET',
    headers: { 'x-auth': window.localStorage.getItem("authToken") },
    dataType: 'json'
  })
    .done(deviceInfoSuccess)
    .fail(deviceInfoError);
}
  function deviceInfoSuccess(data, textSatus, jqXHR) {
    //console.log(data);
//  for (var device of data.devices) {
//    $("#addDeviceForm").before("<li class='collection-item'>ID: " +
//      device.deviceID + ", APIKEY: " + device.apikey + 
//      " <button id='ping-" + device.deviceID + "' class='waves-effect waves-light btn'>Ping</button> " +
//      " </li>");
//    $("#ping-"+device.deviceID).click(function(event) {
//      pingDevice(event, device.deviceID);
//    });
//  }
  }

function deviceInfoError(jqXHR, textStatus, errorThrown) {
  // If authentication error, delete the authToken 
  // redirect user to sign-in page (which is index.html)
  if( jqXHR.status === 401 ) {
    window.localStorage.removeItem("authToken");
    window.location.replace("index.html");
  } 
  else {
    $("#error").html("Error: " + status.message);
    $("#error").show();
  } 
}

// Registers the specified device with the server.
function registerDevice() {
  $.ajax({
    url: '/device/register',
    type: 'POST',
    headers: { 'x-auth': window.localStorage.getItem("authToken") },  
    contentType: 'application/json',
    data: JSON.stringify({ deviceID: $("#deviceId").val() }), 
    dataType: 'json'
   })
     .done(function (data, textStatus, jqXHR) {
       // Add new device to the device list
       $("#addDeviceForm").before("<li class='collection-item'>ID: " +
       $("#deviceId").val() + ", APIKEY: " + data["apikey"] + 
         " <button id='ping-" + $("#deviceId").val() + "' class='waves-effect waves-light btn'>Ping</button> " +
         "</li>");
       $("#ping-"+$("#deviceId").val()).click(function(event) {
         pingDevice(event, device.deviceId);
       });
    
      
       $("#error").html(data.deviceId);
       hideAddDeviceForm();
     })
     .fail(function(jqXHR, textStatus, errorThrown) {
       let response = JSON.parse(jqXHR.responseText);
       $("#error").html("Error: " + response.message);
       $("#error").show();
     }); 
}

function pingDevice(event, deviceId) {
   $.ajax({
        url: '/device/ping',
        type: 'POST',
        headers: { 'x-auth': window.localStorage.getItem("authToken") },   
        data: { 'deviceID': deviceId }, 
        responseType: 'json',
        success: function (data, textStatus, jqXHR) {
            console.log("Pinged.");
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log("Response text is: " + jqXHR.responseText);
            var response = JSON.parse(jqXHR.responseText);
            $("#error").html("Error: " + response.message);
            $("#error").show();
        }
    }); 
}

// Show add device form and hide the add device button (really a link)
function showAddDeviceForm() {
  $("#deviceId").val("");        // Clear the input for the device ID
  $("#addDeviceControl").hide();   // Hide the add device link
  $("#addDeviceForm").slideDown();  // Show the add device form
}

// Hides the add device form and shows the add device button (link)
function hideAddDeviceForm() {
  $("#addDeviceControl").show();  // Hide the add device link
  $("#addDeviceForm").slideUp();  // Show the add device form
  $("#error").hide();
}

// Show add device form and hide the add device button (really a link)
function showUVForm() {
  $("#UVThreshold").val("");        // Clear the input for the device ID
  $("#addUVControl").hide();   // Hide the add device link
  $("#addUVForm").slideDown();  // Show the add device form
}

// Hides the add device form and shows the add device button (link)
function hideUVForm() {
  $("#addUVControl").show();  // Hide the add device link
  $("#addUVForm").slideUp();  // Show the add device form
  $("#error").hide();
}

function changeUV() {
  $.ajax({
  url: '/users/change/uvThreshold',
  type: 'PUT',
  headers: { 'x-auth': window.localStorage.getItem("authToken") },   
  contentType: 'application/json',
  data: JSON.stringify({threshold : $("#UVThresholdInput").val()}),
  dataType: 'json'
  })
  .done(UVSuccess)
  .fail(UVError);
} 
  
function UVSuccess(data, textStatus, jqXHR) {
if (data.success) {  
  $("#UVDisplay").html($("#UVThresholdInput").val());
  $("#addUVControl").show();  // Hide the add device link
  $("#addUVForm").slideUp();  // Show the add device form
  $("#error").hide();
}
else {
  $('#error').html("<div class='red-text text-darken-2'>Error: " + data.message + "</div>");
  $('#error').show();
}
}

function UVError(jqXHR, textStatus, errorThrown) {
if (jqXHR.statusCode == 404) {
  $('#error').html("<div class='red-text text-darken-2'>Server could not be reached.</div>");
  $('#error').show();
}
else {
  $('#error').html("<div class='red-text text-darken-2'>Error: " + jqXHR.responseJSON.message + "</div>");
  $('#error').show();
}
}

function showEmailForm() {
  $("#emailInput").val("");        // Clear the input for the device ID
  $("#addEmailControl").hide();   // Hide the add device link
  $("#addEmailForm").slideDown();  // Show the add device form
}

// Hides the add device form and shows the add device button (link)
function hideEmailForm() {
  $("#addEmailControl").show();  // Hide the add device link
  $("#addEmailForm").slideUp();  // Show the add device form
  $("#error").hide();
}

function changeEmail() {
  $.ajax({
  url: '/users/change/email',
  type: 'PUT',
  headers: { 'x-auth': window.localStorage.getItem("authToken") },   
  contentType: 'application/json',
  data: JSON.stringify({email : $("#emailInput").val()}),
  dataType: 'json'
  })
  .done(EmailSuccess)
  .fail(EmailError);
} 
  
function EmailSuccess(data, textStatus, jqXHR) {
if (data.success) {  
  $("#EmailDisplay").html($("#emailInput").val());
  $("#addEmailControl").show();  // Hide the add device link
  $("#addEmailForm").slideUp();  // Show the add device form
  $("#error").hide();
  window.localStorage.removeItem('authToken');
  window.location.replace("index.html");
}
else {
  $('#error').html("<div class='red-text text-darken-2'>Error: " + data.message + "</div>");
  $('#error').show();
}
}

function EmailError(jqXHR, textStatus, errorThrown) {
if (jqXHR.statusCode == 404) {
  $('#error').html("<div class='red-text text-darken-2'>Server could not be reached.</div>");
  $('#error').show();
}
else {
  $('#error').html("<div class='red-text text-darken-2'>Error: " + jqXHR.responseJSON.message + "</div>");
  $('#error').show();
}
}

function showNameForm() {
  $("#nameInput").val("");        // Clear the input for the device ID
  $("#addNameControl").hide();   // Hide the add device link
  $("#addNameForm").slideDown();  // Show the add device form
}

// Hides the add device form and shows the add device button (link)
function hideNameForm() {
  $("#addNameControl").show();  // Hide the add device link
  $("#addNameForm").slideUp();  // Show the add device form
  $("#error").hide();
}

function changeName() {
  $.ajax({
  url: '/users/change/name',
  type: 'PUT',
  headers: { 'x-auth': window.localStorage.getItem("authToken") },   
  contentType: 'application/json',
  data: JSON.stringify({name : $("#nameInput").val()}),
  dataType: 'json'
  })
  .done(NameSuccess)
  .fail(NameError);
} 
  
function NameSuccess(data, textStatus, jqXHR) {
if (data.success) {  
  $("#NameDisplay").html($("#nameInput").val());
  $("#addNameControl").show();  // Hide the add device link
  $("#addNameForm").slideUp();  // Show the add device form
  $("#error").hide();
}
else {
  $('#error').html("<div class='red-text text-darken-2'>Error: " + data.message + "</div>");
  $('#error').show();
}
}

function NameError(jqXHR, textStatus, errorThrown) {
if (jqXHR.statusCode == 404) {
  $('#error').html("<div class='red-text text-darken-2'>Server could not be reached.</div>");
  $('#error').show();
}
else {
  $('#error').html("<div class='red-text text-darken-2'>Error: " + jqXHR.responseJSON.message + "</div>");
  $('#error').show();
}
}

function showPasswordForm() {
  $("#oldPasswordInput").val("");        // Clear the input for the device ID
  $("#newPasswordInput").val("");        // Clear the input for the device ID
  $("#addPasswordControl").hide();   // Hide the add device link
  $("#addPasswordForm").slideDown();  // Show the add device form
}

// Hides the add device form and shows the add device button (link)
function hidePasswordForm() {
  $("#addPasswordControl").show();  // Hide the add device link
  $("#addPasswordForm").slideUp();  // Show the add device form
  $("#error").hide();
}

function changePassword() {
  $.ajax({
  url: '/users/change/password',
  type: 'PUT',
  headers: { 'x-auth': window.localStorage.getItem("authToken") },   
  contentType: 'application/json',
  data: JSON.stringify({oldPassword : $("#oldPasswordInput").val(),newPassword : $("#newPasswordInput").val()}),
  dataType: 'json'
  })
  .done(PasswordSuccess)
  .fail(PasswordError);
} 
  
function PasswordSuccess(data, textStatus, jqXHR) {
if (data.success) {  
  $("#addPasswordControl").show();  // Hide the add device link
  $("#addPasswordForm").slideUp();  // Show the add device form
  $("#error").hide();
}
else {
  $('#error').html("<div class='red-text text-darken-2'>Error: " + data.message + "</div>");
  $('#error').show();
}
}

function PasswordError(jqXHR, textStatus, errorThrown) {
if (jqXHR.statusCode == 404) {
  $('#error').html("<div class='red-text text-darken-2'>Server could not be reached.</div>");
  $('#error').show();
}
else {
  $('#error').html("<div class='red-text text-darken-2'>Error: " + jqXHR.responseJSON.message + "</div>");
  $('#error').show();
}
}

// Handle authentication on page load
$(function() {
  // If there's no authToekn stored, redirect user to 
  // the sign-in page (which is index.html)
  if (!window.localStorage.getItem("authToken")) {
    window.location.replace("index.html");
  }
  else {
    sendReqForAccountInfo();
    sendReqForDeviceInfo();
  }
  
  // Register event listeners
  $("#addDevice").click(showAddDeviceForm);
  $("#registerDevice").click(registerDevice);  
  $("#cancelDevice").click(hideAddDeviceForm);  
  $("#changeThresholdControl").click(showUVForm);
  $("#registerThreshold").click(changeUV);  
  $("#cancelUV").click(hideUVForm);
  $("#changeEmailControl").click(showEmailForm);
  $("#registerEmail").click(changeEmail);  
  $("#cancelEmail").click(hideEmailForm); 
  $("#changeNameControl").click(showNameForm);
  $("#registerName").click(changeName);  
  $("#cancelName").click(hideNameForm);
  $("#changePasswordControl").click(showPasswordForm);
  $("#registerPassword").click(changePassword);  
  $("#cancelPassword").click(hidePasswordForm); 
});
