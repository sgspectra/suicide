/* global gapi: false, document: false, $: false */
/*jshint unused:false */

/*
 * JavaScript file for Suicide G+ Hangout App
 */

// Dependencies
var _ = require('underscore');

// Templates
var playersTemplate = _.template(require('html!../html/players.html'));
var playerButtonsTemplate = _.template(require('html!../html/player-buttons.html'));

//Intialize deck variable
var deck = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51];

// Shuffle Deck and pull one from top
shuffleArray(deck);
var currentCard = deck.pop();

//Get participants using gapi
var players = ['Miles', 'Andrew'];
if (gapi.hangout.getEnabledParticipants() !== undefined) {
    players = gapi.hangout.getEnabledParticipants();
}

// Variable to track whose turn it is
var turn = 0;

// Variable to track round
var round = 0;
var drinks = 0;

// Initialize player hands
var hands = [];
for (var i = 0; i < players.length; i++) {
    hands[i] = [];
}

//h phase function and variables
var giveTakeCard = 0;

$(document).ready(function(){
    //On Start Button Click
	$('#startGame').on('click', function(){
        // Hide start button
        $(this).addClass('hidden');

        // Render players table
        $('#players').html(playersTemplate({
            'players' : players
        }));

        // Add a button for each player to the drink picker
        $('#drink-picker').find('div.modal-body').html(playerButtonsTemplate({
            'players' : players
        }));

        // Add red or black buttons for first round
		$("#actionButtons").html("<button class=\"btn btn-default\" type=\"button\" id=\"red\" onclick=\"suicide.guessRedOrBlack('red');\">Red</button><button class=\"btn btn-default\" type=\"button\" id=\"black\" onclick=\"suicide.guessRedOrBlack('black');\">Black</button>");
	});

    // When a player's name is picked from the drink picker
    $(document).on('click', '#drink-picker button.drink-pick', function(){
        var playerIndex = $(this).attr('data-playerindex');

        // Update table count
        var count = parseInt($('.p' + playerIndex + '-taken').text(), 10) + drinks;
        $('.p' + playerIndex + '-taken').text(count);

        // Update net
        var net = parseInt($('.p' + playerIndex + '-net').text(), 10) - drinks;
        $('.p' + playerIndex + '-net').text(net);

        // Close the drink picker
        $('#drink-picker').modal('hide');
    });
});

/**
 * Uses Fisher-Yates algorithm to "shuffle the deck"
 * @param array the array of card ids
 * @returns {a shuffled array}
 */
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }

    return array;
}

/**
 * Takes a card and places its image in the correct place within the table
 * @param turn an integer of the current player index
 * @param round an integer of the current round
 * @param card an integer of the card id
 */
function cardToTable(turn, round, card){
	var tableID = ".c" + round + "p" + turn;
	$(tableID).html("<img src=\"img/cards/" + card + ".png\" height=\"73px\" width=\"50px\">");
}

/**
 * Given a card id returns the real number and suit
 * @param card the card id from 0-51
 * @returns {{number: an integer of the real card number (2 - 14), suit: a string of the suit}}
 */
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

/**
 * Given the # of drinks that need to be given, modifies the player table to add the right number
 * @param drinks an integer of the real card number (2-14)
 */
function giveDrinksTo(_drinks){
    // Store the drink count so when we pick from the modal we can assign the right number
    drinks = _drinks;

    // Update table count
    var count = parseInt($('.p' + turn + '-given').text(), 10) + _drinks;
    $('.p' + turn + '-given').text(count);

    // Update net
    var net = parseInt($('.p' + turn + '-net').text(), 10) + _drinks;
    $('.p' + turn + '-net').text(net);

    // Render instruction
    $("#instructions").html("<p>Give " + _drinks + " drinks.</p>");

    // Launches the drink picker modal so that the current player can pick who to assign drinks to
    $('#drink-picker').modal();
}

