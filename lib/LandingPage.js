/**
 * Created by andrewstorch on 5/6/15.
 *
 * JS for Suicide Google Hangout App.
 */


//Hide Elements that are optional or accessed later.
  $(document).ready(function(){
    $("#addPlayerForm").hide();
    $(".ingame").hide();
  });


//Load the users in the Hangout into a list displaying their names on html page.
  var users = "";
  //var participants = gapi.hangout.getParticipants();
  var participants = ["blah"];
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

//Adding Player to participants array after new player form is submitted.
  function addToParticipantArray(form){
    participants[participants.length] = form.playername.value;
    $(document).ready(function(){
      $("#players").append(form.playername.value + "</br>");
      $("#formField1").val("");
    });
  }

/**
 * When we move to actual gameplay, the participant array needs to be passed through to the next page somehow.
 *
 * Design as 1 page that hides major parts when gameplay starts or 2 pages (landing and gameplay).
 */

//Start game button function
function startGame(){
    $(document).ready(function(){
        $(".pregame").hide();
        $(".ingame").show();
    });
}


