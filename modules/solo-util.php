<?php

trait SoloUtilTrait {

    //////////////////////////////////////////////////////////////////////////////
    //////////// Utility functions
    ////////////

    function isSoloMode() {
        return count($this->loadPlayersBasicInfos()) == 1;
    }

    function isOpponentTurn() {
        return boolval(self::getGameStateValue('SOLO_OPPONENT'));
    }

    function toggleOpponentTurn() {
        return self::setGameStateValue('SOLO_OPPONENT', $this->isOpponentTurn() ? 0 : 1);
    }

    function getPlayerIdToPlaceCard() {
        return $this->isOpponentTurn() ? 0 : intval($this->getActivePlayerId());
    }

    function initOpponent(array $affectedMats) {
        $player_mat = bga_rand(1, 10);
        while (array_search($player_mat, $affectedMats) !== false) {
            $player_mat = bga_rand(1, 10);
        }
        $option = intval(self::getGameStateValue('SOLO_OPPONENT'));

        $opponent = new stdClass();
        $opponent->id = 0;
        $opponent->score = 0;
        $opponent->pearls = 0;
        $opponent->lords = 0;
        $opponent->locations = 0;
        $opponent->coalition = 0;
        $opponent->mat = $player_mat;
        $opponent->lord = $option > 0 ? $option : bga_rand(1, 5);
        $opponent->name = _('Legendary opponent');

        return $this->setOpponent($opponent);
    }

    function setOpponent(object $opponent) {
        $jsonObj = json_encode($opponent);
        self::DbQuery("INSERT INTO `global_variables`(`name`, `value`)  VALUES ('OPPONENT', '$jsonObj') ON DUPLICATE KEY UPDATE `value` = '$jsonObj'");
    }

    function getOpponent() {
        $json_obj = self::getUniqueValueFromDB("SELECT `value` FROM `global_variables` where `name` = 'OPPONENT'");
        if ($json_obj) {
            $opponent = json_decode($json_obj);
            return $opponent;
        } else {
            return null;
        }
    }

    function setOpponentScore(int $score) {
        $opponent = $this->getOpponent();

        $opponent->score = $score;

        $this->setOpponent($opponent);
    }

    function incOpponentScore(int $incScore) {
        $opponent = $this->getOpponent();

        $opponent->score += $incScore;

        $this->setOpponent($opponent);
    }

    function incOpponentPearls(int $incPearls) {
        $opponent = $this->getOpponent();

        $opponent->pearls += $incPearls;

        $this->setOpponent($opponent);
    }

    function getOpponentScore() {
        $opponent = $this->getOpponent();

        return $opponent->score;
    }

    function getOpponentPearls() {
        $opponent = $this->getOpponent();

        return $opponent->pearls;
    }

    function getOpponentLord() {
        $opponent = $this->getOpponent();

        return $opponent->lord;
    }

    function setOpponentScoreLords(int $score) {
        $opponent = $this->getOpponent();

        $opponent->lords = $score;

        $this->setOpponent($opponent);
    }

    function setOpponentScoreLocations(int $score) {
        $opponent = $this->getOpponent();

        $opponent->locations = $score;

        $this->setOpponent($opponent);
    }

    function setOpponentScoreCoalition(int $score) {
        $opponent = $this->getOpponent();

        $opponent->coalition = $score;

        $this->setOpponent($opponent);
    }

    function getLordDeckPiles(bool $canRedirect) {
        $visibleLords = [];
        for ($guild=1; $guild<=5; $guild++) {
            $visibleLords[$guild] = $this->getLordsFromDb($this->lords->getCardsInLocation('table', $guild));
        }

        $lordConditions = $this->SOLO_LORD_CONDITIONS[$this->getOpponentLord()];

        foreach($lordConditions as $condition) {
            $piles = $this->pilesMatchingCondition($visibleLords, $condition);
            if (count($piles) > 0) {
                return $piles;
            }
        }

        if ($canRedirect) {
            $this->revealExtraLord();

            $this->gamestate->nextState('soloCardAdded');
        }
        return [];
    }

    function pilesMatchingCondition(array $visibleLords, int $condition) {
        $piles = [];
        for ($guild=1; $guild<=5; $guild++) {
            $piles[$guild] = $this->pileMatchingCondition($visibleLords[$guild], $condition);
        }

        $max = max($piles);

        if ($max == 0) {
            return [];
        } else {
            return array_keys(array_filter($piles, function ($pile) use ($max) { return $pile == $max; }));
        }
    }

