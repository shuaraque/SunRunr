// function sendRegisterRequest() {
//   console.log("working");
//   let email = $('#email').val();
//   let password = $('#password').val();
//   let fullName = $('#fullName').val();
//   let passwordConfirm = $('#passwordConfirm').val;
  
//   // Check to make sure the passwords match
//   // FIXME: Check to ensure strong password 
//   if (password != passwordConfirm) {
//     $('#ServerResponse').html("<span class='red-text text-darken-2'>Passwords do not match.</span>");
//     $('#ServerResponse').show();
//     rurn;
//   }
  
//    $.ajax({
//    url: '/users /register',
//    t ype: 'POST',
//    contentType: 'appli cation/json',
//    data : JSON .stringify({emai l:email, fullName:f ullName,  passwo rd:password}),
//    dataType: 'json'
//   })
//     .done(registerSuccess)
//     .fail(registerError);
// }

// function registerSuccess(data, textStatus, jqXHR{
//   if (data.success) {  
//     window.location = "index.html";
//   }
//   else {
//     $('#ServerResponse').html("<span class='red-text text-darken-2'>Error: " + data.message + "</span>");
//     $('#ServerResponse').show();
//   }
// }

// function registerError(jqXHR, textStatus, errorThrown) {
//   if (jqXHR.statusCode == 404) {
//     $('#ServerResponse').html("<span class='red-text text-darken-2'>Server could not be reached.</p>");
//     $('#ServerResponse').show();
//   }
//   else {
//     $('#ServerResponse').html("<span class='red-text text-darken-2'>Error: " + jqXHR.responseJSON.message + "</span>");
 
//   }
// }

  $(function() {
   $('#register').click(function() {
      window.location = "account.html";
   });
});