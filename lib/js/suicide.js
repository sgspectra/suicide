/* global gapi: false, document: false, $: false, _: false */

/*
 * JavaScript file for Suicide G+ Hangout App
 */

// Dependencies
require('../bower_components/todc-bootstrap/dist/js/bootstrap');
require('../bower_components/todc-bootstrap/dist/css/bootstrap.min.css');
require('../bower_components/todc-bootstrap/dist/css/todc-bootstrap.min.css');
require('../css/styles.less');

// Templates
var playersTemplate = _.template(require('html!../html/players.html'));
var playerButtonsTemplate = _.template(require('html!../html/player-buttons.html'));

// Intialize deck variable
var deck = [];
for (var i = 0; i < 52; i++) {
    deck.push(i);
}

/**
 * Uses Fisher-Yates algorithm to "shuffle the deck"
 * @param array the array of card ids
 * @returns {a shuffled array}
 */
function shuffleArray(array){
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }

    return array;
}

// Shuffle Deck and pull one from top
shuffleArray(deck);
var currentCard = deck.pop();

// Get participants using gapi
var players = ['Miles', 'Andrew'];
if (gapi.hangout.getEnabledParticipants() !== undefined) {
    players = gapi.hangout.getEnabledParticipants();
}

// Variable to track whose turn it is
var turn = 0;

// Variable to track round
var round = 0;
var drinks = 0;
var givenDrinks = [];

// Initialize player hands
var hands = [];
for (var i = 0; i < players.length; i++) {
    hands[i] = [];
}

// h phase function and variables
var giveTakeCard = 0;

// function to render player table
function renderPlayerTable(){
    $(document).ready(function(){
        $('#players').html(playersTemplate({
            'players' : players
        }));
    });
}

$(document).ready(function(){
    // On Start Button Click
    $('#startGame').on('click', function(){
        // Hide start button
        $(this).addClass('hidden');

        // Render players table
        renderPlayerTable();

        // Add red or black buttons for first round
        $('#actionButtons').html('<button class="btn btn-default" type="button" id="red" onclick="suicide.guessRedOrBlack(\'red\');\">Red</button><button class="btn btn-default" type="button" id="black" onclick=\"suicide.guessRedOrBlack(\'black\');">Black</button>');
    });

    // When a count dropdown is picked from the drink picker
    $(document).on('click', '#drink-picker a.drink-pick', function(event){
        event.preventDefault();

        // Get selected drink count
        var count = parseInt($(this).text(), 10);

        // Update given drinks
        givenDrinks[parseInt($(this).attr('data-playerindex'), 10)] = count;

        // Update dropdown
        $(this).parents('.btn-group').find('button span.drink-count').text(count);

        // Update bottom footer
        var total = 0;
        $('#drink-picker').find('button span.drink-count').each(function(){
            total += parseInt($(this).text(), 10);
        });

        $('#drink-picker').find('tfoot td').text(total);

        // Enable the give button if the total is met
        if (total === drinks) {
            $('#drink-picker').find('button.drink-assign').prop('disabled', false);
        } else {
            $('#drink-picker').find('button.drink-assign').prop('disabled', true);
        }
    });

    // When the all button for a player is selected from the drink picker
    $(document).on('click', '#drink-picker button.drink-pick-all', function(){
        var playerIndex = parseInt($(this).attr('data-playerindex'), 10);

        // Update given drinks
        for (var i = 0; i < players.length; i++) {
            if (i === playerIndex) {
                givenDrinks[i] = drinks;
            } else {
                givenDrinks[i] = 0;
            }
        }

        // First set all dropdowns to 0
        $('#drink-picker').find('span.drink-count').text(0);

        // Set the selected players dropdown to max
        $('#drink-picker').find('span.drink-count').eq(playerIndex).text(drinks);

        // Update the total footer
        $('#drink-picker').find('td.drink-pick-total').text(drinks);

        // Enable the give button
        $('#drink-picker').find('button.drink-assign').prop('disabled', false);
    });

    // When the split button is selected
    $(document).on('click', '#drink-picker button.drink-split', function(){
        // If the number of drinks can be divided equally among the players, distribute equally
        if ((drinks % players.length) === 0) {
            // Update given drinks
            for (var i = 0; i < players.length; i++) {
                givenDrinks[i] = drinks / players.length;
            }

            // Update dropdown values
            $('#drink-picker').find('span.drink-count').text(drinks / players.length);
        } else {
            // Calculate how many we can distribute and the remainder
            var canDistribute = Math.floor(drinks / players.length);
            var remainder = drinks - (canDistribute * players.length);

            // Give each player the equal share
            var playerIndices = [];
            for (var j = 0; j < players.length; j++) {
                givenDrinks[j] = canDistribute;
                playerIndices.push(j);
            }

            // Update dropdown values
            $('#drink-picker').find('span.drink-count').text(canDistribute);

            // Assign the remainder randomly
            _.chain(playerIndices)
                .sample(remainder)
                .each(function(element){
                    givenDrinks[element]++;

                    // Update the dropdown for the selected player
                    $('#drink-picker').find('span.drink-count').eq(element).text(canDistribute + 1);
                });
        }

        // Update the total footer
        $('#drink-picker').find('td.drink-pick-total').text(drinks);

        // Enable the give button
        $('#drink-picker').find('button.drink-assign').prop('disabled', false);
    });

    // When the give button is selected in the drink picker
    $(document).on('click', '#drink-picker button.drink-assign', function(){
        for (var i = 0; i < givenDrinks.length; i++) {
            // Update table count
            var count = parseInt($('.p' + i + '-taken').text(), 10) + givenDrinks[i];
            $('.p' + i + '-taken').text(count);

            // Update net
            var net = parseInt($('.p' + i + '-net').text(), 10) - givenDrinks[i];
            $('.p' + i + '-net').text(net);
        }

        // Close the drink picker
        $('#drink-picker').modal('hide');
    });
});