    function pileMatchingCondition(array $visibleLords, int $condition) {        
        switch ($condition) {
            case SOLO_CONDITION_SEVERAL_LORDS: 
                $countLords = count($visibleLords);
                return $countLords >= 3 ? $countLords : 0;
            case SOLO_CONDITION_KEY:
                $countKeys = count(array_filter($visibleLords, function($lord) { return $lord->key > 0; }));
                return $countKeys;
            case SOLO_CONDITION_EXTEND_COALITION: 
                $newCoalitionSize = $this->getNewCoalitionSizeForOpponent($visibleLords);
                return $newCoalitionSize;
            case SOLO_CONDITION_PEARL:
                $countPearls = count(array_filter($visibleLords, function($lord) { return $lord->pearls > 0; }));
                return $countPearls;
            case SOLO_CONDITION_MILITARY:
                $countMilitary = count(array_filter($visibleLords, function($lord) { return $lord->location_arg  == 2; }));
                return $countMilitary;
            case SOLO_CONDITION_MAX_LORD:
                $countMaxLord = count(array_filter($visibleLords, function($lord) { return $lord->points  == 6; }));
                return $countMaxLord;
        }
        return 0;
    }

    function pickOpponentLocation() {
        $visibleLocations = $this->getLocationsFromDb($this->locations->getCardsInLocation('table'));
        if (count($visibleLocations) > 0) {
            $location = $visibleLocations[bga_rand(0, count($visibleLocations)-1)];
            $this->chooseVisibleLocation($location->id, true);
        } else {
            $this->chooseLocationDeckStack(1, true);
        }
    }

    function getSoloLordPoints() {
        $lord = $this->getOpponentLord();

        switch ($lord) {
            case 2: 
                $lords = $this->getLordsFromDb($this->lords->getCardsInLocation("player0"));
                $countMilitary = count(array_values(array_filter($lords, function($lord) { return $lord->guild == 2; })));
                return 1 + 2 * $countMilitary;
            case 3:
                return floor($this->getOpponentPearls() / 2);
            case 4:
                return $this->getTopLordPoints(0, 0);
            case 5:
                $locations = $this->getLocationsFromDb($this->locations->getCardsInLocation("player0"));
                return count($locations);
        }

        return 0;
    }

    function getSpotsInAreaForSpot(int $spot, array $cardsColors, array $spotAlreadyVisited) {
        $neighbours = array_values(array_filter($this->NEIGHBOURS[$spot], function ($neighbour) use ($spotAlreadyVisited) { return !in_array($neighbour, $spotAlreadyVisited); }));

        $biggest = [$spot];

        foreach($neighbours as $neighbour) {
            if (array_key_exists($neighbour, $cardsColors) && $cardsColors[$spot] == $cardsColors[$neighbour]) {
                $area = array_merge(
                    [$spot],
                    $this->getSpotsInAreaForSpot($neighbour, $cardsColors, array_merge($spotAlreadyVisited, [$spot]))
                );

                if (count($area) > count($biggest)) {
                    $biggest = $area;
                }
            }
        }

        return $biggest;
    }

    function createdNewColorArea(int $playerId, int $spot) {
        $cardsColors = [];

        $lords = $this->getLordsFromDb($this->lords->getCardsInLocation("player$playerId"));
        foreach($lords as $lord) {
            $cardsColors[$lord->location_arg] = $lord->guild;
        }

        $spotsNewArea = $this->getSpotsInAreaForSpot($spot, $cardsColors, []);
        if (count($spotsNewArea) >= 3) {
            foreach ($spotsNewArea as $spotNewArea) {
                // if card on the new area was already part of a >=3 color area, it extends but doesn't create a new
                if ($spotNewArea != $spot && count($this->getSpotsInAreaForSpot($spotNewArea, $cardsColors, [$spot])) >= 3) {
                    return false;
                }
            }

            return true;
        }

        return false;
    }

    function getNewCoalitionSizeForOpponent(array $visibleLords) {
        if (count($visibleLords) == 0) {
            return 0;
        }

        $spot = $this->lords->countCardInLocation("player0") + 1;
        $cardsColors = [
            $spot => $visibleLords[0]->guild
        ];

        $lords = $this->getLordsFromDb($this->lords->getCardsInLocation("player0"));
        foreach($lords as $lord) {
            $cardsColors[$lord->location_arg] = $lord->guild;
        }

        $spotsNewArea = $this->getSpotsInAreaForSpot($spot, $cardsColors, []);
        $count = count($spotsNewArea);
        if ($count >= 3) {
            return $count + count($visibleLords) - 1;
        } else {
            return 0;
        }
    }

}
