# SunRunr ECE 413 2019
This is the README for the SunRunr project for ECE 413 2019

## Account Creation and Management:
[x] A user must be able to create an account, using an email address as the username 
	and a ​strong​ password, and register at least one device with their account.

[x] A user should be able to update any of their account information.

[x] A user should be able to replace a device with a new device in their account.

[x] A user should be able to have more than one device.

## SunRunr IoT Device:
[x] User must be able to press a button to start and stop activities.

[ ] The IoT device should use the onboard LEDs to indicate the activity status.

[ ] During an activity, the IoT device should periodically record the GPS location, speed, and
	UV exposure, at least at a rate of ​once every 15 seconds.​
[ ] If the UV exposure during an activity exceeds a user-defined threshold, an alert should be provided on the IoT device.

[ ] After an activity is complete, the IoT device should transmit the activity data to the server.

[ ] If the WiFi connection is not available, the IoT device should locally store the data for up
	to 24 hours and submit the data when later connected.

[ ] The IoT device should have an auto-pause feature: During an activity if the user’s speed
	is 0 for more than 30 seconds, the device should pause the activity data recording until
	the user starts moving again.

[x] The server should require an APIKEY from the IoT device for posting activity data.

## Web Application:

[ ] The web application should support the following views
	[ ] A summary view showing the user’s total activity duration, total calories burned, and total UV exposure in the past 7 days.
	[ ] An a​ ctivities summary view ​that lists all fitness activities with data summarizing each activity,
		 including the date of activity, duration of activity, calories burned, UV exposure, temperature, and humidity.
	[ ] An a​ ctivity detail view​ for a selected activity that will display the activity 
			date, duration, UV exposure, temperature, humidity, activity type, calories burned,
			and uses line charts to display the speed and UV exposure throughout the activity.
	[x] In the ​activity detail view,​ the web application should allow a user to change the 
		activity type. Activity types should minimally support walking, running, and biking.

[ ] The calculation of calories burned should be based on the activity type for each activity.

[x] The web application should allow the user to define a UV threshold. This should be in the account profile page.

[ ] The web application should include a weather forecast including UV index for at least
	the next five days, using a third party API

[ ] The web application should have a navigation menu.

[ ] The web application should use responsive design.

## Server:
[x] When an activity is sent to the server by the IoT device, the server should assign a
	default activity type based on the speed data.

[ ] When an activity is sent to the server by the IoT device, the server should use a
	third-party weather service to determine the temperature and humidity at the activity's
	location, which should be stored in the database for the activity.

[x] You must use Node.js, Express, MongoDB, and JavaScript.

[x] You must use RESTful APIs, commented well, and use token-based authentication
