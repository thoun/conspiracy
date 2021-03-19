<?php
// https://studio.boardgamearena.com/1/conspiracy/conspiracy/logaccess.html?table=251944#bottom
// https://studio.boardgamearena.com/1/conspiracy/conspiracy/logaccess.html?table=251944&err=1#bottom
// http://db.1.studio.boardgamearena.com/index.php?db=ebd_conspiracy_251944
 /**
  *------
  * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
  * Conspiracy implementation : © <Your name here> <Your email address here>
  * 
  * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
  * See http://en.boardgamearena.com/#!doc/Studio for more information.
  * -----
  * 
  * conspiracy.game.php
  *
  * This is the main file for your game logic.
  *
  * In this PHP file, you are going to defines the rules of the game.
  *
  */


require_once( APP_GAMEMODULE_PATH.'module/table/table.game.php' );
require_once( 'modules/constants.inc.php' );
require_once( 'modules/lord.php' );
require_once( 'modules/location.php' );
require_once( 'modules/player-table-spot.php' );


class Conspiracy extends Table
{
	function __construct() {
        // Your global variables labels:
        //  Here, you can assign labels to global variables you are using for this game.
        //  You can use any number of global variables with IDs between 10 and 99.
        //  If your game has options (variants), you also have to associate here a label to
        //  the corresponding ID in gameoptions.inc.php.
        // Note: afterwards, you can get/set the global variables with getGameStateValue/setGameStateInitialValue/setGameStateValue
        parent::__construct();
        
        self::initGameStateLabels([
                "masterPearlsPlayer" => 10,

                //  // if > 0, indicates the player that added the constraint
                'AP_FIRST_LORD' => 11, // reset to 0 when this player plays again
                'AP_FIRST_LORDS' => 12, // reset to 0 when this player plays again
                'AP_KEYS' => 13, // reset to 0 when this player plays again
                'AP_DECK_LOCATION' => 14, // apply for all game, not reseted                

                'stackSelection' => 20
            //      ...
            //    "my_first_game_variant" => 100,
            //    "my_second_game_variant" => 101,
            //      ...
        ]);

        $this->lords = self::getNew( "module.common.deck" );
        $this->lords->init( "lord" );
        $this->lords->autoreshuffle = true;
        $this->locations = self::getNew( "module.common.deck" );
        $this->locations->init( "location" );
        $this->locations->autoreshuffle = true;
	}
	
    protected function getGameName() {
		// Used for translations and stuff. Please do not modify.
        return "conspiracy";
    }	

    /*
        setupNewGame:
        
        This method is called only once, when a new game is launched.
        In this method, you must setup the game according to the game rules, so that
        the game is ready to be played.
    */
    protected function setupNewGame( $players, $options = array() ) {    
        // Set the colors of the players with HTML color code
        // The default below is red/green/blue/orange/brown
        // The number of colors defined here must correspond to the maximum number of players allowed for the gams
        $gameinfos = self::getGameinfos();
        $default_colors = $gameinfos['player_colors'];
 
        // Create players
        // Note: if you added some extra field on "player" table in the database (dbmodel.sql), you can initialize it there.
        $sql = "INSERT INTO player (player_id, player_color, player_canal, player_name, player_avatar) VALUES ";
        $values = array();
        foreach( $players as $player_id => $player ) {
            $color = array_shift( $default_colors );
            $values[] = "('".$player_id."','$color','".$player['player_canal']."','".addslashes( $player['player_name'] )."','".addslashes( $player['player_avatar'] )."')";
        }
        $sql .= implode( $values, ',' );
        self::DbQuery( $sql );
        self::reattributeColorsBasedOnPreferences( $players, $gameinfos['player_colors'] );
        self::reloadPlayersBasicInfos();
        
        /************ Start the game initialization *****/

        // Init global values with their initial values
        self::setGameStateInitialValue( 'masterPearlsPlayer', 0 );
        self::setGameStateInitialValue( 'AP_FIRST_LORD', 0 );
        self::setGameStateInitialValue( 'AP_FIRST_LORDS', 0 );
        self::setGameStateInitialValue( 'AP_DECK_LOCATION', 0 );
        self::setGameStateInitialValue( 'stackSelection', 0 );
        
        // Init game statistics
        // (note: statistics used in this file must be defined in your stats.inc.php file)
        //self::initStat( 'table', 'table_teststat1', 0 );    // Init a table statistics
        //self::initStat( 'player', 'player_teststat1', 0 );  // Init a player statistics (for all players)

        // setup the initial game situation here
        $this->setupLordsCards();
        $this->setupLocationsCards(); 
        
        // show the first location
        $this->locations->pickCardForLocation('deck', 'table');


        // TODO TEMP à enlever
        for ($i=0;$i<5;$i++) {
            $this->addExtraLord();
        }

        // Activate first player (which is in general a good idea :) )
        $this->activeNextPlayer();

        /************ End of the game initialization *****/
    }

