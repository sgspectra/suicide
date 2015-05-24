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
var participantsTemplate = _.template(require('html!../html/participants.html'));
var roundTemplates = [
    require('html!../html/action-buttons/0.html'),
    require('html!../html/action-buttons/1.html'),
    require('html!../html/action-buttons/2.html'),
    require('html!../html/action-buttons/3.html')
];

// Shared state
var state = {
    'deck' : [],
    'turn' : 0,
    'round' : 0,
    'players' : []
};

// Local state
var currentCard;
var drinks = 0;
var givenDrinks = [];
var giveTakeCard = 0;

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

// Determine if a client is the "leader" client
function isLeaderClient(){
    var myID = gapi.hangout.getLocalParticipantId();
    var leaderID = gapi.hangout.getEnabledParticipants()[0].id;
    var isLeader = false;
    if (myID === leaderID) {
        isLeader = true;
    }

    return isLeader;
}

// Determine if it is a clients turn
function isTurn(){
    var locPart = gapi.hangout.getLocalParticipant();
    var locID = locPart.id;
    var isClientTurn = false;
    if (locID === state.players[state.turn].id){
        isClientTurn = true;
    }

    return isClientTurn;
}

/**
 * Initializes state
 */
function initialize(){
    // Intialize deck
    for (var i = 0; i < 52; i++) {
        state.deck.push(i);
    }

    // Shuffle Deck and pull one from top
    shuffleArray(state.deck);
    currentCard = state.deck.pop();

    // Create players
    _.each(gapi.hangout.getEnabledParticipants(), function(participantObject){
        // Create a js object for that player
        state.players.push({
            'name' : participantObject.person.displayName,
            'id' : participantObject.id,
            'round1' : null,
            'round2' : null,
            'round3' : null,
            'round4' : null,
            'given' : 0,
            'taken' : 0,
            'net' : 0
        });
    });
}

// function to render player table
function renderPlayerTable(){
    $('#players').html(playersTemplate({
        'players' : state.players
    }));
}

gapi.hangout.onApiReady.add(function(){
    $(document).ready(function(){
        if (isLeaderClient()) {
            $('#startGame').removeClass('hidden');
        }

        // Show enabled participants
        $('.participants').html(participantsTemplate({
            'participants' : gapi.hangout.getEnabledParticipants()
        }));

        // When a participant joins or drops
        gapi.hangout.onEnabledParticipantsChanged.add(function(event){
            $('.participants').html(participantsTemplate({
                'participants' : event.enabledParticipants
            }));
        });

        // When the state has been changed
        gapi.hangout.data.onStateChanged.add(function(event){
            state = JSON.parse(event['state']['state']);
            renderPlayerTable();

            // If our turn, render the action buttons
            if (isTurn()) {
                $('#actionButtons').html(roundTemplates[state.round]);
            } else {
                $('#actionButtons').html('');
            }
        });
    });
});

