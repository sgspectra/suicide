/* global gapi: false, document: false, $: false */
/*jshint unused:false */

/*
 * JavaScript file for Suicide G+ Hangout App
 */

//Intialize deck variable
var deck = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51];

//Get participants using gapi
var players = ['Miles', 'Andrew'];
if (gapi.hangout.getEnabledParticipants() !== undefined) {
    players = gapi.hangout.getEnabledParticipants();
}

//Draw the players portaits
function drawPlayers(players){
	var html = "";
	for(var i = 0; i < players.length; i++){
        html += "<img src=\"img/person-icon.png\" height=\"60\" width=\"60\">" + "\n";
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
		tableHTML += "<td id=\"c0p"+i+"\"></td>"+"\n";
	}
	tableHTML += "</tr>" + "\n" + "<tr id=\"card2\">" + "\n";
	for(i = 0; i < numberOfPlayers; i++){
		//gen <td id="c2p'i'">
		tableHTML += "<td id=\"c1p"+i+"\"></td>"+"\n";
	}
	tableHTML += "</tr>" + "\n" + "<tr id=\"card3\">" + "\n";
	for(i = 0; i < numberOfPlayers; i++){
		//gen <td id="c3p'i'">
		tableHTML += "<td id=\"c2p"+i+"\"></td>"+"\n";
	}
	tableHTML += "</tr>" + "\n" + "<tr id=\"card4\">" + "\n";
	for(i = 0; i < numberOfPlayers; i++){
		//gen <td id="c4p'i'">
		tableHTML += "<td id=\"c3p"+i+"\"></td>"+"\n";
	}
	tableHTML += "</tr>" + "\n" + "</table>";
	
	return tableHTML;
}