    function setupLordsCards() {
        $cards = [];
        foreach( $this->LORDS as $lord_id => $lord ) {
            for ($guild=1; $guild<=5; $guild++) {
                $cards[] = [ 'type' => $lord_id, 'type_arg' => $guild, 'nbr' => $lord->nbr ];
            }
        }
        $this->lords->createCards($cards, 'deck');
        $this->lords->shuffle('deck'); 
    }

    function setupLocationsCards() {
        $cards = [];
        foreach(array_keys($this->LOCATIONS_UNIQUE) as $locationId) {
            $cards[] = [ 'type' => $locationId, 'type_arg' => null, 'nbr' => 1 ];
        }
        foreach(array_keys($this->LOCATIONS_GUILD) as $locationId) {
            for ($guild=1; $guild<=5; $guild++) {
                $cards[] = [ 'type' => $locationId, 'type_arg' => $guild, 'nbr' => 1 ];
            }
        }
        $this->locations->createCards($cards, 'deck');
        $this->locations->shuffle('deck'); 
    }

    /*
        getAllDatas: 
        
        Gather all informations about current game situation (visible by the current player).
        
        The method is called each time the game interface is displayed to a player, ie:
        _ when the game starts
        _ when a player refreshes the game page (F5)
    */
    protected function getAllDatas() {
        $result = array();
    
        $current_player_id = self::getCurrentPlayerId();    // !! We must only return informations visible by this player !!
    
        // Get information about players
        // Note: you can retrieve some extra field you added for "player" table in "dbmodel.sql" if you need it.
        $sql = "SELECT player_id id, player_score score, player_score_aux pearls FROM player ";
        $result['players'] = self::getCollectionFromDb( $sql );
  
        // Gather all information about current game situation (visible by player $current_player_id).

        $result['visibleLords'] = [];
        for ($guild=1; $guild<=5; $guild++) {
            $result['visibleLords'][$guild] = $this->getLordsFromDb($this->lords->getCardsInLocation('table', $guild));
        }
        $result['pickLords'] = $this->getLordsFromDb($this->lords->getCardsInLocation('lord_selection'));
        
        $result['visibleLocations'] = $this->getLocationsFromDb($this->locations->getCardsInLocation('table'));
        $result['pickLocations'] = $this->getLocationsFromDb($this->locations->getCardsInLocation('location_sel'));

        // players tables
        $result['playersTables'] = [];
        foreach( $result['players'] as $player_id => $playerDb ) {
            $lords = $this->getLordsFromDb($this->lords->getCardsInLocation("player$player_id"));
            $locations = $this->getLocationsFromDb($this->locations->getCardsInLocation("player$player_id"));
            $result['playersTables'][$player_id] = [];
            for($spot=1;$spot<=15;$spot++) {
                $result['playersTables'][$player_id][$spot] = new PlayerTableSpot(
                    current(array_filter($lords, function($lord) use ($spot) { return $lord->location_arg === $spot; })),
                    current(array_filter($locations, function($location) use ($spot) { return $location->location_arg === $spot; }))
                );                
            }
        }

        $result['masterPearlsPlayer'] = intval(self::getGameStateValue('masterPearlsPlayer'));
  
        return $result;
    }

