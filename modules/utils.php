<?php

/*require_once(__DIR__.'/objects/effect.php');
require_once(__DIR__.'/objects/adventurer.php');
require_once(__DIR__.'/objects/companion.php');
require_once(__DIR__.'/objects/spell.php');
require_once(__DIR__.'/objects/solo-tile.php');
require_once(__DIR__.'/objects/dice.php');
require_once(__DIR__.'/objects/meeple.php');
require_once(__DIR__.'/objects/meeting-track-spot.php');*/

trait UtilTrait {

    //////////////////////////////////////////////////////////////////////////////
    //////////// Utility functions
    ////////////

    function bonusLocations() {        
        return intval(self::getGameStateValue('BONUS_LOCATIONS')) === 2;
    }

    function mustTakeFirstLord() {
        return self::getGameStateValue('AP_FIRST_LORD') > 0;
    }

    function mustTakeFirstLords() {
        return self::getGameStateValue('AP_FIRST_LORDS') > 0;
    }

    function getRemainingLords() {
        return $this->lords->countCardInLocation('deck');
    }

    function getRemainingLocations() {
        return $this->locations->countCardInLocation('deck');
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

    function canConstructWithNewKey(int $playerId): bool {
        $lords = $this->getLordsFromDb($this->lords->getCardsInLocation("player$playerId"));
        $locations = $this->getLocationsFromDb($this->locations->getCardsInLocation("player$playerId"));
        $locationsSpots = array_map(function($location) { return $location->location_arg; }, $locations);
        $lastLocationSpot = count($locationsSpots) > 0 ? max($locationsSpots) : 0;
        $hasActivePowerKeys = $playerId == 0 ?
            $this->getOpponentLord() == 5 :
            count(array_values(array_filter($locations, function ($location) { return $location->activePower === AP_KEYS; }))) > 0;

        if ($hasActivePowerKeys) {
            $keys = count(array_filter($lords, function($lord) use ($lastLocationSpot) { return $lord->location_arg > $lastLocationSpot && $lord->key >= 1; }));
            
            return $keys >= 2;
        } else {
            $silverKeys = count(array_filter($lords, function($lord) use ($lastLocationSpot) { return $lord->location_arg > $lastLocationSpot && $lord->key === 1; }));
            $goldKeys = count(array_filter($lords, function($lord) use ($lastLocationSpot) { return $lord->location_arg > $lastLocationSpot && $lord->key === 2; }));

            return $silverKeys >= 2 || $goldKeys >= 2;
        }
    }

    function canConstruct(int $playerId): bool {
        $canConstruct = $this->canConstructWithNewKey($playerId);

        if ($canConstruct && self::getGameStateValue('AP_DECK_LOCATION') == $playerId) {
            $canConstruct = $this->getRemainingLocations() > 0;
        }

        return $canConstruct;
    }

    function addExtraLord() {
        $lord = $this->getLordFromDb($this->lords->pickCardForLocation( 'deck', 'table'));
        $this->lords->moveCard($lord->id,'table', $lord->guild);
        return $lord;
    }

    function revealExtraLord() {
        $extraLord = $this->addExtraLord();

        self::notifyAllPlayers('extraLordRevealed', clienttranslate('A ${guild_name} lord is added in the discard pile'), [
            'lord' => $extraLord,
            'guild' => $extraLord->guild,
            'guild_name' => $this->getGuildName($extraLord->guild),
            'i18n' => ['guild_name'],
            'remainingLords' => $this->getRemainingLords(),
        ]);
    }

    function checkPearlMaster(int $player_id) {        

        // check Master pearls
        $pearlMasterPlayer = self::getGameStateValue('pearlMasterPlayer');
        if ($pearlMasterPlayer !== $player_id) {
            $masterPearlPearls = $this->isSoloMode() && $pearlMasterPlayer == 0 ? $this->getOpponentPearls() : intval(self::getUniqueValueFromDB( "SELECT player_score_aux FROM `player` WHERE player_id = $pearlMasterPlayer"));
            $currentPlayerPearls = $player_id == 0 ? $this->getOpponentPearls() : intval(self::getUniqueValueFromDB( "SELECT player_score_aux FROM `player` WHERE player_id = $player_id"));
            
            if ($currentPlayerPearls >= $masterPearlPearls && $pearlMasterPlayer != $player_id) {
                self::setGameStateValue('pearlMasterPlayer', $player_id);
                self::notifyAllPlayers('newPearlMaster', clienttranslate('${player_name} becomes the new Pearl Master'), [
                    'playerId' => $player_id,
                    'player_name' => $this->getPlayerName($player_id),
                    'previousPlayerId' => $pearlMasterPlayer,
                ]);

                if ($player_id > 0) {
                    self::DbQuery("UPDATE player SET player_score = player_score + 5 WHERE player_id = $player_id");
                } else {
                    if ($this->isSoloMode()) {
                        $this->incOpponentScore(5);
                    }
                }
                if ($pearlMasterPlayer > -1) {
                    if ($pearlMasterPlayer > 0) {
                        self::DbQuery("UPDATE player SET player_score = player_score - 5 WHERE player_id = $pearlMasterPlayer");
                    } else {
                        if ($this->isSoloMode()) {
                            $this->incOpponentScore(-5);
                        }
                    }
                }
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
        $guildLords = $guild === 0 ? $lords : array_values(array_filter($lords, function($lord) use ($guild) { return $lord->guild == $guild; }));
        $guildLordsPoints = array_map(function ($lord) { return $lord->points; }, $guildLords);

        if (count($guildLordsPoints) > 0) {
            return max($guildLordsPoints);
        } else {
            return 0;
        }
    }

    function canSwap(int $player_id): bool {
        if ($player_id == 0) {
            return false;
        }

        $lords = $this->getLordsFromDb($this->lords->getCardsInLocation("player$player_id"));
        $swappableLords = array_values(array_filter($lords, function($lord) { return !$lord->key; }));

        return count($swappableLords) >= 2;
    }

    function getScoreLords(int $playerId): int {
        $points = 0;

        for ($guild=1; $guild<=5; $guild++) {
            $points += $this->getTopLordPoints($playerId, $guild);
        }

        if ($playerId == 0) {
            $points += $this->getSoloLordPoints();
        }

        return $points;
    }

    function getScoreLocations(int $player_id, int $pearls): int { 
        $points = 0;

        $locations = $this->getLocationsFromDb($this->locations->getCardsInLocation("player$player_id"));

        if ($player_id == 0) {
            return count($locations) * 5;
        }

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

            if ($location->passivePower == PP_LORD_1POINT_COALITION) {
                $coalition = $this->getScoreTopPointCoalition($player_id, 1);
                $points += $coalition ? $coalition->size : 0;
            }

            if ($location->passivePower == PP_LORD_2POINT_COALITION) {
                $coalition = $this->getScoreTopPointCoalition($player_id, 2);
                $points += $coalition ? $coalition->size * 2 : 0;
            }

            if ($location->passivePower == PP_LORD_3POINT_COALITION) {
                $coalition = $this->getScoreTopPointCoalition($player_id, 3);
                $points += $coalition ? $coalition->size * 2 : 0;
            }

            if ($location->passivePower == PP_LORD_4POINT_COALITION) {
                $coalition = $this->getScoreTopPointCoalition($player_id, 4);
                $points += $coalition ? $coalition->size * 2 : 0;
            }

            if ($location->passivePower == PP_LORD_NO_KEY_NO_PEARL) {
                $points += count(array_values(array_filter($lords, function($lord)  { return $lord->points == 0 || $lord->points == 6; })));
            }
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
            $this->getCoalitionSize($player_id, $coalition, $filteredNeigbour);
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

    function getPointCoalitionSize(int $player_id, $coalition, int $currentSpot) {
        // we check we don't count twice the same spot
        if (array_search($currentSpot, $coalition->alreadyCounted) !== false) {
            return;
        }

        $coalition->size++;
        $coalition->alreadyCounted = array_merge($coalition->alreadyCounted, [$currentSpot]);

        // we only take lords having same guild
        $filteredNeigbours = array_filter($this->NEIGHBOURS[$currentSpot], function($neighbour) use ($player_id, $coalition) {
            $lord = $this->getLordInSpot($player_id, $neighbour);
            return !!$lord && $coalition->points === $lord->points;
        });

        foreach ($filteredNeigbours as $filteredNeigbour) {
            $this->getPointCoalitionSize($player_id, $coalition, $filteredNeigbour);
        }
    }

    function getScoreTopPointCoalition(int $player_id, int $points) {
        $topCoalition = null;

        for ($spot = 1; $spot <= SPOT_NUMBER; $spot++) {
            $lordInSpot = $this->getLordInSpot($player_id, $spot);

            if ($lordInSpot && $lordInSpot->points == $points) {
                $coalition = new stdClass();
                $coalition->spot = $spot;
                $coalition->size = 0;
                $coalition->points = $points;
                $coalition->alreadyCounted = [];
                $this->getPointCoalitionSize($player_id, $coalition, $spot);
                
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
            case 1: $guildName = _('Farmer'); break;
            case 2: $guildName = _('Military'); break;
            case 3: $guildName = _('Merchant'); break;
            case 4: $guildName = _('Politician'); break;
            case 5: $guildName = _('Mage'); break;
        }
        return $guildName;
    }

    function getPlayerScore($player_id) {
        $score = new Score();

        // lords 
        $score->lords = $this->getScoreLords($player_id);
        // locations
        $currentPlayerPearls = $player_id == 0 ? $this->getOpponentPearls() : intval(self::getUniqueValueFromDB( "SELECT player_score_aux FROM `player` WHERE player_id = $player_id"));
        $score->locations = $this->getScoreLocations($player_id, $currentPlayerPearls);
        // coalition
        $coalition = $this->getScoreTopCoalition($player_id);
        $score->coalition = $coalition ? $coalition->size * 3 : 0;
        // pearl master
        $score->pearlMaster = intval(self::getGameStateValue('pearlMasterPlayer')) == $player_id ? 5 : 0;

        // compute total score
        $score->getTotal();

        return $score;
    }

    function getAndSavePlayerScore($playerId) {
        $score = $this->getPlayerScore($playerId);

        $points = $score->getTotal();
        if ($playerId == 0) {
            $this->setOpponentScore($points);
        } else {
            self::DbQuery("UPDATE player SET player_score = $points WHERE player_id = $playerId");
        }

        return $score;
    }

    function incPearls(int $playerId, int $incPearls) {
        if ($playerId == 0) {
            $this->incOpponentPearls($incPearls);
        } else {
            self::DbQuery("UPDATE player SET player_score_aux = player_score_aux + $incPearls WHERE player_id = $playerId");
        }
    }

    function getPlayerName(int $playerId) {
        if ($playerId == 0) {
            return self::_('Legendary opponent');
        } else {
            return self::getUniqueValueFromDb("SELECT player_name FROM player WHERE player_id = $playerId");
        }
    }
}
