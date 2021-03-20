<?php
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * Conspiracy implementation : © <Your name here> <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 * 
 * states.inc.php
 *
 * Conspiracy game states description
 *
 */

/*
   Game state machine is a tool used to facilitate game developpement by doing common stuff that can be set up
   in a very easy way from this configuration file.

   Please check the BGA Studio presentation about game state to understand this, and associated documentation.

   Summary:

   States types:
   _ activeplayer: in this type of state, we expect some action from the active player.
   _ multipleactiveplayer: in this type of state, we expect some action from multiple players (the active players)
   _ game: this is an intermediary state where we don't expect any actions from players. Your game logic must decide what is the next game state.
   _ manager: special type for initial and final state

   Arguments of game states:
   _ name: the name of the GameState, in order you can recognize it on your own code.
   _ description: the description of the current game state is always displayed in the action status bar on
                  the top of the game. Most of the time this is useless for game state with "game" type.
   _ descriptionmyturn: the description of the current game state when it's your turn.
   _ type: defines the type of game states (activeplayer / multipleactiveplayer / game / manager)
   _ action: name of the method to call when this game state become the current game state. Usually, the
             action method is prefixed by "st" (ex: "stMyGameStateName").
   _ possibleactions: array that specify possible player actions on this step. It allows you to use "checkAction"
                      method on both client side (Javacript: this.checkAction) and server side (PHP: self::checkAction).
   _ transitions: the transitions are the possible paths to go from a game state to another. You must name
                  transitions in order to use transition names in "nextState" PHP method, and use IDs to
                  specify the next game state for each transition.
   _ args: name of the method to call to retrieve arguments for this gamestate. Arguments are sent to the
           client side to be used on "onEnteringState" or to set arguments in the gamestate description.
   _ updateGameProgression: when specified, the game progression is updated (=> call to your getGameProgression
                            method).
*/

//    !! It is not a good idea to modify this file when a game is running !!


$basicGameStates = [

    // The initial state. Please do not modify.
    ST_BGA_GAME_SETUP => array(
        "name" => "gameSetup",
        "description" => clienttranslate("Game setup"),
        "type" => "manager",
        "action" => "stGameSetup",
        "transitions" => array( "" => ST_PLAYER_LORD_STACK_SELECTION )
    ),

    ST_NEXT_PLAYER => array(
        "name" => "nextPlayer",
        "description" => "",
        "type" => "game",
        "action" => "stNextPlayer",
        "updateGameProgression" => true,
        "transitions" => array( 
            "nextPlayer" => ST_PLAYER_LORD_STACK_SELECTION, 
            "showScore" => ST_SHOW_SCORE
        )
    ),

    ST_SHOW_SCORE => array(
      "name" => "showScore",
      "description" => "",
      "type" => "game",
      "action" => "stShowScore",
      "transitions" => array( "endGame" => ST_END_GAME )
    ),
   
    // Final state.
    // Please do not modify.
    ST_END_GAME => array(
        "name" => "gameEnd",
        "description" => clienttranslate("End of game"),
        "type" => "manager",
        "action" => "stGameEnd",
        "args" => "argGameEnd"
    ),

];

$lordGameStates = [
    ST_PLAYER_LORD_STACK_SELECTION => array(
        "name" => "lordStackSelection",
        "description" => clienttranslate('${actplayer} must choose lords'),
        "descriptionmyturn" => clienttranslate('${you} must choose lords'),
        "type" => "activeplayer",
        //"action" => "stPlayerLordStackSelection",
        "possibleactions" => array( "chooseDeckStack", "chooseVisibleStack" ),
        "transitions" => array( 
            "chooseDeckStack" => ST_PLAYER_LORD_SELECTION,
            "chooseOneOnStack" => ST_PLAY_LORD,
            "chooseVisibleStack" => ST_PLAYER_LORD_PICK
        )
    ),  

    ST_PLAYER_LORD_SELECTION => array(
        "name" => "lordSelection",
        "description" => clienttranslate('${actplayer} must choose a lord'),
        "descriptionmyturn" => clienttranslate('${you} must choose a lord'),
        "type" => "activeplayer",
        "args" => "argLordSelection",
        // "action" => "stPlayerLordSelection",
        "possibleactions" => array( "addLord" ),
        "transitions" => array( 
            "addLord" => ST_PLAY_LORD
        )
    ),

    ST_PLAYER_LORD_PICK => array(
        "name" => "lordPick",
        "description" => clienttranslate('${actplayer} must choose first lord to place'),
        "descriptionmyturn" => clienttranslate('${you} must choose first lord to place'),
        "type" => "activeplayer",
        // "action" => "stPlayerLordPick",
        "possibleactions" => array( "addLord" ),
        "transitions" => array( 
            "addLord" => ST_PLAY_LORD
        )
    ),

    ST_PLAY_LORD => array(
        "name" => "lordPlacement",
        "description" => "",
        "type" => "game",
        "action" => "stPlayLord",
        "transitions" => array( 
            "switch" => ST_PLAYER_LORDS_SWITCH,
            "addLocation" => ST_PLAYER_LOCATION_STACK_SELECTION,
            "next" => ST_END_LORD,
        )
    ),

    ST_PLAYER_LORDS_SWITCH => array(
        "name" => "lordSwitch",
        "description" => clienttranslate('${actplayer} must select lords to switch'),
        "descriptionmyturn" => clienttranslate('${you} must select lords to switch'),
        "type" => "activeplayer",
        // "action" => "stPlayerLordSwitch",
        "possibleactions" => array( "next" ),
        "transitions" => array( 
            "next" => ST_END_LORD
        )
    ),

    ST_END_LORD => array(
        "name" => "endLord",
        "description" => "",
        "type" => "game",
        "action" => "stEndLord",
        "updateGameProgression" => true,
        "transitions" => array(
            "nextLord" => ST_PLAYER_LORD_SELECTION,
            "nextPlayer" => ST_NEXT_PLAYER,
        )
    ),
];

$locationGameStates = [

    ST_PLAYER_LOCATION_STACK_SELECTION => array(
        "name" => "locationStackSelection",
        "description" => clienttranslate('${actplayer} must choose location'),
        "descriptionmyturn" => clienttranslate('${you} must choose location'),
        "type" => "activeplayer",
        // "action" => "stPlayerLocationStackSelection",
        "possibleactions" => array( "chooseDeckStack", "chooseVisibleLocation" ),
        "transitions" => array( 
            "chooseDeckStack" => ST_PLAYER_LOCATION_SELECTION,
            "chooseOneOnStack" => ST_ADD_LOCATION,
            "chooseVisibleLocation" => ST_ADD_LOCATION
        )
    ),  

    ST_PLAYER_LOCATION_SELECTION => array(
        "name" => "locationSelection",
        "description" => clienttranslate('${actplayer} must choose a location'),
        "descriptionmyturn" => clienttranslate('${you} must choose a location'),
        "type" => "activeplayer",
        "args" => "argLocationSelection",
        "possibleactions" => array( "addLocation" ),
        "transitions" => array( 
            "addLocation" => ST_ADD_LOCATION
        )
    ),

    ST_ADD_LOCATION => array(
        "name" => "addLocation",
        "description" => "",
        "type" => "game",
        "action" => "stAddLocation",
        "transitions" => array( 
            "next" => ST_END_LORD,
        )
    )
];
 
$machinestates = $basicGameStates + $lordGameStates + $locationGameStates;