/**
 * Takes a card and places its image in the correct place within the table
 * @param turn an integer of the current player index
 * @param round an integer of the current round
 * @param card an integer of the card id
 */
function cardToTable(turn, round, card){
    var tableID = '.c' + round + 'p' + turn;
    $(tableID).html('<i class="card card-' + card + '"></i>');
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
    $('#instructions').html('<p>' + players[turn] + ' give ' + _drinks + ' drinks.</p>');

    // Render the modal content
    $('#drink-picker').find('div.modal-content').html(playerButtonsTemplate({
        'count' : _drinks,
        'players' : players
    }));

    // Init given drinks
    for (var i = 0; i < players.length; i++) {
        givenDrinks[i] = 0;
    }

    // Launches the drink picker modal so that the current player can pick who to assign drinks to
    $('#drink-picker').modal({
        'backdrop' : 'static'
    });
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
    $('#instructions').html('<p>' + players[turn] + ' take ' + drinks + ' drinks.</p>');
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

        // if suit is red the player will be prompted to give drinks
        if ((card.suit === 'hearts') || (card.suit === 'diamonds')) {
            giveDrinksTo(card.number);
        } else {
            takeDrinks(card.number);
        }
    } else {
        console.log('player guessed black');
        console.log('card was', card.number, 'of', card.suit);

        // if suit is black the player will be prompted to give drinks
        if ((card.suit === 'clubs') || (card.suit === 'spades')) {
            giveDrinksTo(card.number);
        } else {
            takeDrinks(card.number);
        }
    }

    $('#instructions').removeClass('hidden');

    // add card to table in correct place
    cardToTable(turn, round, currentCard);

    // add card to player hand
    hands[turn][round] = currentCard;

    // Increment turn and if all players have had a turn advance the round
    turn++;
    if (turn === players.length) {
        round++;
        turn = 0;
        $('#actionButtons').html('<button class="btn btn-default" type="button" id="higher" onclick="suicide.guessHigherOrLower(\'higher\');\">Higher</button><button class="btn btn-default" type="button" id="lower" onclick="suicide.guessHigherOrLower(\'lower\');">Lower</button>');
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

    // if card is higher than player will be prompted to give drinks
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

    // add card to table
    cardToTable(turn, round, currentCard);

    // add card to player hand
    hands[turn][round] = currentCard;

    // Increment turn and if all players have had a turn advance the round
    turn++;
    if (turn === players.length) {
        round++;
        turn = 0;
        $('#actionButtons').html('<button class="btn btn-default" type="button" id="inside" onclick="suicide.guessInsideOrOutside(\'inside\');\">Inside</button><button class="btn btn-default" type="button" id="outside" onclick="suicide.guessInsideOrOutside(\'outside\');\">Outside</button>');
    }

    currentCard = deck.pop();
}

/**
 * Processes guesses for the inside or outside round
 * @param guess a string of either inside or outside
 */