/**
 * Given the # of drinks that need to be taken, modifies the player table to add the right number
 * @param drinks an integer of the real card number (2-14)
 */
function takeDrinks(drinks){
    // Update table count
    var count = parseInt($('.p' + turn + '-taken').text(), 10) + drinks;
    $('.p' + turn + '-taken').text(count);

    // Update net
    var net = parseInt($('.p' + turn + '-net').text(), 10) - drinks;
    $('.p' + turn + '-net').text(net);

    // Render instruction
    $("#instructions").html("<p>Take " + drinks + " drinks.</p>");
}

/**
 * Processes guesses for the red or black round
 * @param guess a string of either red or black
 */
function guessRedOrBlack(guess){
	var card = getNumberAndSuit(currentCard);

    if (guess === 'red') {
        console.log('player guessed red');
        console.log('card was', card.number, 'of', card.suit);

        //if suit is red the player will be prompted to give drinks
        if ((card.suit === 'hearts') || (card.suit === 'diamonds')){
            giveDrinksTo(card.number);
        } else {
            takeDrinks(card.number);
        }
    } else {
        console.log('player guessed black');
        console.log('card was', card.number, 'of', card.suit);

        //if suit is black the player will be prompted to give drinks
        if ((card.suit === 'clubs') || (card.suit === 'spades')){
            giveDrinksTo(card.number);
        } else {
            takeDrinks(card.number);
        }
    }

    $('#instructions').removeClass('hidden');

	//add card to table in correct place
	cardToTable(turn, round, currentCard);

	//add card to player hand
	hands[turn][round] = currentCard;

	//Increment turn and if all players have had a turn advance the round
    turn++;
	if (turn === players.length){
		round++;
		turn = 0;
        $("#actionButtons").html("<button class=\"btn btn-default\" type=\"button\" id=\"higher\" onclick=\"suicide.guessHigherOrLower('higher');\">Higher</button><button class=\"btn btn-default\" type=\"button\" id=\"lower\" onclick=\"suicide.guessHigherOrLower('lower');\">Lower</button>");
	}

	currentCard = deck.pop();
}

/**
 * Processes guesses for the higher or lower round
 * @param guess a string of either higher or lower
 */
