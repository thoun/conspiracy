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
                "pearlMasterPlayer" => 10,

                //  // if > 0, indicates the player that added the constraint
                'AP_FIRST_LORD' => 11, // reset to 0 when this player plays again
                'AP_FIRST_LORDS' => 12, // reset to 0 when this player plays again
                'AP_DECK_LOCATION' => 14, // apply for all game, not reseted                

                'stackSelection' => 20, // 1 for lord stack selection, 0 for visible lords selection

                'endTurn' => 30, // id of player launching last turn
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
        $sql = "INSERT INTO player (player_id, player_color, player_canal, player_name, player_avatar, player_mat) VALUES ";
        $values = array();
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
        $sql .= implode( $values, ',' );
        self::DbQuery( $sql );
        self::reattributeColorsBasedOnPreferences( $players, $gameinfos['player_colors'] );
        self::reloadPlayersBasicInfos();
        
        /************ Start the game initialization *****/

        // Init global values with their initial values
        self::setGameStateInitialValue( 'pearlMasterPlayer', 0 );
        self::setGameStateInitialValue( 'AP_FIRST_LORD', 0 );
        self::setGameStateInitialValue( 'AP_FIRST_LORDS', 0 );
        self::setGameStateInitialValue( 'AP_DECK_LOCATION', 0 );
        self::setGameStateInitialValue( 'stackSelection', 0 );
        self::setGameStateInitialValue( 'endTurn', 0 );
        
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
        
        // show the first location
        $this->locations->pickCardForLocation('deck', 'table');

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
    
        $current_player_id = self::getCurrentPlayerId();
    
        $sql = "SELECT player_id id, player_score score, player_score_aux pearls, player_score_lords lords, player_score_locations locations, player_score_coalition coalition, player_mat mat FROM player ";
        $result['players'] = self::getCollectionFromDb( $sql );
  
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
        foreach( $result['players'] as $player_id => $playerDb ) {
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

        $stateName = $this->gamestate->state()['name']; 
        $isEnd = $stateName === 'showScore' || $stateName === 'gameEnd';

        foreach ($result['players'] as $player_id => $playerDb) {
            $detailedScore = new stdClass();
            if ($isEnd) {
                $detailedScore->lords = intval($playerDb['lords']);
                $detailedScore->locations = intval($playerDb['locations']);
                $detailedScore->coalition = intval($playerDb['coalition']);
                $detailedScore->pearlMaster = $result['pearlMasterPlayer'] == $player_id ? 5 : 0;
                $detailedScore->total = intval($playerDb['score']);
            }

            $result['players'][$player_id]['detailedScore'] = $detailedScore;
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
        $hasActivePowerKeys = count(array_values(array_filter($locations, function ($location) { return $location->activePower === AP_KEYS; }))) > 0;

        if ($hasActivePowerKeys) {
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

    function chooseLordDeckStack(int $number) {
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

    function chooseVisibleStack(int $guild) {
        self::checkAction('chooseVisibleStack'); 
        self::debug('[GBA] chooseLordVisibleStack');

        $number = $this->lords->countCardInLocation('table', $guild);

        $this->lords->moveAllCardsInLocation('table', $number == 1 ? 'lord_pick' : 'lord_selection', $guild);
        
        $message = clienttranslate('${player_name} chooses to take all visible ${guild_name} lords');
        self::notifyAllPlayers('lordVisiblePile', $message, [
            'player_name' => self::getActivePlayerName(),
            'guild' => $guild,
            'guild_name' => $this->getGuildName($guild),
            'number' => $number,
        ]);

        self::setGameStateValue('stackSelection', 0);
        $this->gamestate->nextState($number == 1 ? 'chooseOneOnStack' : 'chooseDeckStack');
    }

    function pickLord(int $id) {
        self::debug('[GBA] pickLord');

        $lord = $this->getLordFromDb($this->lords->getCard($id));
        if ($lord->location !== 'lord_selection') {
            throw new Error('Picked lord is not available');
        }
        $this->lords->moveCard($lord->id, 'lord_pick');

        $this->gamestate->nextState('addLord');
    }

    function swap(string $spotsStr) {
        self::checkAction('next'); 

        $spots = explode(',', $spotsStr);
        $spot1 = intval($spots[0]);
        $spot2 = intval($spots[1]);

        $player_id = intval(self::getActivePlayerId());

        $cardSpot1 = $this->getLordsFromDb($this->lords->getCardsInLocation("player$player_id", $spot1))[0];
        $cardSpot2 = $this->getLordsFromDb($this->lords->getCardsInLocation("player$player_id", $spot2))[0];

        $this->lords->moveCard($cardSpot1->id, "player$player_id", $spot2);
        $this->lords->moveCard($cardSpot2->id, "player$player_id", $spot1);

        self::notifyAllPlayers('lordSwapped', clienttranslate('${player_name} swaps two lords'), [
            'playerId' => $player_id,
            'player_name' => self::getActivePlayerName(),
            'spot1' => $spot1,
            'spot2' => $spot2,
        ]);

        $this->gamestate->nextState('next');
    }

    function dontSwap() {
        self::checkAction('next'); 

        $this->gamestate->nextState('next');
    }

    function chooseLocationDeckStack(int $number) {
        self::checkAction('chooseDeckStack'); 
        self::debug('[GBA] chooseLocationDeckStack');

        $fromHidden = self::getGameStateValue('AP_DECK_LOCATION') == self::getActivePlayerId();

        if ($fromHidden && $number !== 0) {
            throw new Error('You must look all locations');
        } else if (!$fromHidden && ($number < 1 || $number > 3)) {
            throw new Error('You must look 1 to 3 locations');
        }

        if ($fromHidden) {
            $this->locations->moveAllCardsInLocation('deck', 'location_sel');
        } else {
            $this->locations->pickCardsForLocation($number, 'deck', $number == 1 ? 'location_pick' : 'location_sel');
        }

        $message = null;
        if ($fromHidden) { 
            $message = clienttranslate('${player_name} chooses a location from all deck cards');
        } else {
            $message = $number > 1 ?
                clienttranslate('${player_name} chooses to take ${number} locations from the deck') :
                clienttranslate('${player_name} chooses to take ${number} location from the deck');
        }
        self::notifyAllPlayers('locationDeckNumber', $message, [
            'player_name' => self::getActivePlayerName(),
            'number' => $number,
        ]);

        $this->gamestate->nextState($number == 1 ? 'chooseOneOnStack' : 'chooseDeckStack');
    }

    function pickLocation(int $id) {
        $location = $this->getLocationFromDb($this->locations->getCard($id));
        if ($location->location !== 'location_sel') {
            throw new Error('Picked location is not available');
        }
        $this->locations->moveCard($location->id, 'location_pick');

        $this->gamestate->nextState('addLocation');
    }

    function chooseVisibleLocation(int $id) {        
        self::debug('[GBA] chooseVisibleLocation');
        
        $this->locations->moveCard($id, 'location_pick');

        $this->gamestate->nextState('chooseVisibleLocation');
    }

    function checkPearlMaster(int $player_id) {        

        // check Master pearls
        $pearlMasterPlayer = self::getGameStateValue('pearlMasterPlayer');
        if ($pearlMasterPlayer !== $player_id) {
            $masterPearlPearls = intval(self::getUniqueValueFromDB( "SELECT player_score_aux FROM `player` WHERE player_id = $pearlMasterPlayer"));
            $currentPlayerPearls = intval(self::getUniqueValueFromDB( "SELECT player_score_aux FROM `player` WHERE player_id = $player_id"));
            
            if ($currentPlayerPearls >= $masterPearlPearls) {
                self::setGameStateValue('pearlMasterPlayer', $player_id);
                self::notifyAllPlayers('newPearlMaster', clienttranslate('${player_name} becomes the new Pearl Master'), [
                    'playerId' => $player_id,
                    'player_name' => self::getActivePlayerName()
                ]);
            }
        }
    }

    function placeRemainingLordSelectionToTable(bool $notify): array {
        $remainingLords = $this->getLordsFromDb($this->lords->getCardsInLocation('lord_selection'));
        foreach($remainingLords as $lord) {
            $this->lords->moveCard($lord->id, 'table', $lord->guild);
        }

        if ($notify) {
            self::notifyAllPlayers('discardLordPick', '', [
                'discardedLords' => $remainingLords
            ]);
        }

        return $remainingLords;
    } 

    function getTopLordPoints(int $player_id, int $guild): int {
        $lords = $this->getLordsFromDb($this->lords->getCardsInLocation("player$player_id"));
        $guildLords = array_values(array_filter($lords, function($lord) use ($guild) { return $lord->guild == $guild; }));
        $guildLordsPoints = array_map(function ($lord) { return $lord->points; }, $guildLords);

        if (count($guildLordsPoints) > 0) {
            return max($guildLordsPoints);
        } else {
            return 0;
        }
    }

    function canSwap(int $player_id): bool {
        $lords = $this->getLordsFromDb($this->lords->getCardsInLocation("player$player_id"));
        $swappableLords = array_values(array_filter($lords, function($lord) { return !$lord->key; }));

        return count($swappableLords) >= 2;
    }

    function getScoreLords(int $player_id): int {
        $points = 0;

        for ($guild=1; $guild<=5; $guild++) {
            $points += $this->getTopLordPoints($player_id, $guild);
        }

        return $points;
    }

    function getScoreLocations(int $player_id, int $pearls): int { 
        $points = 0;

        $locations = $this->getLocationsFromDb($this->locations->getCardsInLocation("player$player_id"));
        $lords = $this->getLordsFromDb($this->lords->getCardsInLocation("player$player_id"));

        foreach($locations as $location) {
            $points += $location->points;

            if ($location->passivePower == PP_SILVER_KEYS) {
                $points += count(array_values(array_filter($lords, function($lord) { return $lord->key === 1; })));
            }

            if ($location->passivePower == PP_GOLD_KEYS) {
                $points += count(array_values(array_filter($lords, function($lord) { return $lord->key === 2; }))) * 2;
            }

            if ($location->passivePower == PP_PEARLS) {
                $points += floor($pearls / 2);
            }

            if ($location->passivePower == PP_LOCATIONS) {
                $points += count($locations) * 2;
            }

            if ($location->passivePower == PP_LORD_MAX) {
                $points += $this->getTopLordPoints($player_id, $location->passivePowerGuild);
            }

            if ($location->passivePower == PP_LORD_COUNT) {
                $guild = $location->passivePowerGuild;
                $points += count(array_values(array_filter($lords, function($lord) use ($guild) { return $lord->guild == $guild; })));
            }

            self::debug('location points after '.$location->type.' : ' . $points . '.');
        }

        return $points;
    }

    function getLordInSpot(int $player_id, int $spot) {
        $lords = $this->getLordsFromDb($this->lords->getCardsInLocation("player$player_id", $spot));
        return count($lords) > 0 ? $lords[0] : null;
    }

    function getCoalitionSize(int $player_id, $coalition, int $currentSpot) {
        // we check we don't count twice the same spot
        if (array_search($currentSpot, $coalition->alreadyCounted) !== false) {
            return;
        }

        $coalition->size++;
        $coalition->alreadyCounted = array_merge($coalition->alreadyCounted, [$currentSpot]);

        // we only take lords having same guild
        $filteredNeigbours = array_filter($this->NEIGHBOURS[$currentSpot], function($neighbour) use ($player_id, $coalition) {
            $lord = $this->getLordInSpot($player_id, $neighbour);
            return !!$lord && $coalition->guild === $lord->guild;
        });

        foreach ($filteredNeigbours as $filteredNeigbour) {
            $coalition->size += $this->getCoalitionSize($player_id, $coalition, $filteredNeigbour);
        }
    }

    function getScoreTopCoalition(int $player_id) {
        $topCoalition = null;

        for ($spot = 1; $spot <= SPOT_NUMBER; $spot++) {
            $lordInSpot = $this->getLordInSpot($player_id, $spot);

            if ($lordInSpot) {
                $coalition = new stdClass();
                $coalition->spot = $spot;
                $coalition->size = 0;
                $coalition->guild = $lordInSpot->guild;
                $coalition->alreadyCounted = [];
                $this->getCoalitionSize($player_id, $coalition, $spot);
                
                if (!$topCoalition || $coalition->size > $topCoalition->size) {
                    $topCoalition = $coalition;
                }
            }
        }

        return $topCoalition;
    }

    function getGuildName(int $guild) {
        $guildName = null;
        switch ($guild) {
            case 1: $guildName = clienttranslate('Farmer'); break;
            case 2: $guildName = clienttranslate('Military'); break;
            case 3: $guildName = clienttranslate('Merchant'); break;
            case 4: $guildName = clienttranslate('Politician'); break;
            case 5: $guildName = clienttranslate('Mage'); break;
        }
        return $guildName;
    }
    
//////////////////////////////////////////////////////////////////////////////
//////////// Game state arguments
////////////

    /*
        Here, you can create methods defined as "game state arguments" (see "args" property in states.inc.php).
        These methods function is to return some additional information that is specific to the current
        game state.
    */
    
    function argLordStackSelection() {
        $limitToHidden = null;
        if (self::getGameStateValue('AP_FIRST_LORD') > 0) {
            $limitToHidden = 1;
        } else if (self::getGameStateValue('AP_FIRST_LORDS') > 0) {
            $limitToHidden = 2;
        }
        return ['limitToHidden' => $limitToHidden];
    }
    
    function argLordSelection() {
        $lords = $this->getLordsFromDb($this->lords->getCardsInLocation('lord_selection'));
        return [ 'lords' => $lords ];
    }
    
    function argLocationStackSelection() {
        return ['allHidden' => self::getGameStateValue('AP_DECK_LOCATION') == self::getActivePlayerId()];
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
        $lord = $this->getLordFromDb(array_values($this->lords->getCardsInLocation('lord_pick'))[0]);
        $player_id = intval(self::getActivePlayerId());

        $topLordPoints = $this->getTopLordPoints($player_id, $lord->guild);

        $spot = $this->lords->countCardInLocation("player${player_id}") + 1;
        $this->lords->moveCard($lord->id, "player${player_id}", $spot);

        $stackSelection = self::getGameStateValue('stackSelection') == 1;
        $remainingLords = [];
        if ($stackSelection) {
            $remainingLords = $this->placeRemainingLordSelectionToTable(false);
        } else {
            $remainingLords = $this->getLordsFromDb($this->lords->getCardsInLocation('lord_selection'));
        }

        self::debug('[GBA] points '.$topLordPoints. ' '.$lord->points);
        $points = 0;
        if ($lord->points > $topLordPoints) {
            $points = $lord->points - $topLordPoints;
        }
        $pearls = $lord->pearls;
        self::DbQuery("UPDATE player SET player_score = player_score + $points, player_score_aux = player_score_aux + $pearls WHERE player_id = $player_id");
        
        $message = null;
        switch ($lord->type) {
            case 1: $message = clienttranslate('${player_name} plays 0 point ${guild_name} lord with swap power'); break;
            case 2: $message = clienttranslate('${player_name} plays 1 point ${guild_name} lord with silver key'); break;
            case 3: $message = clienttranslate('${player_name} plays 2 points ${guild_name} lord with gold key'); break;
            case 4: $message = clienttranslate('${player_name} plays 3 points ${guild_name} lord and gets 2 pearls'); break;
            case 5: $message = clienttranslate('${player_name} plays 4 points ${guild_name} lord and get 1 pearl'); break;
            case 6: $message = clienttranslate('${player_name} plays 6 points ${guild_name} lord and reveal a lord from the deck'); break;
        }

        self::notifyAllPlayers('lordPlayed', $message, [
            'playerId' => $player_id,
            'player_name' => self::getActivePlayerName(),
            'lord' => $lord,
            'spot' => $spot,
            'stackSelection' => $stackSelection,
            'discardedLords' => $remainingLords,
            'points' => $points,
            'pearls' => $pearls,
            'guild' => $lord->guild,
            'guild_name' => $this->getGuildName($lord->guild),
        ]);

        if ($lord->showExtraLord) {
            $extraLord = $this->addExtraLord();

            self::notifyAllPlayers('extraLordRevealed', clienttranslate('A ${guild_name} lord is added in the discard pile'), [
                'lord' => $extraLord,
                'guild' => $extraLord->guild,
                'guild_name' => $this->getGuildName($extraLord->guild),
            ]);
        }

        $this->checkPearlMaster($player_id);

        self::incStat(1, 'played_lords', $player_id);

        if ($lord->swap && $this->canSwap($player_id)) {
            $this->gamestate->nextState('swap');
            self::giveExtraTime($player_id);
        } else if ($lord->key && $this->canConstructWithNewKey($player_id, $lord->key)) {
            $this->gamestate->nextState('addLocation');
            self::giveExtraTime($player_id);
        } else {
            $this->gamestate->nextState('next');
        }
    }

    function stAddLocation() {
        $location = $this->getLocationFromDb(array_values($this->locations->getCardsInLocation('location_pick'))[0]);
        $player_id = intval(self::getActivePlayerId());

        $spot = $this->lords->countCardInLocation("player${player_id}");
        $this->locations->moveCard($location->id, "player${player_id}", $spot);

        $fromHidden = self::getGameStateValue('AP_DECK_LOCATION') == self::getActivePlayerId();

        $remainingLocations = $this->getLocationsFromDb($this->locations->getCardsInLocation('location_sel'));
        foreach($remainingLocations as $remainingLocation) {
            $this->locations->moveCard($remainingLocation->id, $fromHidden ? 'deck' : 'table');
        }
        if ($fromHidden) {
            $this->locations->shuffle('deck');
        }
        
        $points = $location->points;
        $pearls = $location->pearls;
        self::DbQuery("UPDATE player SET player_score = player_score + $points, player_score_aux = player_score_aux + $pearls WHERE player_id = $player_id");
        
        self::notifyAllPlayers('locationPlayed', clienttranslate('${player_name} plays ${points} point(s) location'), [
            'playerId' => $player_id,
            'player_name' => self::getActivePlayerName(),
            'location' => $location,
            'spot' => $spot,
            'discardedLocations' => $fromHidden ? [] : $remainingLocations,
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
        if ($location->activePower == AP_FIRST_LORD) {
            self::setGameStateValue('AP_FIRST_LORD', $player_id);
            self::setGameStateValue('AP_FIRST_LORDS', 0);
        }
        if ($location->activePower == AP_FIRST_LORDS) {
            self::setGameStateValue('AP_FIRST_LORDS', $player_id);
            self::setGameStateValue('AP_FIRST_LORD', 0);
        }
        if ($location->activePower == AP_DECK_LOCATION) {
            self::setGameStateValue('AP_DECK_LOCATION', $player_id);
        }

        self::incStat(1, 'played_locations', $player_id);

        $this->gamestate->nextState('next');
    }

    function stEndLord() {

        if ($this->lords->countCardInLocation('lord_selection') > 0) { 
            $player_id = self::getActivePlayerId();
            $playedLords = $this->lords->countCardInLocation("player$player_id");

            if ($playedLords < SPOT_NUMBER) {
                self::giveExtraTime($player_id);
                $this->gamestate->nextState('nextLord');
            } else {
                $this->placeRemainingLordSelectionToTable(true);
                $this->gamestate->nextState('nextPlayer');
            }
        } else {
            $this->gamestate->nextState('nextPlayer');
        }
    }

    function stNextPlayer() {        
        $player_id = self::getActivePlayerId();

        self::incStat(1, 'turns_number');
        self::incStat(1, 'turns_number', $player_id);

        if (self::getGameStateValue('endTurn') == 0) {    
            $playedLords = $this->lords->countCardInLocation("player$player_id");

            if ($playedLords == SPOT_NUMBER) {
                self::setGameStateValue('endTurn', $player_id);

                self::notifyAllPlayers('lastTurn', clienttranslate('${player_name} has completed the pyramid, starting last turn !'), [
                    'playerId' => $player_id,
                    'player_name' => self::getActivePlayerName()
                ]);
            }
        }

        $player_id = self::activeNextPlayer();
        self::giveExtraTime($player_id);

        if (self::getGameStateValue('endTurn') == $player_id) {
            $this->gamestate->nextState('showScore');
        } else {
            // if we come back to card player, we erase constraint
            if (self::getGameStateValue('AP_FIRST_LORD') == $player_id) {
                self::setGameStateValue('AP_FIRST_LORD', 0);
            }
            if (self::getGameStateValue('AP_FIRST_LORDS') == $player_id) {
                self::setGameStateValue('AP_FIRST_LORDS', 0);
            }

            $this->gamestate->nextState('nextPlayer');
        }
    }

    function stShowScore() {
        $sql = "SELECT player_id id, player_name, player_score_aux pearls FROM player ORDER BY player_no ASC";
        $players = self::getCollectionFromDb($sql);

        // we reinit points as we gave points for lords & locations
        self::DbQuery("UPDATE player SET player_score = 0");

        $playersPoints = [];

        // lords 
        foreach ($players as $player_id => $playerDb) {
            $points = $this->getScoreLords($player_id);

            $playersPoints[$player_id] = $points;
            self::DbQuery("UPDATE player SET player_score = player_score + $points, player_score_lords = $points WHERE player_id = $player_id");

            self::notifyAllPlayers('scoreLords', clienttranslate('${player_name} wins ${points} points with lords'), [
                'playerId' => $player_id,
                'player_name' => self::getActivePlayerName(),
                'points' => $points,
            ]);

            self::setStat($points, 'lords_points', $player_id);
        }

        // locations
        foreach ($players as $player_id => $playerDb) {
            $points = $this->getScoreLocations($player_id, intval($playerDb['pearls']));

            $playersPoints[$player_id] += $points;
            self::DbQuery("UPDATE player SET player_score = player_score + $points, player_score_locations = $points WHERE player_id = $player_id");

            self::notifyAllPlayers('scoreLocations', clienttranslate('${player_name} wins ${points} points with locations'), [
                'playerId' => $player_id,
                'player_name' => self::getActivePlayerName(),
                'points' => $points,
            ]);
            
            self::setStat($points, 'locations_points', $player_id);
        }

        // coalition
        foreach ($players as $player_id => $playerDb) {
            $coalition = $this->getScoreTopCoalition($player_id);
            $points = $coalition->size * 3;

            $playersPoints[$player_id] += $points;
            self::DbQuery("UPDATE player SET player_score = player_score + $points, player_score_coalition = $points WHERE player_id = $player_id");

            self::notifyAllPlayers('scoreCoalition', clienttranslate('${player_name} wins ${points} points with greatest Lords Coalition'), [
                'playerId' => $player_id,
                'player_name' => self::getActivePlayerName(),
                'points' => $points,
                'coalition' => $coalition,
            ]);

            self::setStat($coalition->size, 'coalition_size', $player_id);
        }

        // pearl master
        $pearlMaster = intval(self::getGameStateValue('pearlMasterPlayer'));
        $playerDb = array_values(array_filter($players, function($player) use ($pearlMaster) { return intval($player['id']) == $pearlMaster; }))[0];

        $playersPoints[$pearlMaster] += 5;
        self::DbQuery("UPDATE player SET player_score = player_score + 5 WHERE player_id = $pearlMaster");

        self::notifyAllPlayers('scorePearlMaster', clienttranslate('${player_name} is the Pearl Master and wins 5 points'), [
            'playerId' => $pearlMaster,
            'player_name' => self::getActivePlayerName()
        ]);

        foreach ($players as $player_id => $playerDb) {
            self::setStat(intval($playerDb['pearls']), 'pearls', $player_id);
            self::setStat($player_id == $pearlMaster ? 1 : 0, 'pearl_master', $player_id);
        }

        // total
        foreach ($players as $player_id => $playerDb) {
            $points = $playersPoints[$player_id];
            self::notifyAllPlayers('scoreTotal', clienttranslate('${player_name} has ${points} in total'), [
                'playerId' => $player_id,
                'player_name' => self::getActivePlayerName(),
                'points' => $points,
            ]);

            self::setStat($points, 'total_points', $player_id);
        }

        $this->gamestate->nextState('endGame');
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
