/* global gapi: false, document: false, $: false */
/*jshint unused:false */

/*
 * JavaScript file for Suicide G+ Hangout App
 */

//Intialize deck variable
var deck = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51];

//Get participants using gapi
var players = gapi.hangout.getEnabledParticipants();

//Draw the players portaits
function drawPlayers(players){
	var html = "";
	for(var i = 0; i < players.length; i++){
		html += "<img src=\"" + gapi.hangout.av.getAvatar() +"\" height=\"60\" width=\"60\">" + "\n";
	}
	return html;
}

//Draw the cardTable
function drawTable(numberOfPlayers, playerNames){
	var tableHTML = "<table id=\"ctable\">" + "\n" + "<tr>" + "\n";
	for(var i = 0; i < numberOfPlayers; i++){
		tableHTML += "<th>"+playerNames[i]+"</th>"+"\n";
	}
	tableHTML += "</tr>" + "\n" + "<tr id=\"card1\">" + "\n";
	for(i = 0; i < numberOfPlayers; i++){
		//gen <td id="c1p'i'"> card 1 player i
		tableHTML += "<td id=\"c1p"+i+"\"></td>"+"\n";
	}
	tableHTML += "</tr>" + "\n" + "<tr id=\"card2\">" + "\n";
	for(i = 0; i < numberOfPlayers; i++){
		//gen <td id="c2p'i'">
		tableHTML += "<td id=\"c2p"+i+"\"></td>"+"\n";
	}
	tableHTML += "</tr>" + "\n" + "<tr id=\"card3\">" + "\n";
	for(i = 0; i < numberOfPlayers; i++){
		//gen <td id="c3p'i'">
		tableHTML += "<td id=\"c3p"+i+"\"></td>"+"\n";
	}
	tableHTML += "</tr>" + "\n" + "<tr id=\"card4\">" + "\n";
	for(i = 0; i < numberOfPlayers; i++){
		//gen <td id="c4p'i'">
		tableHTML += "<td id=\"c4p"+i+"\"></td>"+"\n";
	}
	tableHTML += "</tr>" + "\n" + "</table>";
	
	return tableHTML;
}

//On Start Button Click
$(document).ready(function(){
	$("#startButton").click(function(){
		$("#players").html(drawPlayers(players));
		$("#cardTable").html(drawTable);
		$("#actionButtons").html("<button type=\"button\" id=\"red\" onclick=\"guessRed();\">Red</button><button type=\"button\" id=\"black\" onclick=\"guessBlack();\">Black</button>");
	});	
});

//Function that uses Fisher-Yates algorithm to "shuffle the deck"
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

//Shuffle Deck
shuffleArray(deck);
//Variable to track whose turn it is
var turn = 0;
//Variable to track round
var round = 0;
//Card from top of "deck"
var currentCard = deck.pop;
//arrays to hold player hands
var hands;
for(var i = 0; i < players.length; i++){
	var pHand = [];
	hands[i] = pHand;
}

//function used to determine which card has been drawn based on the integer taken from the deck array
function idCard(card){
	//card mod 4 to get suit 1 heart 2 diamond 3 spade 0 club
	var suit = card % 4;
	var number = Math.floor(card / 4) + 2;
	var suitString = "";
	if (suit === 1){
		suitString = "Hearts";
	} else if (suit === 2){
		suitString = "Diamonds";
	} else if (suit === 3){
		suitString = "Spades";
	} else {
		suitString = "Clubs";
	}
	var cardName = number+" of "+suitString;
	return cardName;
}

//Function to take a card and place it in the correct place within the table
function cardToTable(turn, round, card){
	var tableID = "#c" + round + "p" + turn;
	$(tableID).html("<img src=\"cardImages/" + card + ".jpg\" height=\"60\" width=\"30\">");
}

//function to be run if player guesses red in first round
function guessRed(){
	var suit = currentCard % 4;
	var number = Math.floor(currentCard / 4) + 2;
	//if suit is red (1 or 2) the player will be prompted to give drinks
	if((suit === 1) || (suit === 2)){
		$("#instructions").html("<p>Give " + number + " drinks.</p>");
	}else {
		$("#instructions").html("<p>Take " + number + " drinks.</p>");
	}
	//add card to table in correct place
	cardToTable(turn, round, currentCard);
	//add card to player hand
	hands[turn[round]] = currentCard;
	//Increment turn and if all players have had a turn advance the round
	turn++;
	if(turn === players.length){
		round++;
		turn = 0;
		$("#actionButtons").html("<button type=\"button\" id=\"higher\" onclick=\"guessHigher();\">Higher</button><button type=\"button\" id=\"lower\" onclick=\"guessLower();\">Lower</button>");
	}
	currentCard = deck.pop;
}
//function to be run if player guesses black in first round
function guessBlack(){
	var suit = currentCard % 4;
	var number = Math.floor(currentCard / 4) + 2;
	//if suit is red (1 or 2) the player will be prompted to give drinks
	if((suit === 0) || (suit === 4)){
		$("#instructions").html("<p>Give " + number + " drinks.</p>");
	}else {
		$("#instructions").html("<p>Take " + number + " drinks.</p>");
	}
	//add card to table in correct place
	cardToTable(turn, round, currentCard);
	//add card to player hand
	hands[turn[round]] = currentCard;
	//Increment turn and if all players have had a turn advance the round
	turn++;
	if(turn === players.length){
		round++;
		turn = 0;
		$("#actionButtons").html("<button type=\"button\" id=\"higher\" onclick=\"guessHigher();\">Higher</button><button type=\"button\" id=\"lower\" onclick=\"guessLower();\">Lower</button>");
	}
	currentCard = deck.pop;
}
//function to be run if card is higher than first card
function guessHigher(){
	var currentNumber = Math.floor(currentCard / 4) + 2;
	var firstCardNumber = Math.floor(hands[turn[1]] / 4) + 2;
	//if card is higher than player will be prompted to give drinks
	if(currentNumber > firstCardNumber){
		$("#instructions").html("<p>Give " + currentNumber + " drinks.</p>");
	}else {
		$("#instructions").html("<p>Take " + currentNumber + " drinks.</p>");
	}
	//add card to table
	cardToTable(turn, round, currentCard);
	//add card to player hand
	hands[turn[round]] = currentCard;
	//Increment turn and if all players have had a turn advance the round
	if(turn === players.length){
		round++;
		turn = 0;
		$("#actionButtons").html("<button type=\"button\" id=\"inside\" onclick=\"guessInside();\">Inside</button><button type=\"button\" id=\"outside\" onclick=\"guessOutside();\">Outside</button>");
	}
}