$(document).ready(function(){
    // On Start Button Click
    $('#startGame').on('click', function(){
        // Hide start button and partcipant list
        $(this).addClass('hidden');
        $('.participants').addClass('hidden');

        // Initialize state
        initialize();

        // Render players table
        renderPlayerTable();

        // Add red or black buttons for first round
        $('#actionButtons').html(roundTemplates[0]);
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
        for (var i = 0; i < state.players.length; i++) {
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
        if ((drinks % state.players.length) === 0) {
            // Update given drinks
            for (var i = 0; i < state.players.length; i++) {
                givenDrinks[i] = drinks / state.players.length;
            }

            // Update dropdown values
            $('#drink-picker').find('span.drink-count').text(drinks / state.players.length);
        } else {
            // Calculate how many we can distribute and the remainder
            var canDistribute = Math.floor(drinks / state.players.length);
            var remainder = drinks - (canDistribute * state.players.length);

            // Give each player the equal share
            var playerIndices = [];
            for (var j = 0; j < state.players.length; j++) {
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
            // Update taken count
            state.players[i].taken += givenDrinks[i];

            // Update net
            state.players[i].net -= givenDrinks[i];
        }

        // Render table
        renderPlayerTable();

        // Close the drink picker
        $('#drink-picker').modal('hide');
    });
});

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
    state.players[state.turn].given += _drinks;

    // Update net
    state.players[state.turn].net += _drinks;

    // Render instruction
    $('#instructions').html('<p>' + state.players[state.turn].name + ' give ' + _drinks + ' drinks.</p>');

    // Render the modal content
    $('#drink-picker').find('div.modal-content').html(playerButtonsTemplate({
        'count' : _drinks,
        'players' : state.players
    }));

    // Init given drinks
    for (var i = 0; i < state.players.length; i++) {
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
    // Update taken count
    state.players[state.turn].taken += drinks;

    // Update net
    state.players[state.turn].net -= drinks;

    // Render table
    renderPlayerTable();

    // Render instruction
    $('#instructions').html('<p>' + state.players[state.turn].name + ' take ' + drinks + ' drinks.</p>');
}

/**
 * Processes guesses for the red or black round
 * @param guess a string of either red or black
 */
function guessRedOrBlack(guess){
    var card = getNumberAndSuit(currentCard);

    // add card to player hand
    state.players[state.turn].round1 = currentCard;

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

    // Increment turn and if all players have had a turn advance the round
    state.turn++;
    if (state.turn === state.players.length) {
        state.round++;
        state.turn = 0;
    }

    // Update shared state
    gapi.hangout.data.submitDelta({'state' : JSON.stringify(state)});
}

/**
 * Processes guesses for the higher or lower round
 * @param guess a string of either higher or lower
 */
function guessHigherOrLower(guess){
    currentCard = state.deck.pop();

    var card = getNumberAndSuit(currentCard);
    var firstCard = getNumberAndSuit(state.players[state.turn].round1);

    // add card to player hand
    state.players[state.turn].round2 = currentCard;

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

    // Increment turn and if all players have had a turn advance the round
    state.turn++;
    if (state.turn === state.players.length) {
        state.round++;
        state.turn = 0;
    }

    // Update shared state
    gapi.hangout.data.submitDelta({'state' : JSON.stringify(state)});
}

/**
 * Processes guesses for the inside or outside round
 * @param guess a string of either inside or outside
 */
function guessInsideOrOutside(guess){
    currentCard = state.deck.pop();

    // current card and previous cards to compare against
    var card = getNumberAndSuit(currentCard);
    var firstCard = getNumberAndSuit(state.players[state.turn].round1);
    console.log(firstCard.number);
    var secondCard = getNumberAndSuit(state.players[state.turn].round2);
    console.log(secondCard.number);

    // add card to player hand
    state.players[state.turn].round3 = currentCard;

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

    // Increment turn and if all players have had a turn advance the round
    state.turn++;
    if (state.turn === state.players.length) {
        state.round++;
        state.turn = 0;
    }

    // Update shared state
    gapi.hangout.data.submitDelta({'state' : JSON.stringify(state)});
}

/**
 * Processes guesses for the suit round
 * @param guess a string of one of heart, club, diamond, spade
 */
function guessSuit(guess){
    currentCard = state.deck.pop();

    var card = getNumberAndSuit(currentCard);
    console.log(card.suit);

    // add card to player hand
    state.players[state.turn].round4 = currentCard;

    if (guess === card.suit) {
        console.log('suit was guessed correctly');
        giveDrinksTo(card.number);
    } else {
        console.log('incorrect guess');
        takeDrinks(card.number);
    }

    // Increment turn and if all players have had a turn advance the round
    state.turn++;
    if (state.turn === state.players.length) {
        state.round++;
        state.turn = 0;
    }

    // Update shared state
    gapi.hangout.data.submitDelta({'state' : JSON.stringify(state)});
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
    $(id).html('<i class="card card-' + currentCard + '"></i>');

    // prepares instructions
    var inst = '';
    var cardInPlayerHand = false;
    while (cardInPlayerHand === false) {
        for (var i = 0; i < state.players.length; i++) {
            var scanHand = [state.players[i].round1, state.players[i].round2, state.players[i].round3, state.players[i].round4];
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
                            inst += '<p>' + state.players[i].name + ' give ' + card.number * 2 + ' drinks.</p>';
                            giveDrinksTo(card.number * 2);
                        } else {
                            inst += '<p>' + state.players[i].name + ' give ' + card.number + ' drinks.</p>';
                            giveDrinksTo(card.number);
                        }
                    } else {
                        // take card
                        if (giveTakeCard === 8) {
                            inst += '<p>' + state.players[i].name + ' take ' + card.number * 2 + ' drinks.</p>';
                            takeDrinks(card.number * 2);
                        } else {
                            inst += '<p>' + state.players[i].name + ' take ' + card.number + ' drinks.</p>';
                            takeDrinks(card.number);
                        }
                    }
                }
            }
        }

        // if nobody had the card, adjust some of the variable before next loop iteration
        if (cardInPlayerHand === false) {
            currentCard = state.deck.pop();
            card = getNumberAndSuit(currentCard);
            $(id).html('<i class="card card-' + currentCard + '"></i>');
        }
    }

    console.log(inst);
    $('#instructions').html(inst);

    giveTakeCard++;

    if (giveTakeCard === 10) {
        $('#flipCard').addClass('hidden');
    }

    currentCard = state.deck.pop();
}

/* jshint ignore:start */

// Function to update local state
function updateLocalState(){
    state = gapi.hangout.data.getValue('sState');
    renderPlayerTable();
}

/* jshint ignore:end */

// Export members so that they can be used in the suicide.* namespace
module.exports = {
    'flipCard' : flipCard,
    'guessSuit' : guessSuit,
    'guessHigherOrLower' : guessHigherOrLower,
    'guessInsideOrOutside' : guessInsideOrOutside,
    'guessRedOrBlack' : guessRedOrBlack
};