    /*
        getGameProgression:
        
        Compute and return the current game progression.
        The number returned must be an integer beween 0 (=the game just started) and
        100 (= the game is finished or almost finished).
    
        This method is called each time we are in a game state with the "updateGameProgression" property set to true 
        (see states.inc.php)
    */
    function getGameProgression() {
        $maxPlayedLords = intval(self::getUniqueValueFromDB( "SELECT count(*) FROM lord WHERE `card_location` like 'player%' GROUP BY `card_location_arg` ORDER BY count(*) DESC LIMIT 1"));
        return $maxPlayedLords * 100 / 15;
    }


//////////////////////////////////////////////////////////////////////////////
//////////// Utility functions
//////////// 

    function mustTakeFirstLord() {
        return self::getGameStateValue('AP_FIRST_LORD') > 0;
    }

    function mustTakeFirstLords() {
        return self::getGameStateValue('AP_FIRST_LORDS') > 0;
    }

    function mustPickOnLocationPile(int $playerId) {
        return self::getGameStateValue('AP_DECK_LOCATION') == $playerId;
    }

    function getLordFromDb($dbLord) {
        if (!$dbLord || !array_key_exists('id', $dbLord)) {
            throw new Error('lord doesn\'t exists '.json_encode($dbLord));
        }
        return new Lord($dbLord, $this->LORDS);
    }

    function getLordsFromDb(array $dbLords) {
        return array_map(function($dbLord) { return $this->getLordFromDb($dbLord); }, array_values($dbLords));
    }

    function getLocationFromDb($dbLocation) {
        if (!$dbLocation || !array_key_exists('id', $dbLocation)) {
            throw new Error('lord doesn\'t exists '.json_encode($dbLocation));
        }
        return new Location($dbLocation, $this->LOCATIONS);
    }

    function getLocationsFromDb(array $dbLocations) {
        return array_map(function($dbLocation) { return $this->getLocationFromDb($dbLocation); }, array_values($dbLocations));
    }

    function canConstructWithNewKey(int $playerId, int $key): bool {
        $lords = $this->getLordsFromDb($this->lords->getCardsInLocation("player$playerId"));
        $locations = $this->getLocationsFromDb($this->locations->getCardsInLocation("player$playerId"));
        $locationsSpots = array_map(function($location) { return $location->location_arg; }, $locations);
        $lastLocationSpot = count($locationsSpots) > 0 ? max($locationsSpots) : 0;

        if (self::getGameStateValue('AP_KEYS') == $playerId) { // TODO set value when location is played
            $keys = count(array_filter($lords, function($lord) use ($lastLocationSpot) { return $lord->location_arg > $lastLocationSpot && $lord->key >= 1; }));
            
            return $keys >= 2;
        } else {
            $silverKeys = count(array_filter($lords, function($lord) use ($lastLocationSpot) { return $lord->location_arg > $lastLocationSpot && $lord->key === 1; }));
            $goldKeys = count(array_filter($lords, function($lord) use ($lastLocationSpot) { return $lord->location_arg > $lastLocationSpot && $lord->key === 2; }));

            return $silverKeys >= 2 || $goldKeys >= 2;
        }
    }

    function addExtraLord() {
        $lord = $this->getLordFromDb($this->lords->pickCardForLocation( 'deck', 'table'));
        $this->lords->moveCard($lord->id,'table', $lord->guild);
        return $lord;
    }

//////////////////////////////////////////////////////////////////////////////
//////////// Player actions
//////////// 

    /*
        Each time a player is doing some game action, one of the methods below is called.
        (note: each method below must match an input method in conspiracy.action.php)
    */

    function chooseLordDeckStack($number) {
        self::checkAction('chooseDeckStack'); 
        self::debug('[GBA] chooseLordDeckStack');

        $this->lords->pickCardsForLocation($number, 'deck', $number == 1 ? 'lord_pick' : 'lord_selection');

        $message = $number > 1 ?
          clienttranslate('${player_name} chooses to take ${number} lords from the deck') :
          clienttranslate('${player_name} chooses to take ${number} lord from the deck');
        self::notifyAllPlayers('lordDeckNumber', $message, [
            'player_name' => self::getActivePlayerName(),
            'number' => $number,
        ]);

        self::setGameStateValue('stackSelection', 1);
        $this->gamestate->nextState($number == 1 ? 'chooseOneOnStack' : 'chooseDeckStack');
    }