//On Start Button Click
$(document).ready(function(){
	$("#startGame").on('click', function(){
		$("#players").html(drawPlayers(players));
		$("#cardTable").html(drawTable(players.length, players));
		$("#actionButtons").html("<button type=\"button\" id=\"red\" onclick=\"guessRedOrBlack('red');\">Red</button><button type=\"button\" id=\"black\" onclick=\"guessRedOrBlack('black');\">Black</button>");
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
var currentCard = deck.pop();
//arrays to hold player hands
var hands = [];
for(var i = 0; i < players.length; i++){
	var pHand = [];
	hands[i] = pHand;
}

//Function to take a card and place it in the correct place within the table
function cardToTable(turn, round, card){
	var tableID = "#c" + round + "p" + turn;
	$(tableID).html("<img src=\"img/cards/" + card + ".png\" height=\"60\" width=\"30\">");
}

function getNumberAndSuit(card){
    var suit = card % 4;

    if (suit === 1) {
        suit = 'hearts';
    } else if (suit === 2) {
        suit = 'diamonds';
    } else if (suit === 3) {
        suit = 'spades';
    } else {
        suit = 'clubs';
    }

    return {
        'number' : Math.floor(card / 4) + 2,
        'suit' : suit
    };
}

//function to be run if player guesses red in first round
function guessRedOrBlack(guess){
	var card = getNumberAndSuit(currentCard);

    if (guess === 'red') {
        console.log('player guessed red');
        console.log('card was', card.number, 'of', card.suit);

        //if suit is red the player will be prompted to give drinks
        if ((card.suit === 'hearts') || (card.suit === 'diamonds')){
            $("#instructions").html("<p>Give " + card.number + " drinks.</p>");
        } else {
            $("#instructions").html("<p>Take " + card.number + " drinks.</p>");
        }
    } else {
        console.log('player guessed black');
        console.log('card was', card.number, 'of', card.suit);

        //if suit is black the player will be prompted to give drinks
        if ((card.suit === 'clubs') || (card.suit === 'spades')){
            $("#instructions").html("<p>Give " + card.number + " drinks.</p>");
        } else {
            $("#instructions").html("<p>Take " + card.number + " drinks.</p>");
        }
    }

	//add card to table in correct place
	cardToTable(turn, round, currentCard);

	//add card to player hand
	hands[turn][round] = currentCard;

	//Increment turn and if all players have had a turn advance the round
    turn++;
	if (turn === players.length){
		round++;
		turn = 0;
        $("#actionButtons").html("<button type=\"button\" id=\"higher\" onclick=\"guessHigherOrLower('higher');\">Higher</button><button type=\"button\" id=\"lower\" onclick=\"guessHigherOrLower('lower');\">Lower</button>");
	}

	currentCard = deck.pop();
}

//function to be run if card is higher than first card
function guessHigherOrLower(guess){
    var card = getNumberAndSuit(currentCard);
	var firstCard = getNumberAndSuit(hands[turn][0]);

	//if card is higher than player will be prompted to give drinks
    if (guess === 'higher') {
        console.log('player guessed higher');

        if (card.number > firstCard.number) {
            console.log('card was higher');
            $("#instructions").html("<p>Give " + card.number + " drinks.</p>");
        } else {
            console.log('card was lower');
            $("#instructions").html("<p>Take " + card.number + " drinks.</p>");
        }
    } else {
        console.log('player guessed lower');

        if (card.number < firstCard.number) {
            console.log('card was lower');
            $("#instructions").html("<p>Give " + card.number + " drinks.</p>");
        } else {
            console.log('card was higher');
            $("#instructions").html("<p>Take " + card.number + " drinks.</p>");
        }
    }

	//add card to table
	cardToTable(turn, round, currentCard);

	//add card to player hand
	hands[turn][round] = currentCard;

	//Increment turn and if all players have had a turn advance the round
    turn++;
	if (turn === players.length) {
		round++;
		turn = 0;
		$("#actionButtons").html("<button type=\"button\" id=\"inside\" onclick=\"guessInside();\">Inside</button><button type=\"button\" id=\"outside\" onclick=\"guessOutside();\">Outside</button>");
	}

    currentCard = deck.pop();
}

//function for inside or outside
function guessInsideOrOutside(guess){
	//current card and previous cards to compare against
	var card = getNumberAndSuit(currentCard);
	var firstCard = getNumberAndSuit(hands[turn[0]]);
	var secondCard = getNumberAndSuit(hands[turn][1]);
	if(guess === 'inside'){
		console.log('player guessed inside');
		if (firstCard.number < secondCard.number){
			if (card.number > firstCard.number && card.number < secondCard.number){
				console.log('card was inside');
				$("#instructions").html("<p>Give " + card.number + " drinks.</p>");
			}else {
				console.log('card was outside');
				$("#insturctions").html("<p>Take " + card.number + " drinks.</p>");
			}
		}else if (firstCard.number > secondCard.number){
			if (card.number > secondCard.number && card.number < firstCard.number){
				console.log('card was inside');
				$("#instructions").html("<p>Give " + card.number + " drinks.</p>");
			}else {
				console.log('card was outside');
				$("#instructions").html("<p>Take " + card.number + " drinks.</p>");
			}
		}else {
			console.log('first and second card are the same number, inside not possible');
			$("#instructions").html("<p>Take " + card.number + " drinks.</p>");
		}
	}else {
		console.log('player guessed outside');
		if (firstCard.number < secondCard.number){
			if (card.number > firstCard.number && card.number < secondCard.number){
				console.log('card was inside');
				$("#instructions").html("<p>Take " + card.number + " drinks.</p>");
			}else {
				console.log('card was outside');
				$("#insturctions").html("<p>Give " + card.number + " drinks.</p>");
			}
		}else if (firstCard.number > secondCard.number){
			if (card.number > secondCard.number && card.number < firstCard.number){
				console.log('card was inside');
				$("#instructions").html("<p>Take " + card.number + " drinks.</p>");
			}else {
				console.log('card was outside');
				$("#instructions").html("<p>Give " + card.number + " drinks.</p>");
			}
		}else {
			console.log('first and second card are the same number, inside not possible');
			if (card.number !== firstCard.number){
				$("#instructions").html("<p>Give " + card.number + " drinks.</p>");
			}else {
				console.log('card was the same, not outside');
				$("#instructions").html("<p>Take " + card.number + " drinks.</p>");
			}
		}
	}
	//add card to table
	cardToTable(turn, round, currentCard);

	//add card to player hand
	hands[turn][round] = currentCard;

	//Increment turn and if all players have had a turn advance the round
    turn++;
	if (turn === players.length) {
		round++;
		turn = 0;
		$("#actionButtons").html("<button type=\"button\" id=\"inside\" onclick=\"guessInside();\">Inside</button><button type=\"button\" id=\"outside\" onclick=\"guessOutside();\">Outside</button>");
	}

    currentCard = deck.pop();
}
