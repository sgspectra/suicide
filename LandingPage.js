/**
 * Created by andrewstorch on 5/6/15.
 *
 * JS for Suicide Google Hangout App.
 */


//Load the users in the Hangout into a list displaying their names on html page.

var users = "";
var participants = gapi.hangout.getParticipants();
var i = 0;
while (participants[i]){
  users += (participants[i] + "</br>");
  i++;
}
$(document).ready(function(){
  $("#users").append(users);
});