    function chooseVisibleStack($guild) {
        self::checkAction('chooseVisibleStack'); 
        self::debug('[GBA] chooseLordVisibleStack');

        $number = $this->lords->countCardInLocation('table', $guild);

        $this->lords->moveAllCardsInLocation('table', $number == 1 ? 'lord_pick' : 'lord_selection', $guild);
        
        $message = $number > 1 ?
            clienttranslate('${player_name} chooses to take visible lords from the deck') :
            clienttranslate('${player_name} chooses to take visible lord from the deck');
        self::notifyAllPlayers('lordVisiblePile', $message, [
            'player_name' => self::getActivePlayerName(),
            'guild' => $guild,
            'number' => $number
        ]);

        self::setGameStateValue('stackSelection', 0);
        $this->gamestate->nextState($number == 1 ? 'chooseOneOnStack' : 'chooseDeckStack');
    }

    function pickLord($id) {
        self::debug('[GBA] pickLord');

        $lord = $this->getLordFromDb($this->lords->getCard($id));
        if ($lord->location !== 'lord_selection') {
            throw new Error('Picked lord is not available');
        }
        $this->lords->moveCard($lord->id, 'lord_pick');

        $this->gamestate->nextState('addLord');
    }

    function switch($spots) {
        self::debug('[GBA] switch');
        self::debug('[GBA] spots='.json_encode($spots));
        // TODO switch
        // TODO notif
        $this->gamestate->nextState('nextPlayer');
    }

    function dontSwitch() {
        $this->gamestate->nextState('nextPlayer');
    }

    function chooseLocationDeckStack($number) {
        self::checkAction('chooseDeckStack'); 
        self::debug('[GBA] chooseLocationDeckStack');

        $this->locations->pickCardsForLocation($number, 'deck', $number == 1 ? 'location_pick' : 'location_sel');

        $message = $number > 1 ?
          clienttranslate('${player_name} chooses to take ${number} locations from the deck') :
          clienttranslate('${player_name} chooses to take ${number} location from the deck');
        self::notifyAllPlayers('locationDeckNumber', $message, [
            'player_name' => self::getActivePlayerName(),
            'number' => $number,
        ]);

        $this->gamestate->nextState($number == 1 ? 'chooseOneOnStack' : 'chooseDeckStack');
    }

    function pickLocation($id) {
        self::debug('[GBA] pickLocation');

        $location = $this->getLocationFromDb($this->locations->getCard($id));
        if ($location->location !== 'location_sel') {
            throw new Error('Picked location is not available');
        }
        $this->locations->moveCard($location->id, 'location_pick');

        $this->gamestate->nextState('addLocation');
    }

    function chooseVisibleLocation($id) {        
        self::debug('[GBA] chooseVisibleLocation');
        
        $this->locations->moveCard($id, 'location_pick');

        $this->gamestate->nextState('chooseVisibleLocation');
    }

    function checkPearlMaster($player_id) {        

        // check Master pearls
        $masterPearlsPlayer = self::getGameStateValue('masterPearlsPlayer');
        if ($masterPearlsPlayer !== $player_id) {
            $newPearlMasterPlayer = intval(self::getUniqueValueFromDB( "SELECT player_id FROM `player` order by player_score_aux desc, player_id = $masterPearlsPlayer limit 1"));
            
            if ($newPearlMasterPlayer != $masterPearlsPlayer) {
                self::setGameStateValue('masterPearlsPlayer', $newPearlMasterPlayer);
                self::notifyAllPlayers('newPearlMaster', clienttranslate('${player_name} becomes the new Pearl Master'), [
                    'playerId' => $player_id,
                    'player_name' => self::getActivePlayerName()
                ]);
            }
        }
    }
    
//////////////////////////////////////////////////////////////////////////////
//////////// Game state arguments
////////////

