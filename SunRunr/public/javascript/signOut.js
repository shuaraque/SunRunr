$(function() {
   $('#signout').click(function() {
      window.localStorage.removeItem('authToken');
      window.location = "index.html";
   });
});
