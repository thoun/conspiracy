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
require_once( 'modules/score.php' );

require_once('modules/utils.php');
require_once('modules/states.php');
require_once('modules/args.php');
require_once('modules/actions.php');
require_once('modules/solo-util.php');
require_once('modules/solo-actions.php');
require_once('modules/debug-util.php');

class Conspiracy extends Table {

    use UtilTrait;
    use ActionTrait;
    use StateTrait;
    use ArgsTrait;

    use SoloUtilTrait;
    use SoloActionTrait;

    use DebugUtilTrait;

	function __construct() {
        // Your global variables labels:
        //  Here, you can assign labels to global variables you are using for this game.
        //  You can use any number of global variables with IDs between 10 and 99.
        //  If your game has options (variants), you also have to associate here a label to
        //  the corresponding ID in gameoptions.inc.php.
        // Note: afterwards, you can get/set the global variables with getGameStateValue/setGameStateInitialValue/setGameStateValue
        parent::__construct();
        
        self::initGameStateLabels([
                "pearlMasterPlayer" => 10,

                //  // if > 0, indicates the player that added the constraint
                'AP_FIRST_LORD' => 11, // reset to 0 when this player plays again
                'AP_FIRST_LORDS' => 12, // reset to 0 when this player plays again
                'AP_DECK_LOCATION' => 14, // apply for all game, not reseted                
                'forceFirstByMilitary' => 15, // reset to 0 when real player ends is turn
                'playAgainPlayer' => 16,
                'usePlayAgain' => 17, // 0 : unasked, 1 saud yes, 2 said no

                'stackSelection' => 20, // 1 for lord stack selection, 0 for visible lords selection

                'endTurn' => 30, // id of player launching last turn

                'SCORING_OPTION' => 100,
                'BONUS_LOCATIONS' => 101,
                'SOLO_OPPONENT' => 102,
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
        $sql = "INSERT INTO player (player_id, player_color, player_canal, player_name, player_avatar, player_mat) VALUES ";
        $values = [];
        $affectedMats = [];
        foreach( $players as $player_id => $player ) {
            $color = array_shift( $default_colors );
            $player_mat = bga_rand(1, 10);
            while (array_search($player_mat, $affectedMats) !== false) {
                $player_mat = bga_rand(1, 10);
            }
            $affectedMats[] = $player_mat;

            $values[] = "('".$player_id."','$color','".$player['player_canal']."','".addslashes( $player['player_name'] )."','".addslashes( $player['player_avatar'] )."', $player_mat)";
        }
        $sql .= implode(',', $values);
        self::DbQuery( $sql );
        self::reattributeColorsBasedOnPreferences( $players, $gameinfos['player_colors'] );
        self::reloadPlayersBasicInfos();
        
        /************ Start the game initialization *****/

        // Init global values with their initial values
        self::setGameStateInitialValue( 'pearlMasterPlayer', -1);
        self::setGameStateInitialValue( 'AP_FIRST_LORD', 0 );
        self::setGameStateInitialValue( 'AP_FIRST_LORDS', 0 );
        self::setGameStateInitialValue( 'AP_DECK_LOCATION', 0 );
        self::setGameStateInitialValue( 'forceFirstByMilitary', 0 );
        self::setGameStateInitialValue( 'playAgainPlayer', 0 );
        self::setGameStateInitialValue( 'usePlayAgain', 0 );
        self::setGameStateInitialValue( 'stackSelection', 0 );
        self::setGameStateInitialValue( 'endTurn', 0);
        
        // Init game statistics
        // (note: statistics used in this file must be defined in your stats.inc.php file)
        self::initStat('table', 'turns_number', 0);
        self::initStat('table', 'players_number', count($players));

        self::initStat('player', 'turns_number', 0);
        self::initStat('player', 'played_lords', 0);
        self::initStat('player', 'played_locations', 0);
        self::initStat('player', 'pearls', 0);
        self::initStat('player', 'lords_points', 0);
        self::initStat('player', 'locations_points', 0);
        self::initStat('player', 'coalition_size', 0);
        self::initStat('player', 'pearl_master', 0);
        self::initStat('player', 'total_points', 0);

        // setup the initial game situation here
        $this->setupLordsCards();
        $this->setupLocationsCards(); 

        $solo = count($players) == 1;
        if ($solo) {
            $this->initOpponent($affectedMats);
        }
        
        // show the first location
        $this->locations->pickCardForLocation('deck', 'table');
        
        //$testedCard = $this->getLocationsFromDb($this->locations->getCardsOfType(9))[0];
        //$this->locations->moveCard($testedCard->id, 'table');
        //$testedCard = $this->getLocationsFromDb($this->locations->getCardsOfType(10))[0];
        //$this->locations->moveCard($testedCard->id, 'table');
        //$testedCard = $this->getLocationsFromDb($this->locations->getCardsOfType(11))[0];
        //$this->locations->moveCard($testedCard->id, 'table');
        //$testedCard = $this->getLocationsFromDb($this->locations->getCardsOfType(12))[0];
        //$this->locations->moveCard($testedCard->id, 'table');
        //$testedCard = $this->getLocationsFromDb($this->locations->getCardsOfType(25))[0];
        //$this->locations->moveCard($testedCard->id, 'table');

        //$this->lords->pickCardsForLocation(40, 'deck', 'nowhere');
        //$this->locations->pickCardsForLocation(20, 'deck', 'nowhere');

        // Activate first player (which is in general a good idea :) )
        $this->activeNextPlayer();

        // TODO TEMP
        //$this->debugSetup();

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
        if ($this->bonusLocations()) {
            foreach(array_keys($this->LOCATIONS_BONUS) as $locationId) {
                $cards[] = [ 'type' => $locationId, 'type_arg' => null, 'nbr' => 1 ];
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
        $result = [];
    
        $sql = "SELECT player_id id, player_score score, player_score_aux pearls, player_score_lords lords, player_score_locations locations, player_score_coalition coalition, player_mat mat, player_no playerNo FROM player ";
        $result['players'] = self::getCollectionFromDb( $sql );

        $solo = count($result['players']) == 1;
  
        // Gather all information about current game situation.

        $result['visibleLords'] = [];
        for ($guild=1; $guild<=5; $guild++) {
            $result['visibleLords'][$guild] = $this->getLordsFromDb($this->lords->getCardsInLocation('table', $guild));
        }
        $result['pickLords'] = $this->getLordsFromDb($this->lords->getCardsInLocation('lord_selection'));
        
        $result['visibleLocations'] = $this->getLocationsFromDb($this->locations->getCardsInLocation('table'));
        $result['pickLocations'] = $this->getLocationsFromDb($this->locations->getCardsInLocation('location_sel'));

        // players tables
        $result['playersTables'] = [];

        $playersIds = array_keys($result['players']);
        if ($solo) {
            $playersIds[] = 0;
        }

        foreach($playersIds as $player_id) {
            if ($player_id > 0) {
                $result['players'][$player_id]['playerNo'] = intval($result['players'][$player_id]['playerNo']);
            }
            
            $lords = $this->getLordsFromDb($this->lords->getCardsInLocation("player$player_id"));
            $locations = $this->getLocationsFromDb($this->locations->getCardsInLocation("player$player_id"));
            $result['playersTables'][$player_id] = [];
            for($spot = 1; $spot <= SPOT_NUMBER; $spot++) {
                $result['playersTables'][$player_id][$spot] = new PlayerTableSpot(
                    current(array_filter($lords, function($lord) use ($spot) { return $lord->location_arg === $spot; })),
                    current(array_filter($locations, function($location) use ($spot) { return $location->location_arg === $spot; }))
                );                
            }
        }

        $result['pearlMasterPlayer'] = intval(self::getGameStateValue('pearlMasterPlayer'));
        $result['playAgainPlayer'] = intval(self::getGameStateValue('playAgainPlayer'));

        $stateName = $this->gamestate->state()['name']; 
        $isEnd = $stateName === 'showScore' || $stateName === 'gameEnd';
        if (!$isEnd) {
            $endTurn = intval(self::getGameStateValue('endTurn'));
            $result['endTurn'] = $endTurn > 0 || $endTurn == -1;
            
        }

        foreach ($result['players'] as $player_id => $playerDb) {
            $result['players'][$player_id]['newScore'] = $this->getPlayerScore($player_id);
        }

        $result['remainingLords'] = $this->getRemainingLords();
        $result['remainingLocations'] = $this->getRemainingLocations();

        $result['hiddenScore'] = intval(self::getGameStateValue('SCORING_OPTION')) === 2;
        $result['bonusLocations'] = $this->bonusLocations();

        if ($solo) {
            $result['opponent'] = $this->getOpponent();

            $result['opponent']->newScore = $this->getPlayerScore(0);
        }
  
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
        $maxPlayedLords = intval(self::getUniqueValueFromDB( "SELECT count(*) FROM lord WHERE `card_location` like 'player%' GROUP BY `card_location` ORDER BY count(*) DESC LIMIT 1"));
        return $maxPlayedLords * 100 / 15;
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
        // we clean up if player left during his turn
    	$lordPick = $this->lords->getCardsInLocation('lord_pick');
        if (count($lordPick)) {
            $this->lords->moveAllCardsInLocation('lord_pick', 'lord_selection');
        }
        $lordSelection = $this->lords->getCardsInLocation('lord_selection');
        if (count($lordSelection)) {
            $this->placeRemainingLordSelectionToTable(true);
        }

    	$locationPick = $this->locations->getCardsInLocation('location_pick');
        if (count($locationPick)) {
            $this->locations->moveAllCardsInLocation('location_pick', 'location_sel');
        }
        $locationSelection = $this->locations->getCardsInLocation('location_sel');
        if (count($locationSelection)) {
            $this->locations->moveAllCardsInLocation('location_sel', 'table');

            self::notifyAllPlayers('discardLocationPick', '', [
                'discardedLocations' => $this->getLocationsFromDb($locationSelection)
            ]);
        }

        $this->gamestate->nextState( "zombiePass" );
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
    
    function upgradeTableDb($from_version) {
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
