<?php

trait StateTrait {

//////////////////////////////////////////////////////////////////////////////
//////////// Game state actions
////////////

    /*
        Here, you can create methods defined as "game state actions" (see "action" property in states.inc.php).
        The action method of state X is called everytime the current game state is set to X.
    */

    function stLordStackSelection() {
        if ($this->isSoloMode() && $this->isOpponentTurn()) {
            $piles = $this->getLordDeckPiles(true);

            if (count($piles) == 1) {
                $this->chooseVisibleStack($piles[0], true);
            }
        }
    }

    function stPlayLord() {
        $lord = $this->getLordFromDb(array_values($this->lords->getCardsInLocation('lord_pick'))[0]);
        $player_id = $this->getPlayerIdToPlaceCard();

        $spot = $this->lords->countCardInLocation("player${player_id}") + 1;
        $this->lords->moveCard($lord->id, "player${player_id}", $spot);

        $stackSelection = self::getGameStateValue('stackSelection') == 1;
        $remainingLords = [];
        if ($stackSelection) {
            $remainingLords = $this->placeRemainingLordSelectionToTable(false);
        } else {
            $remainingLords = $this->getLordsFromDb($this->lords->getCardsInLocation('lord_selection'));
        }
        
        $pearls = $lord->pearls;
        if ($pearls) {
            $this->incPearls($player_id, $pearls);
        }
        
        $message = null;
        switch ($lord->type) {
            case 1: $message = clienttranslate('${player_name} plays 0 point ${guild_name} lord with swap power'); break;
            case 2: $message = clienttranslate('${player_name} plays 1 point ${guild_name} lord with silver key'); break;
            case 3: $message = clienttranslate('${player_name} plays 2 points ${guild_name} lord with gold key'); break;
            case 4: $message = clienttranslate('${player_name} plays 3 points ${guild_name} lord and gets 2 pearls'); break;
            case 5: $message = clienttranslate('${player_name} plays 4 points ${guild_name} lord and get 1 pearl'); break;
            case 6: $message = clienttranslate('${player_name} plays 6 points ${guild_name} lord and reveal a lord from the deck'); break;
        }

        $newScore = $this->getAndSavePlayerScore($player_id);

        self::notifyAllPlayers('lordPlayed', $message, [
            'playerId' => $player_id,
            'player_name' => $this->getPlayerName($player_id),
            'lord' => $lord,
            'spot' => $spot,
            'stackSelection' => $stackSelection,
            'discardedLords' => $remainingLords,
            'newScore' => $newScore,
            'pearls' => $pearls,
            'guild' => $lord->guild,
            'guild_name' => $this->getGuildName($lord->guild),
            'i18n' => ['guild_name'],
        ]);

        if ($lord->showExtraLord && $this->getRemainingLords() > 0) {
            $this->revealExtraLord();
        }

        if ($lord->pearls > 0) {
            $this->checkPearlMaster($player_id);
        }

        if ($player_id > 0) {
            self::incStat(1, 'played_lords', $player_id);

            if ($this->isSoloMode() && intval(self::getGameStateValue('playAgainPlayer')) == 0) {
                if ($this->createdNewColorArea($player_id, $spot)) {
                    self::setGameStateValue('playAgainPlayer', $player_id);

                    self::notifyAllPlayers('newPlayAgainPlayer', clienttranslate('${player_name} gets the Replay token'), [
                        'playerId' => $player_id,
                        'player_name' => self::getPlayerName($player_id),
                    ]);
                }
            }
        }

        if ($lord->swap && $this->canSwap($player_id)) {
            $this->gamestate->nextState('swap');
            if ($player_id > 0) {
                self::giveExtraTime($player_id);
            }
        } else if ($lord->key && $this->canConstruct($player_id)) {
            $this->gamestate->nextState('addLocation');
            if ($player_id > 0) {
                self::giveExtraTime($player_id);
            }
        } else {
            $this->gamestate->nextState('next');
        }
    }

    function stLocationStackSelection() {
        $player_id = $this->getPlayerIdToPlaceCard();
        if ($player_id == 0) {
            $this->pickOpponentLocation();
        }
    }

