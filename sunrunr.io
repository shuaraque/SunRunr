// This #include statement was automatically added by the Particle IDE.
#include <ArduinoJson.h>

// This #include statement was automatically added by the Particle IDE.
#include <Adafruit_GPS.h>

// This #include statement was automatically added by the Particle IDE.
#include <Adafruit_VEML6070.h>

// This #include statement was automatically added by the Particle IDE.
#include <AssetTracker.h>

#include <string>

//Set time period for a full day in milliseconds
#define ONE_DAY_MILLIS (24*60*60*1000)

//Set time period for pause intiation
#define PAUSE_THRESHOLD (30*1000)

//Set time period for recording data
#define ACTIVITY_RECORD (15*1000)

using namespace std;

static const int MAXVAL = 240;  //enough points for 1 hour of activity at 15second intervals

//Hardware setup
Adafruit_VEML6070 UVTracker = Adafruit_VEML6070();
AssetTracker locationTracker = AssetTracker();
int button = BTN;   //Button Setup (what to press for activity)
int led = D7;       //LED for UV alarm
bool ledON = false;
unsigned long pauseCounter = 0;
unsigned long activityCounter = 0;

//Variable items
unsigned long lastSync = millis();
unsigned long dayCounter = 0;
float totalUV = 0.0;      //UV accumulated
float userUV = 2;         //init val to be replaced by user entry on site
float longitude;  //array of longitude data
float latitude;   //array of latitude data
int i = 0;                //counter
int pos = 0; 
float averageSpeed = 0; 
int totalSpeed = 0; 
int arrayCounter = 0;
bool stateMachineOn = false;
bool gotUV = false;
bool beginTimeDone = false;
unsigned long beginTime = 0;
unsigned long endTime = 0; 
int activityID = 0; 

StaticJsonDocument<300> doc;

//Stat machine set up
enum State {wait, startActivity, pauseActivity, sendData};
State state = wait;

void stateMachineScheduler(){
  stateMachineOn = true;
}

Timer stateTimer(1000, stateMachineScheduler);

void setup() {

    //using the built in RGB LED
    RGB.control(true);

  //enable serial monitor
  Serial.begin(9600);

  //enable UV reader
  UVTracker.begin(VEML6070_1_T);
  locationTracker.begin();
  locationTracker.gpsOn();

  //setup on LED and Button
  pinMode(led, OUTPUT);
  pinMode(button, INPUT);
  Particle.process();

  //insert the already written one here
  Particle.subscribe("hook-response/hit", myHandler, MY_DEVICES);
  //add a new one to get the UV threshold from the user
  //Particle.subscribe("hook-response/uvthreshold", uvHandler, MY_DEVICES);

  stateTimer.start();
  
}

void loop() {
  if(millis() - lastSync > ONE_DAY_MILLIS){
    Particle.syncTime();
    lastSync = millis();
  }

  if(stateMachineOn){
    locationTracker.updateGPS();
    stateMachine();
    stateMachineOn = false;
  }
  
  locationTracker.updateGPS();
  
}

void stateMachine(){
  switch(state){
    //wait
    case wait:
    {
        RGB.color(0,0,0);
      ledON = false;
      digitalWrite(led, LOW);
      Serial.println("WAIT");
      pauseCounter = millis();
      
      //if button is pressed, start activity
      if(digitalRead(button)==0){
        state = startActivity;
        //Particle.publish("","", PRIVATE);
      }

      break;
    }

  //does there need to be an "activity" state as well as a "startActivity" state?

    //startActivity
    case startActivity:
    {
      //turn LED on to indicate activity started
      RGB.color(0,255,0);
      digitalWrite(led, LOW);
      Serial.println("START ACTIVITY");

      //if activity counter hasn't been set, set it
      if(activityCounter == 0){
        activityCounter = millis();
      }

      //if UV value is greater than user threshold turn on alarm
      if(totalUV >= userUV){
        digitalWrite(led,(ledON) ? HIGH : LOW);
        ledON = !ledON;
      }

      //if person presses button, end activity and send data
      if(digitalRead(button)==0){
        state = sendData;
        digitalWrite(led, LOW);
        dayCounter = millis(); //reset the dayCounter to current time
        break;
      }

      //if person moving, reset pauseCounter
      if(locationTracker.getSpeed() != 0){
        pauseCounter = millis();
      }

      if(millis() - pauseCounter > PAUSE_THRESHOLD){  //no movement for 30 seconds
        state = pauseActivity;
        break;
      }

      //record activity every noted amount of seconds
      if(millis() - activityCounter > ACTIVITY_RECORD){
        totalUV = totalUV + UVTracker.readUV();
        totalSpeed = totalSpeed + locationTracker.getSpeed();
        activityCounter = millis(); //reset actvity record timer
        endTime = millis();
        arrayCounter++;
        if(!beginTimeDone){
            beginTime = millis();
            beginTimeDone = true;
            longitude = locationTracker.readLonDeg();
            latitude = locationTracker.readLatDeg();
        }
      }

      break;
    }

    //pauseActivity
    case pauseActivity:
    {
        RGB.color(255,255,50);
        Serial.println("PAUSE ACTIVITY");
      //if speed still 0 stay paused
      //check if this needs to be changed to a treshold speed
      if(locationTracker.getSpeed() == 0){
        state = pauseActivity;
      }

      else{
        state = startActivity;
        pauseCounter = millis();
        break;
      }
      //if person started moving, go back to activity

      if(digitalRead(button)==0){
        state=sendData;
        break;
      }

      break;
    }

    //sendData
    case sendData:
    {
        RGB.color(0,0,0);
      Serial.println("SEND DATA");
      if(WiFi.ready()){
        state = wait;
        //String start = String::format("{ \"command\": \"start\" }");
        //Particle.publish("activate", start, PRIVATE);
        averageSpeed = totalSpeed/arrayCounter;
        activityID++;
        arrayCounter = 0;
        delay(1000);
        
          String data = String::format("{ \"activityID\": \"%f\", \"longitude\": \"%f\", \"latitude\": \"%f\", \"averageSpeed\": \"%f\", \"UVSum\": \"%f\", \"beginTime\": \"%f\", \"endTime\": \"%f\" }", activityID, longitude, latitude, averageSpeed, totalUV, beginTime, endTime);
          Particle.publish("hit", data, PRIVATE);

        //String end = String::format("{ \"command\": \"end\" }");
        //Particle.publish("activate", end, PRIVATE);
        beginTimeDone = false;
        break;
      }

      //empty lists if they've sat for 24hrs
      else if(millis() - dayCounter > ONE_DAY_MILLIS){
        state = wait;
        totalUV = 0;
        longitude = 0;
        latitude = 0;
        totalUV = 0;
        totalSpeed = 0;
        averageSpeed = 0;
        beginTime = 0;
        endTime = 0; 
        beginTimeDone = false;
        break;
      }

      //empty lists if a person starts a new workout before internet connected
      if(digitalRead(button) == 0){
        state = startActivity;
        totalUV = 0;
        longitude = 0;
        latitude = 0;
        totalSpeed = 0;
        averageSpeed = 0;
        beginTime = 0;
        endTime = 0; 
        beginTimeDone = false;
        break;
      }
      break;
    }
  }
}

void myHandler(const char *event, const char *data) {
    // Formatting output
    String output = String::format("Response from Post:\n  %s\n", data);
    
    
    if(!gotUV){
        gotUV = true;
        deserializeJson(doc, data);
        userUV = doc["uvThreshold"];
    }

}
