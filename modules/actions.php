<?php

trait ActionTrait {

    //////////////////////////////////////////////////////////////////////////////
    //////////// Player actions
    //////////// 
    
    /*
        Each time a player is doing some game action, one of the methods below is called.
        (note: each method below must match an input method in nicodemus.action.php)
    */

    function chooseLordDeckStack(int $number) {
        self::checkAction('chooseDeckStack'); 
        // self::debug('[GBA] chooseLordDeckStack');

        $count = $this->getRemainingLords();
        if ($number > $count) {
            throw new Error("Can't take $number cards, only $count in deck");
        }

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

    function chooseVisibleStack(int $guild, bool $skipCheckAction = false) {
        if (!$skipCheckAction) {
            self::checkAction('chooseVisibleStack'); 
        }
        // self::debug('[GBA] chooseLordVisibleStack');

        $number = $this->lords->countCardInLocation('table', $guild);

        $this->lords->moveAllCardsInLocation('table', $number == 1 ? 'lord_pick' : 'lord_selection', $guild);
        
        $message = clienttranslate('${player_name} chooses to take all visible ${guild_name} lords');
        self::notifyAllPlayers('lordVisiblePile', $message, [
            'player_name' => $this->getPlayerName($this->getPlayerIdToPlaceCard()),
            'guild' => $guild,
            'guild_name' => $this->getGuildName($guild),
            'number' => $number,
            'i18n' => ['guild_name'],
        ]);

        self::setGameStateValue('stackSelection', 0);

        if ($guild == 2 && $this->isSoloMode() && $this->isOpponentTurn() && $this->getOpponentLord() == 2) {
            self::setGameStateValue('forceFirstByMilitary', 1);
        }

        $this->gamestate->nextState($number == 1 ? 'chooseOneOnStack' : 'chooseDeckStack');
    }

    function pickLord(int $id) {
        // self::debug('[GBA] pickLord');

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

        $newScore = $this->getAndSavePlayerScore($player_id);

        self::notifyAllPlayers('lordSwapped', clienttranslate('${player_name} swaps two lords'), [
            'playerId' => $player_id,
            'player_name' => self::getActivePlayerName(),
            'spot1' => $spot1,
            'spot2' => $spot2,
            'newScore' => $newScore,
        ]);

        $this->gamestate->nextState('next');
    }

    function dontSwap() {
        self::checkAction('next'); 

        $this->gamestate->nextState('next');
    }

    function chooseLocationDeckStack(int $number, bool $skipCheckAction = false) {
        if (!$skipCheckAction) {
            self::checkAction('chooseDeckStack');
        } 
        // self::debug('[GBA] chooseLocationDeckStack');
        $playerId = $this->getPlayerIdToPlaceCard();

        $count = $this->locations->countCardInLocation('deck');
        if ($number > $count || $count == 0) {
            throw new Error("Can't take $number cards, only $count in deck");
        }

        $fromHidden = $playerId != 0 && self::getGameStateValue('AP_DECK_LOCATION') == self::getActivePlayerId();

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
            'player_name' => $this->getPlayerName($this->getPlayerIdToPlaceCard()),
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

    function chooseVisibleLocation(int $id, bool $skipCheckAction = false) {        
        // self::debug('[GBA] chooseVisibleLocation');
        if (!$skipCheckAction) {
            self::checkAction('chooseVisibleLocation');
        } 
        
        $this->locations->moveCard($id, 'location_pick');

        $this->gamestate->nextState('chooseVisibleLocation');
    }

}