    /*
        Here, you can create methods defined as "game state arguments" (see "args" property in states.inc.php).
        These methods function is to return some additional information that is specific to the current
        game state.
    */
    
    function argLordSelection() {
        $lords = $this->getLordsFromDb($this->lords->getCardsInLocation('lord_selection'));    
        return [ 'lords' => $lords ];
    }

    function argLocationSelection() {
        $locations = $this->getLocationsFromDb($this->locations->getCardsInLocation('location_sel'));    
        return [ 'locations' => $locations ];
    }

//////////////////////////////////////////////////////////////////////////////
//////////// Game state actions
////////////

    /*
        Here, you can create methods defined as "game state actions" (see "action" property in states.inc.php).
        The action method of state X is called everytime the current game state is set to X.
    */
    

    function stPlayLord() {
        self::debug('[GBA] stPlayLord');
        self::debug('[GBA] stPlayLord getCardsInLordPick '.json_encode(array_values($this->lords->getCardsInLocation('lord_pick'))));
        $lord = $this->getLordFromDb(array_values($this->lords->getCardsInLocation('lord_pick'))[0]);
        self::debug('[GBA] stPlayLord lord '.json_encode($lord));
        $player_id = intval(self::getActivePlayerId());

        $spot = $this->lords->countCardInLocation("player${player_id}") + 1;
        $this->lords->moveCard($lord->id, "player${player_id}", $spot);

        $remainingLords = $this->getLordsFromDb($this->lords->getCardsInLocation('lord_selection'));
        $stackSelection = self::getGameStateValue('stackSelection') == 1;
        if ($stackSelection) {
            foreach($remainingLords as $lord) {
                $this->lords->moveCard($lord->id, 'table', $lord->guild);
            }
        }
        
        // TODO do not count all lords points 
        $points = $lord->points;
        $pearls = $lord->pearls;
        self::DbQuery("UPDATE player SET player_score = player_score + $points, player_score_aux = player_score_aux + $pearls WHERE player_id = $player_id");
        
        self::notifyAllPlayers('lordPlayed', clienttranslate('${player_name} plays lord ${card_name}'), [
            'playerId' => $player_id,
            'player_name' => self::getActivePlayerName(),
            'card_name' => 'TODO',
            'lord' => $lord,
            'spot' => $spot,
            'discardedLords' => $stackSelection ? $remainingLords : [],
            'points' => $points,
            'pearls' => $pearls,
        ]);

        if ($lord->showExtraLord) {
            $extraLord = $this->addExtraLord();

            self::notifyAllPlayers('extraLordRevealed', clienttranslate('A lord is added in the discard pile'), [
                'lord' => $extraLord
            ]);
        }

        $this->checkPearlMaster($player_id);

        if ($lord->switch && $this->lords->countCardInLocation("player${player_id}") >= 2) {
            $this->gamestate->nextState('switch');
        } else if ($lord->key && $this->canConstructWithNewKey($player_id, $lord->key)) {
            $this->gamestate->nextState('addLocation');
        } else {
            $this->gamestate->nextState('next');
        }
    }