function guessHigherOrLower(guess){
    var card = getNumberAndSuit(currentCard);
	var firstCard = getNumberAndSuit(hands[turn][0]);

	//if card is higher than player will be prompted to give drinks
    if (guess === 'higher') {
        console.log('player guessed higher');

        if (card.number > firstCard.number) {
            console.log('card was higher');
            giveDrinksTo(card.number);
        } else {
            console.log('card was lower');
            takeDrinks(card.number);
        }
    } else {
        console.log('player guessed lower');

        if (card.number < firstCard.number) {
            console.log('card was lower');
            giveDrinksTo(card.number);
        } else {
            console.log('card was higher');
            takeDrinks(card.number);
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
		$("#actionButtons").html("<button class=\"btn btn-default\" type=\"button\" id=\"inside\" onclick=\"suicide.guessInsideOrOutside('inside');\">Inside</button><button class=\"btn btn-default\" type=\"button\" id=\"outside\" onclick=\"suicide.guessInsideOrOutside('outside');\">Outside</button>");
	}

    currentCard = deck.pop();
}

/**
 * Processes guesses for the inside or outside round
 * @param guess a string of either inside or outside
 */
function guessInsideOrOutside(guess){
	//current card and previous cards to compare against
	var card = getNumberAndSuit(currentCard);
	var firstCard = getNumberAndSuit(hands[turn][0]);
	console.log(firstCard.number);
	var secondCard = getNumberAndSuit(hands[turn][1]);
	console.log(secondCard.number);
	if(guess === 'inside'){
		console.log('player guessed inside');
		if (firstCard.number < secondCard.number){
			if (card.number > firstCard.number && card.number < secondCard.number){
				console.log('card was inside');
                giveDrinksTo(card.number);
			}else {
				console.log('card was outside');
                takeDrinks(card.number);
			}
		}else if (firstCard.number > secondCard.number){
			if (card.number > secondCard.number && card.number < firstCard.number){
				console.log('card was inside');
                giveDrinksTo(card.number);
			}else {
				console.log('card was outside');
                takeDrinks(card.number);
			}
		}else {
			console.log('first and second card are the same number, inside not possible');
            takeDrinks(card.number);
		}
	}else {
		console.log('player guessed outside');
		if (firstCard.number < secondCard.number){
			if (card.number > firstCard.number && card.number < secondCard.number){
				console.log('card was inside');
                takeDrinks(card.number);
			}else {
				console.log('card was outside');
                giveDrinksTo(card.number);
			}
		}else if (firstCard.number > secondCard.number){
			if (card.number > secondCard.number && card.number < firstCard.number){
				console.log('card was inside');
                takeDrinks(card.number);
			}else {
				console.log('card was outside');
                giveDrinksTo(card.number);
			}
		}else {
			console.log('first and second card are the same number, inside not possible');
			if (card.number !== firstCard.number){
                giveDrinksTo(card.number);
			}else {
				console.log('card was the same, not outside');
                takeDrinks(card.number);
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
		$("#actionButtons").html("<button class=\"btn btn-default\" type=\"button\" id=\"diamond\" onclick=\"suicide.guessSuit('diamonds');\">Diamonds</button><button class=\"btn btn-default\" type=\"button\" id=\"heart\" onclick=\"suicide.guessSuit('hearts');\">Hearts</button><button class=\"btn btn-default\" type=\"button\" id=\"club\" onclick=\"suicide.guessSuit('clubs');\">Clubs</button><button class=\"btn btn-default\" type=\"button\" id=\"spade\" onclick=\"suicide.guessSuit('spades');\">Spades</button>");
	}

    currentCard = deck.pop();
}

/**
 * Processes guesses for the suit round
 * @param guess a string of one of heart, club, diamond, spade
 */
function guessSuit(guess){
	var card = getNumberAndSuit(currentCard);
	console.log(card.suit);

	if (guess === card.suit){
		console.log('suit was guessed correctly');
        giveDrinksTo(card.number);
	} else {
		console.log('incorrect guess');
        takeDrinks(card.number);
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
		//TODO Begin next phase of the game.
		$("#actionButtons").html("<button class=\"btn btn-default\" type=\"button\" id=\"flipCard\" onclick=\"suicide.flipCard();\">Flip Card</button>");
	}

    currentCard = deck.pop();
}

/**
 * Flips the next card in the H over
 */
function flipCard(){
	//id for placing card in proper spot should be giveTake# (0-9)
	var card = getNumberAndSuit(currentCard);
	//"flips card image"
	$(document).ready(function(){
		$("#flipNext").click(function(){
			var id = "giveTake" + giveTakeCard;
			$(id).html("<img src=\"img/cards/" + card + ".png\" height=\"73px\" width=\"50px\">");
		});
	});
	//prepares instructions
	var inst = "";
	for (var i = 0; i < players.length; i++){
		var scanHand = hands[i];
		for(var j = 0; j < scanHand; j++){
			var comparedCard = getNumberAndSuit(scanHand[j]);
			if(card.number === comparedCard.number){
				inst += "<p>" + players[i].person.displayName + " give " + card.number + " drinks.</p><\n>";
			}
		}
	}
	$(document).ready(function(){
		$("#instructions").html(inst);
	});
	giveTakeCard++;
	if (giveTakeCard === 10){
		("#flipNext").hide();
	}
}

// Export members so that they can be used in the suicide.* namespace
module.exports = {
    'flipCard' : flipCard,
	'guessSuit' : guessSuit,
    'guessHigherOrLower' : guessHigherOrLower,
    'guessInsideOrOutside' : guessInsideOrOutside,
    'guessRedOrBlack' : guessRedOrBlack
};
