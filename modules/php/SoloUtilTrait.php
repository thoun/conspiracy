<?php

declare(strict_types=1);

namespace Bga\Games\Conspiracy;

use Bga\GameFramework\NotificationMessage;

trait SoloUtilTrait {

    //////////////////////////////////////////////////////////////////////////////
    //////////// Utility functions
    ////////////

    function isSoloMode() {
        return count($this->loadPlayersBasicInfos()) == 1;
    }

    function isOpponentTurn(): bool {
        // Old tables stored the mutable turn flag in the same slot as option 102.
        return $this->bga->globals->get('opponentTurn')
            ?? boolval($this->getGameStateValue('legacyOpponentTurn'));
    }

    function getPlayerIdToPlaceCard(?int $activePlayerId = null) {
        return $this->isOpponentTurn() ? 0 : ($activePlayerId ?? intval($this->getActivePlayerId()));
    }

    function initOpponent(array $affectedMats) {
        $player_mat = bga_rand(1, 10);
        while (array_search($player_mat, $affectedMats) !== false) {
            $player_mat = bga_rand(1, 10);
        }
        $option = $this->getSoloOpponentOption();

        $opponent = new \stdClass();
        $opponent->id = 0;
        $opponent->score = 0;
        $opponent->pearls = 0;
        $opponent->lords = 0;
        $opponent->locations = 0;
        $opponent->coalition = 0;
        $opponent->mat = $player_mat;
        $opponent->lord = $option > 0 ? $option : bga_rand(1, 5);
        $opponent->name = clienttranslate('Legendary opponent');

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
        $neighbours = array_values(array_filter($this->NEIGHBOURS[$spot], fn ($neighbour) => !in_array($neighbour, $spotAlreadyVisited) && array_key_exists($neighbour, $cardsColors) && $cardsColors[$spot] == $cardsColors[$neighbour]));
        $area = [$spot];

        foreach($neighbours as $neighbour) {
            if (array_key_exists($neighbour, $cardsColors)) {
                $area = array_merge(
                    $area,
                    $this->getSpotsInAreaForSpot($neighbour, $cardsColors, array_merge($spotAlreadyVisited, [$spot]))
                );
            }
        }

        return $area;
    }

}