function guessInsideOrOutside(guess){
    // current card and previous cards to compare against
    var card = getNumberAndSuit(currentCard);
    var firstCard = getNumberAndSuit(hands[turn][0]);
    console.log(firstCard.number);
    var secondCard = getNumberAndSuit(hands[turn][1]);
    console.log(secondCard.number);
    if (guess === 'inside') {
        console.log('player guessed inside');
        if (firstCard.number < secondCard.number) {
            if (card.number > firstCard.number && card.number < secondCard.number) {
                console.log('card was inside');
                giveDrinksTo(card.number);
            } else {
                console.log('card was outside');
                takeDrinks(card.number);
            }
        } else if (firstCard.number > secondCard.number) {
            if (card.number > secondCard.number && card.number < firstCard.number) {
                console.log('card was inside');
                giveDrinksTo(card.number);
            } else {
                console.log('card was outside');
                takeDrinks(card.number);
            }
        } else {
            console.log('first and second card are the same number, inside not possible');
            takeDrinks(card.number);
        }
    } else {
        console.log('player guessed outside');
        if (firstCard.number < secondCard.number) {
            if (card.number > firstCard.number && card.number < secondCard.number) {
                console.log('card was inside');
                takeDrinks(card.number);
            } else {
                console.log('card was outside');
                giveDrinksTo(card.number);
            }
        } else if (firstCard.number > secondCard.number) {
            if (card.number > secondCard.number && card.number < firstCard.number) {
                console.log('card was inside');
                takeDrinks(card.number);
            } else {
                console.log('card was outside');
                giveDrinksTo(card.number);
            }
        } else {
            console.log('first and second card are the same number, inside not possible');
            if (card.number !== firstCard.number) {
                giveDrinksTo(card.number);
            } else {
                console.log('card was the same, not outside');
                takeDrinks(card.number);
            }
        }
    }
    // add card to table
    cardToTable(turn, round, currentCard);

    // add card to player hand
    hands[turn][round] = currentCard;

    // Increment turn and if all players have had a turn advance the round
    turn++;
    if (turn === players.length) {
        round++;
        turn = 0;
        $('#actionButtons').html('<button class="btn btn-default" type="button" id="diamond" onclick="suicide.guessSuit(\'diamonds\');\">Diamonds</button><button class="btn btn-default" type="button" id="heart" onclick="suicide.guessSuit(\'hearts\');\">Hearts</button><button class="btn btn-default" type="button" id="club" onclick="suicide.guessSuit(\'clubs\');\">Clubs</button><button class="btn btn-default" type="button" id="spade" onclick="suicide.guessSuit(\'spades\');\">Spades</button>');
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

    if (guess === card.suit) {
        console.log('suit was guessed correctly');
        giveDrinksTo(card.number);
    } else {
        console.log('incorrect guess');
        takeDrinks(card.number);
    }

    // add card to table
    cardToTable(turn, round, currentCard);

    // add card to player hand
    hands[turn][round] = currentCard;

    // Increment turn and if all players have had a turn advance the round
    turn++;
    if (turn === players.length) {
        round++;
        turn = 0;
        // TODO Begin next phase of the game.
        $('#actionButtons').html('<button class="btn btn-default" type="button" id="flipCard" onclick="suicide.flipCard();">Flip Card</button>');
        $('#hGrid').removeClass('hidden');
    }

    currentCard = deck.pop();
}

/**
 * Flips the next card in the H over
 */
function flipCard(){
    // id for placing card in proper spot should be giveTake# (0-9)
    var card = getNumberAndSuit(currentCard);
    console.log(card);
    // "flips card image"
    var id = '#giveTake' + giveTakeCard;
    console.log(id);
    $(id).html('<img src="img/cards/' + currentCard + '.png" height="73px" width="50px">');
    // prepares instructions
    var inst = '';
    var cardInPlayerHand = false;
    while (cardInPlayerHand === false) {
        for (var i = 0; i < players.length; i++) {
            var scanHand = hands[i];
            turn = i;
            console.log(scanHand);
            for (var j = 0; j < scanHand.length; j++) {
                console.log(scanHand[j]);
                var comparedCard = getNumberAndSuit(scanHand[j]);
                console.log(comparedCard.number);
                if (card.number === comparedCard.number) {
                    cardInPlayerHand = true;
                    if (giveTakeCard % 2 === 1) {
                        // give card
                        if (giveTakeCard === 9) {
                            inst += '<p>' + /*players[i].person.displayName*/players[i] + ' give ' + card.number * 2 + ' drinks.</p>';
                            giveDrinksTo(card.number * 2);
                        } else {
                            inst += '<p>' + /*players[i].person.displayName*/players[i] + ' give ' + card.number + ' drinks.</p>';
                            giveDrinksTo(card.number);
                        }
                    } else {
                        // take card
                        if (giveTakeCard === 8) {
                            inst += '<p>' + /*players[i].person.displayName*/players[i] + ' take ' + card.number * 2 + ' drinks.</p>';
                            takeDrinks(card.number * 2);
                        } else {
                            inst += '<p>' + /*players[i].person.displayName*/players[i] + ' take ' + card.number + ' drinks.</p>';
                            takeDrinks(card.number);
                        }
                    }
                }
            }
        }
        // if nobody had the card, adjust some of the variable before next loop iteration
        if (cardInPlayerHand === false) {
            currentCard = deck.pop();
            card = getNumberAndSuit(currentCard);
            $(id).html('<img src="img/cards/' + currentCard + '.png" height="73px" width="50px">');
        }
    }

    $(document).ready(function(){
        console.log(inst);
        $('#instructions').html(inst);
        giveTakeCard++;
        if (giveTakeCard === 10) {
            $('#flipCard').addClass('hidden');
        }

        currentCard = deck.pop();
    });
}

// Export members so that they can be used in the suicide.* namespace
module.exports = {
    'flipCard' : flipCard,
    'guessSuit' : guessSuit,
    'guessHigherOrLower' : guessHigherOrLower,
    'guessInsideOrOutside' : guessInsideOrOutside,
    'guessRedOrBlack' : guessRedOrBlack
};