    function stAddLocation() {
        $location = $this->getLocationFromDb(array_values($this->locations->getCardsInLocation('location_pick'))[0]);
        $player_id = $this->getPlayerIdToPlaceCard();

        $spot = $this->lords->countCardInLocation("player${player_id}");
        $this->locations->moveCard($location->id, "player${player_id}", $spot);

        $fromHidden = $player_id > 0 && self::getGameStateValue('AP_DECK_LOCATION') == $player_id;

        $remainingLocations = $this->getLocationsFromDb($this->locations->getCardsInLocation('location_sel'));
        foreach($remainingLocations as $remainingLocation) {
            $this->locations->moveCard($remainingLocation->id, $fromHidden ? 'deck' : 'table');
        }
        if ($fromHidden) {
            $this->locations->shuffle('deck');
        }
        
        $pearls = $location->pearls;
        if ($pearls) {
            $this->incPearls($player_id, $pearls);
        }

        $newScore = $this->getAndSavePlayerScore($player_id);
        
        self::notifyAllPlayers('locationPlayed', clienttranslate('${player_name} plays ${points} point(s) location'), [
            'playerId' => $player_id,
            'player_name' => $this->getPlayerName($player_id),
            'location' => $location,
            'spot' => $spot,
            'discardedLocations' => $fromHidden ? [] : $remainingLocations,
            'points' => $player_id == 0 ? 5 : $location->points,
            'newScore' => $newScore,
            'pearls' => $pearls,
            'remainingLocations' => $this->getRemainingLocations(),
        ]);

        if ($player_id > 0) {
            if ($location->pearls > 0) {
                $this->checkPearlMaster($player_id);
            }

            if ($location->activePower == AP_DISCARD_LORDS && $this->lords->countCardInLocation("table") > 0) {
                $this->lords->moveAllCardsInLocation('table', 'deck');
                $this->lords->shuffle('deck');
                self::notifyAllPlayers('discardLords', clienttranslate('Lords are discarded'), [                
                    'remainingLords' => $this->getRemainingLords(),
                ]);
            }
            if ($location->activePower == AP_DISCARD_LOCATIONS && $this->locations->countCardInLocation("table") > 0) {
                $this->locations->moveAllCardsInLocation('table', 'deck');
                $this->locations->shuffle('deck');
                self::notifyAllPlayers('discardLocations', clienttranslate('Locations are discarded'), [                
                    'remainingLocations' => $this->getRemainingLocations(),
                ]);
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
        }

        $this->gamestate->nextState('next');
    }

    function stEndLord() {

        if ($this->lords->countCardInLocation('lord_selection') > 0) { 
            $playerId = $this->getPlayerIdToPlaceCard();
            $playedLords = $this->lords->countCardInLocation("player$playerId");

            if ($playedLords < SPOT_NUMBER) {
                self::giveExtraTime(self::getActivePlayerId());
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
        $activePlayerId = self::getActivePlayerId();
        $playerId = $this->getPlayerIdToPlaceCard();

        $solo = $this->isSoloMode();
        $opponentTurn = $solo && $this->isOpponentTurn();
        if (intval(self::getGameStateValue('playAgainPlayer')) == $activePlayerId && !$opponentTurn && intval(self::getGameStateValue('usePlayAgain')) == 0) {

            if ($this->lords->countCardInLocation("player${activePlayerId}") < 15) {
                $this->gamestate->nextState('askReplay');
                return;
            }
        }

        self::incStat(1, 'turns_number');
        if ($playerId > 0) {
            self::incStat(1, 'turns_number', $playerId);
        }

        if (intval(self::getGameStateValue('forceFirstByMilitary')) == 1 && !$opponentTurn) {
            self::setGameStateValue('forceFirstByMilitary', 0);
        }

        if (self::getGameStateValue('endTurn') == 0) {    
            $playedLords = $this->lords->countCardInLocation("player$playerId");

            if ($playedLords == SPOT_NUMBER) {
                self::setGameStateValue('endTurn', $playerId == 0 ? -1 : $playerId);

                self::notifyAllPlayers('lastTurn', clienttranslate('${player_name} has completed the pyramid, starting last turn !'), [
                    'playerId' => $playerId,
                    'player_name' => $this->getPlayerName($playerId),
                ]);
            }
        }

        $activePlayerId = self::activeNextPlayer();
        self::giveExtraTime($activePlayerId);
            
        if ($solo) {
            if (intval(self::getGameStateValue('usePlayAgain')) == 1) {
                self::setGameStateValue('playAgainPlayer', 0);

                self::notifyAllPlayers('newPlayAgainPlayer', clienttranslate('${player_name} gets the Replay token'), [
                    'playerId' => 0,
                    'player_name' => self::getPlayerName(0),
                ]);
            } else {
                $this->toggleOpponentTurn();
            }
            self::setGameStateValue('usePlayAgain', 0);
        }

        $endTurn = self::getGameStateValue('endTurn');
        $showScore = ($endTurn > 0 && $endTurn == $activePlayerId && !$opponentTurn) || ($endTurn == -1 && $this->getPlayerIdToPlaceCard() == 0);
        if ($showScore) {
            $this->gamestate->nextState('showScore');
        } else {
            // if we come back to card player, we erase constraint
            if (self::getGameStateValue('AP_FIRST_LORD') == $activePlayerId) {
                self::setGameStateValue('AP_FIRST_LORD', 0);
            }
            if (self::getGameStateValue('AP_FIRST_LORDS') == $activePlayerId) {
                self::setGameStateValue('AP_FIRST_LORDS', 0);
            }

            $this->gamestate->nextState('nextPlayer');
        }
    }

    function stShowScore() {
        $sql = "SELECT player_id id, player_name, player_score_aux pearls FROM player ORDER BY player_no ASC";
        $players = self::getCollectionFromDb($sql);
        $solo = $this->isSoloMode();

        // we reinit points as we gave points for lords & locations
        self::DbQuery("UPDATE player SET player_score = 0");
        if ($solo) {
            $this->setOpponentScore(0);
        }

        $playersPoints = [];

        $playersWithSolo = $solo ? $players + [ 0 => []] : $players;

        // lords 
        foreach ($playersWithSolo as $playerId => $playerDb) {
            $points = $this->getScoreLords($playerId);

            $playersPoints[$playerId] = $points;
            if ($playerId > 0) {
                self::DbQuery("UPDATE player SET player_score = player_score + $points, player_score_lords = $points WHERE player_id = $playerId");
            } else {
                $this->incOpponentScore($points);
                $this->setOpponentScoreLords($points);
            }

            self::notifyAllPlayers('scoreLords', clienttranslate('${player_name} wins ${points} points with lords'), [
                'playerId' => $playerId,
                'player_name' => $this->getPlayerName($playerId),
                'points' => $points,
            ]);

            if ($playerId > 0) {
                self::setStat($points, 'lords_points', $playerId);
            }
        }

        // locations
        foreach ($playersWithSolo as $playerId => $playerDb) {
            $points = $this->getScoreLocations($playerId, $playerId == 0 ? $this->getOpponentPearls() : intval($playerDb['pearls']));

            $playersPoints[$playerId] += $points;
            if ($playerId > 0) {
                self::DbQuery("UPDATE player SET player_score = player_score + $points, player_score_locations = $points WHERE player_id = $playerId");
            } else {
                $this->incOpponentScore($points);
                $this->setOpponentScoreLocations($points);
            }

            self::notifyAllPlayers('scoreLocations', clienttranslate('${player_name} wins ${points} points with locations'), [
                'playerId' => $playerId,
                'player_name' => $this->getPlayerName($playerId),
                'points' => $points,
            ]);
            
            if ($playerId > 0) {
                self::setStat($points, 'locations_points', $playerId);
            }
        }

        // coalition
        foreach ($playersWithSolo as $playerId => $playerDb) {
            $coalition = $this->getScoreTopCoalition($playerId);
            $points = $coalition->size * 3;

            $playersPoints[$playerId] += $points;
            if ($playerId > 0) {
                self::DbQuery("UPDATE player SET player_score = player_score + $points, player_score_coalition = $points WHERE player_id = $playerId");
            } else {
                $this->incOpponentScore($points);
                $this->setOpponentScoreCoalition($points);
            }

            self::notifyAllPlayers('scoreCoalition', clienttranslate('${player_name} wins ${points} points with greatest Lords Coalition'), [
                'playerId' => $playerId,
                'player_name' => $this->getPlayerName($playerId),
                'points' => $points,
                'coalition' => $coalition,
            ]);

            if ($playerId > 0) {
                self::setStat($coalition->size, 'coalition_size', $playerId);
            }
        }

        // pearl master
        $pearlMaster = intval(self::getGameStateValue('pearlMasterPlayer'));

        $playersPoints[$pearlMaster] += 5;
        if ($pearlMaster > 0) {
            self::DbQuery("UPDATE player SET player_score = player_score + 5 WHERE player_id = $pearlMaster");
        } else if ($pearlMaster === 0) {
            $this->incOpponentScore(5);
            $this->setOpponentScoreCoalition(5);
        }

        self::notifyAllPlayers('scorePearlMaster', clienttranslate('${player_name} is the Pearl Master and wins 5 points'), [
            'playerId' => $pearlMaster,
            'player_name' => $this->getPlayerName($pearlMaster),
        ]);

        foreach ($players as $playerId => $playerDb) { // dont set stat to solo player
            self::setStat(intval($playerDb['pearls']), 'pearls', $playerId);
            self::setStat($playerId == $pearlMaster ? 1 : 0, 'pearl_master', $playerId);
        }

        // total
        foreach ($playersWithSolo as $playerId => $playerDb) {
            $points = $playersPoints[$playerId];

            self::notifyAllPlayers('scoreTotal', clienttranslate('${player_name} has ${points} points in total'), [
                'playerId' => $playerId,
                'player_name' => $this->getPlayerName($playerId),
                'points' => $points,
            ]);

            if ($playerId > 0) {
                self::setStat($points, 'total_points', $playerId);
            }
        }

        if ($solo) {
            $playerId = array_keys($players)[0];

            $soloScore = null;
            if ($playersPoints[$playerId] == $playersPoints[0]) {
                $soloScore = $playerId == $pearlMaster ? 1 : 0;
            } else {
                $soloScore = $playersPoints[$playerId] > $playersPoints[0] ? 1 : 0;
            }
            
            self::DbQuery("UPDATE player SET player_score = $soloScore WHERE player_id = $playerId");
        }

        $this->gamestate->nextState('endGame');
    }
}
