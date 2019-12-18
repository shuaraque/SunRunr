<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
	 <title>Sun Runr - Acivities Summary</title>

	 <!-- Import jQuery -->
	 <script type="text/javascript" src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
	 <!-- Import Google Icon Font -->
	 <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
	 <!-- Compiled and minified CSS -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css">
    <!-- Compiled and minified JavaScript -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>

	 <link href="./stylesheets/style.css" rel="stylesheet">
	 <script src="./javascript/signOut.js"></script>
	 <script src="./javascript/activity.js"></script>

	 <!-- Let browser know website is optimized for mobile -->
	 <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>

<body>
	<!-- Dropdown Structure -->
   <ul id='dropdown1' class='dropdown-content'>
		<li><a href="account.html">Home</a></li>
		<li><a href="activitiesSummary.html">Activities Summary</a></li>
	   	<li><a href="summary.html">Summary</a></li>
		<li class="divider"></li>
		<li><a href="#!" id="signout">Sign out</a></li>
	</ul>
	<nav>
		<div class="nav-wrapper blue-grey darken-2">
			<a href="account.html" class="brand-logo left"><span id="name">Sun Runr</span></a>
			<ul class="right ">
				<!-- Dropdown Trigger -->
	         <li><a class='dropdown-trigger btn' href='#' data-target='dropdown1'><i class="material-icons">more_vert</i></a></li>
			</ul>
		</div>
	</nav>

	<div class="row" id="main">        
		<div class="col s12 m12">
			<ul class="collection with-header">
				<li class="collection-header">
					<span id = "title"><h5>Activities Summary</h5></span>
				</li>
				<span id="deviceInputPage">
				<li class="collection-item" id="deviceInput">
					<label for="deviceInput">Please Enter Device ID (Device ID's are Listed Below)</label>
					<input type="text" id="deviceInput2" name="deviceInput" col="30">
					<button id="registerdeviceInput" class="waves-effect waves-light btn">Show Activity for Device</button> 
					<button id="canceldeviceInput" class="waves-effect waves-light btn">Cancel</button> 
				</li>
				<span id = "knownDevices">
				</span>
					<div class='red-text text-darken-2' id="error"></div> 
				</span>
				
				<span id="activitySummaryPage"></span>
				<span id = "activitySelectionPage"></span>
				<span id="activityDetailPage"></span>
		</div>
	</div>
  </body>

  <!-- Initialize dropdown menu in materialize -->
  <script>
    $('.dropdown-trigger').dropdown();
  </script>

</html>