    function stAddLocation() {
        self::debug('[GBA] stAddLocation');
        self::debug('[GBA] stAddLocation getCardInLordPick '.json_encode(array_values($this->locations->getCardsInLocation('location_pick'))));
        $location = $this->getLocationFromDb(array_values($this->locations->getCardsInLocation('location_pick'))[0]);
        self::debug('[GBA] stAddLocation location '.json_encode($location));
        $player_id = intval(self::getActivePlayerId());

        $spot = $this->lords->countCardInLocation("player${player_id}") + 1;
        $this->locations->moveCard($location->id, "player${player_id}", $spot);

        $remainingLocations = $this->getLocationsFromDb($this->locations->getCardsInLocation('location_sel'));
        foreach($remainingLocations as $location) {
            $this->locations->moveCard($location->id, 'table');
        }
        
        $points = $location->points;
        $pearls = $location->pearls;
        self::DbQuery("UPDATE player SET player_score = player_score + $points, player_score_aux = player_score_aux + $pearls WHERE player_id = $player_id");
        
        self::notifyAllPlayers('locationPlayed', clienttranslate('${player_name} plays location ${card_name}'), [
            'playerId' => $player_id,
            'player_name' => self::getActivePlayerName(),
            'card_name' => 'TODO',
            'location' => $location,
            'spot' => $spot,
            'discardedLocations' => $remainingLocations,
            'points' => $points,
            'pearls' => $pearls,
        ]);

        $this->checkPearlMaster($player_id);

        if ($location->activePower == AP_DISCARD_LORDS && $this->lords->countCardInLocation("table") > 0) {
            self::notifyAllPlayers('discardLords', clienttranslate('Lords are discarded'), []);
            $this->lords->shuffle('deck');
        }
        if ($location->activePower == AP_DISCARD_LOCATIONS && $this->locations->countCardInLocation("table") > 0) {
            self::notifyAllPlayers('discardLocations', clienttranslate('Locations are discarded'), []);
            $this->locations->shuffle('deck');
        }

        $this->gamestate->nextState('next');
    }

    function stEndLord() {
        if ($this->lords->countCardInLocation('lord_selection') > 0) {
            $this->gamestate->nextState('nextLord');
        } else {
            $this->gamestate->nextState('nextPlayer');
        }
    }

    function stNextPlayer() {
        $player_id = self::activeNextPlayer();
        self::giveExtraTime($player_id);

        // TODO end game ? $this->gamestate->nextState('showScore');

        $this->gamestate->nextState('nextPlayer');
    }

//////////////////////////////////////////////////////////////////////////////
//////////// Zombie
////////////

    /*
        zombieTurn:
        
        This method is called each time it is the turn of a player who has quit the game (= "zombie" player).
        You can do whatever you want in order to make sure the turn of this player ends appropriately
        (ex: pass).
        
        Important: your zombie code will be called when the player leaves the game. This action is triggered
        from the main site and propagated to the gameserver from a server, not from a browser.
        As a consequence, there is no current player associated to this action. In your zombieTurn function,
        you must _never_ use getCurrentPlayerId() or getCurrentPlayerName(), otherwise it will fail with a "Not logged" error message. 
    */

    function zombieTurn( $state, $active_player ) {
    	$statename = $state['name'];
    	
        if ($state['type'] === "activeplayer") {
            switch ($statename) {
                default:
                    $this->gamestate->nextState( "zombiePass" );
                	break;
            }

            return;
        }

        if ($state['type'] === "multipleactiveplayer") {
            // Make sure player is in a non blocking status for role turn
            $this->gamestate->setPlayerNonMultiactive( $active_player, '' );
            
            return;
        }

        throw new feException( "Zombie mode not supported at this game state: ".$statename );
    }
    
///////////////////////////////////////////////////////////////////////////////////:
////////// DB upgrade
//////////

    /*
        upgradeTableDb:
        
        You don't have to care about this until your game has been published on BGA.
        Once your game is on BGA, this method is called everytime the system detects a game running with your old
        Database scheme.
        In this case, if you change your Database scheme, you just have to apply the needed changes in order to
        update the game database and allow the game to continue to run with your new version.
    
    */
    
    function upgradeTableDb( $from_version ) {
        // $from_version is the current version of this game database, in numerical form.
        // For example, if the game was running with a release of your game named "140430-1345",
        // $from_version is equal to 1404301345
        
        // Example:
//        if( $from_version <= 1404301345 )
//        {
//            // ! important ! Use DBPREFIX_<table_name> for all tables
//
//            $sql = "ALTER TABLE DBPREFIX_xxxxxxx ....";
//            self::applyDbUpgradeToAllDB( $sql );
//        }
//        if( $from_version <= 1405061421 )
//        {
//            // ! important ! Use DBPREFIX_<table_name> for all tables
//
//            $sql = "CREATE TABLE DBPREFIX_xxxxxxx ....";
//            self::applyDbUpgradeToAllDB( $sql );
//        }
//        // Please add your future database scheme changes here
//
//


    }    
}
