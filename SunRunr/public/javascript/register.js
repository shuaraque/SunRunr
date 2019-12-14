function sendRegisterRequest() {
let email = $('#email').val();
let password = $('#password').val();
let fullName = $('#fullName').val();
let passwordConfirm = $('#passwordConfirm').val();
let validLogin = true;

  // Reset the Server Response
  $('#ServerResponse').html("");
  $('#ServerResponse').hide();
  
  let emailRe = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;
  let passwordLowerRe = /[a-z]/;
  let passwordUpperRe = /[A-Z]/;
  let passwordNumRe = /[0-9]/;
  let passwordSpecCharRe = /[!@#\$%\^&]+/;
  
  let emailReCheck = emailRe.exec(email);
  let passwordLowerReCheck = passwordLowerRe.exec(password);
  let passwordUpperReCheck = passwordUpperRe.exec(password);
  let passwordNumReCheck = passwordNumRe.exec(password);
  let passwordSpecCharReCheck = passwordSpecCharRe.exec(password);

if(fullName.length <= 0){
    $('#ServerResponse').append("<div class='red-text text-darken-2'>Missing full name.</div>");
    $('#ServerResponse').show();
    validLogin = false;
  }

if(emailReCheck === null){
    $('#ServerResponse').append("<div class='red-text text-darken-2'>Invalid or missing email address.</div>");
    $('#ServerResponse').show();
    validLogin = false;
  }

if(isNaN(password.length) || password.length < 8 || password.length > 20){
    $('#ServerResponse').append("<div class='red-text text-darken-2'>Password must be between 10 and 20 characters.</div>");
    $('#ServerResponse').show();
    validLogin = false;
  }

if(passwordLowerReCheck === null){
    $('#ServerResponse').append("<div class='red-text text-darken-2'>Password must contain at least one lowercase character.</div>");
    $('#ServerResponse').show();
    validLogin = false;
  }

if(passwordUpperReCheck === null){
    $('#ServerResponse').append("<div class='red-text text-darken-2'>Password must contain at least one uppercase character.</div>");
    $('#ServerResponse').show();
    validLogin = false;
  }

if(passwordNumReCheck === null){
    $('#ServerResponse').append("<div class='red-text text-darken-2'>Password must contain at least one digit.</div>");
    $('#ServerResponse').show();
    validLogin = false;
  }

if(passwordConfirm != password){
  $('#ServerResponse').append("<div class='red-text text-darken-2'>Password and confirmation password don't match.</div>");
  $('#ServerResponse').show();
  }

if(!validLogin){
  return;
}

$.ajax({
  url: '/users/register',
  type: 'POST',
  contentType: 'application/json',
  data: JSON.stringify({email:email, fullName:fullName, password:password}),
  dataType: 'json'
  })
  .done(registerSuccess)
  .fail(registerError);
}

function registerSuccess(data, textStatus, jqXHR) {
  if (data.success) {  
    window.location = "index.html";
  }
  else {
    $('#ServerResponse').html("<div class='red-text text-darken-2'>Error: " + data.message + "</div>");
    $('#ServerResponse').show();
  }
}

function registerError(jqXHR, textStatus, errorThrown) {
  if (jqXHR.statusCode == 404) {
    $('#ServerResponse').html("<div class='red-text text-darken-2'>Server could not be reached.</div>");
    $('#ServerResponse').show();
  }
  else {
    $('#ServerResponse').html("<div class='red-text text-darken-2'>Error: " + jqXHR.responseJSON.message + "</div>");
    $('#ServerResponse').show();
  }
}

$(function () {
  $('#signup').click(sendRegisterRequest);
});
