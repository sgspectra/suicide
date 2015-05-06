/**
 * Created by andrewstorch on 5/6/15.
 *
 * JS for Suicide Google Hangout App.
 */


//Hide Elements that are optional or accessed later.
  $(document).ready(function(){
    $("#addPlayerForm").hide();
  });


//Load the users in the Hangout into a list displaying their names on html page.
  var users = "";
  var participants = gapi.hangout.getParticipants();
  var i = 0;
  while (participants[i]){
    users += (participants[i] + "</br>");
    i++;
  }
  $(document).ready(function(){
    $("#players").append(users);
  });

//Accessing the Add Player Form
  $(document).ready(function(){
    $("#addPlayer").click(function(){
      $("#addPlayerForm").show();
    });
  });

//Adding Player to participants array
  function addToParticipantArray(form){
    participants[participants.length] = form.playername.value;
    $(document).ready(function(){
      $("#formField1").val("");
    });
  }

