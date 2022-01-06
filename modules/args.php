<?php

trait ArgsTrait {
    
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
        $count = $this->getRemainingLords();

        if ($count > 0) {
            if (self::getGameStateValue('AP_FIRST_LORD') > 0 || intval(self::getGameStateValue('forceFirstByMilitary')) == 1) {
                $limitToHidden = 1;
            } else if (self::getGameStateValue('AP_FIRST_LORDS') > 0) {
                $limitToHidden = 2;
            }
        }

        $opponentTurn = $this->isSoloMode() && $this->isOpponentTurn();
        $piles = [];
        if ($opponentTurn) {
            $piles = $this->getLordDeckPiles(false, false);
        }

        return [
            'limitToHidden' => $limitToHidden,
            'max' => intval(min(3, $count)),
            'opponentTurn' => $opponentTurn,
            'piles' => $piles,
        ];
    }
    
    function argLordSelection() {
        $lords = $this->getLordsFromDb($this->lords->getCardsInLocation('lord_selection'));
        return [
            'lords' => $lords,
            'multiple' => self::getGameStateValue('stackSelection') != 1,
            'remainingLords' => $this->getRemainingLords(),
            'opponentTurn' => ($this->isSoloMode() && $this->isOpponentTurn()),
        ];
    }
    
    function argLordPlacement() {
        return [
            'remainingLords' => $this->getRemainingLords(),
        ];
    }
    
    function argLocationStackSelection() {
        $count = $this->locations->countCardInLocation('deck');
        return [
            'allHidden' => self::getGameStateValue('AP_DECK_LOCATION') == self::getActivePlayerId(),
            'max' => intval(min(3, $count)),
        ];
    }

    function argLocationSelection() {
        $locations = $this->getLocationsFromDb($this->locations->getCardsInLocation('location_sel'));    
        return [ 
            'locations' => $locations,
            'remainingLocations' => $this->getRemainingLocations(),
        ];
    }

    function argLocationPlacement() { 
        return [
            'remainingLocations' => $this->getRemainingLocations(),
        ];
    }

}