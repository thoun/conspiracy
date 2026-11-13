<?php

declare(strict_types=1);

namespace Bga\Games\Conspiracy\States;

use Bga\GameFramework\NotificationMessage;
use Bga\GameFramework\StateType;
use Bga\GameFramework\States\GameState;
use Bga\Games\Conspiracy\Game;

class ShowScore extends GameState {

    public function __construct(protected Game $game) {
        parent::__construct($game,
            id: \ST_SHOW_SCORE,
            type: StateType::GAME,
            name: 'showScore',
        );
    }

    public function onEnteringState(): int {
        $sql = "SELECT player_id id, player_name, player_score_aux pearls FROM player ORDER BY player_no ASC";
        $players = $this->game->getCollectionFromDb($sql);
        $solo = $this->game->isSoloMode();

        // we reinit points as we gave points for lords & locations
        $this->game->bga->playerScore->setAll(0);
        if ($solo) {
            $this->game->setOpponentScore(0);
        }

        $playersPoints = [];

        $playersWithSolo = $solo ? $players + [ 0 => []] : $players;

        // lords
        foreach ($playersWithSolo as $playerId => $playerDb) {
            $points = $this->game->getScoreLords($playerId);

            $playersPoints[$playerId] = $points;
            if ($playerId > 0) {
                $this->game->bga->playerScore->inc($playerId, $points);
                $this->game->DbQuery("UPDATE player SET player_score_lords = $points WHERE player_id = $playerId");
            } else {
                $this->game->incOpponentScore($points);
                $this->setOpponentScoreLords($points);
            }

            $this->game->bga->notify->all('scoreLords', new NotificationMessage(clienttranslate('${player_name} wins ${points} points with lords'), [
                'playerId' => $playerId,
                'player_name' => $this->game->getPlayerName($playerId),
                'points' => $points,
            ]));

            if ($playerId > 0) {
                $this->game->bga->playerStats->set('lords_points', $points, $playerId);
            }
        }

        // locations
        foreach ($playersWithSolo as $playerId => $playerDb) {
            $points = $this->game->getScoreLocations($playerId, $playerId == 0 ? $this->game->getOpponentPearls() : intval($playerDb['pearls']));

            $playersPoints[$playerId] += $points;
            if ($playerId > 0) {
                $this->game->bga->playerScore->inc($playerId, $points);
                $this->game->DbQuery("UPDATE player SET player_score_locations = $points WHERE player_id = $playerId");
            } else {
                $this->game->incOpponentScore($points);
                $this->setOpponentScoreLocations($points);
            }

            $this->game->bga->notify->all('scoreLocations', new NotificationMessage(clienttranslate('${player_name} wins ${points} points with locations'), [
                'playerId' => $playerId,
                'player_name' => $this->game->getPlayerName($playerId),
                'points' => $points,
            ]));

            if ($playerId > 0) {
                $this->game->bga->playerStats->set('locations_points', $points, $playerId);
            }
        }

        // coalition
        foreach ($playersWithSolo as $playerId => $playerDb) {
            $coalition = $this->game->getScoreTopCoalition($playerId);
            $points = $coalition->size * 3;

            $playersPoints[$playerId] += $points;
            if ($playerId > 0) {
                $this->game->bga->playerScore->inc($playerId, $points);
                $this->game->DbQuery("UPDATE player SET player_score_coalition = $points WHERE player_id = $playerId");
            } else {
                $this->game->incOpponentScore($points);
                $this->setOpponentScoreCoalition($points);
            }

            $this->game->bga->notify->all('scoreCoalition', new NotificationMessage(clienttranslate('${player_name} wins ${points} points with greatest Lords Coalition'), [
                'playerId' => $playerId,
                'player_name' => $this->game->getPlayerName($playerId),
                'points' => $points,
                'coalition' => $coalition,
            ]));

            if ($playerId > 0) {
                $this->game->bga->playerStats->set('coalition_size', $coalition->size, $playerId);
            }
        }

        // pearl master
        $pearlMaster = intval($this->game->getGameStateValue('pearlMasterPlayer'));

        $playersPoints[$pearlMaster] += 5;
        if ($pearlMaster > 0) {
            $this->game->bga->playerScore->inc($pearlMaster, 5);
        } else if ($pearlMaster === 0) {
            $this->game->incOpponentScore(5);
            $this->setOpponentScoreCoalition(5);
        }

        $this->game->bga->notify->all('scorePearlMaster', new NotificationMessage(clienttranslate('${player_name} is the Pearl Master and wins 5 points'), [
            'playerId' => $pearlMaster,
            'player_name' => $this->game->getPlayerName($pearlMaster),
        ]));

        foreach ($players as $playerId => $playerDb) { // dont set stat to solo player
            $this->game->bga->playerStats->set('pearls', intval($playerDb['pearls']), $playerId);
            $this->game->bga->playerStats->set('pearl_master', $playerId == $pearlMaster ? 1 : 0, $playerId);
        }

        // total
        foreach ($playersWithSolo as $playerId => $playerDb) {
            $points = $playersPoints[$playerId];

            $this->game->bga->notify->all('scoreTotal', new NotificationMessage(clienttranslate('${player_name} has ${points} points in total'), [
                'playerId' => $playerId,
                'player_name' => $this->game->getPlayerName($playerId),
                'points' => $points,
            ]));

            if ($playerId > 0) {
                $this->game->bga->playerStats->set('total_points', $points, $playerId);
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

            $this->game->bga->playerScore->set($playerId, $soloScore, null);
        }

        return \ST_END_GAME;
    }

    private function setOpponentScoreLords(int $score) {
        $opponent = $this->game->getOpponent();

        $opponent->lords = $score;

        $this->game->setOpponent($opponent);
    }

    private function setOpponentScoreLocations(int $score) {
        $opponent = $this->game->getOpponent();

        $opponent->locations = $score;

        $this->game->setOpponent($opponent);
    }

    private function setOpponentScoreCoalition(int $score) {
        $opponent = $this->game->getOpponent();

        $opponent->coalition = $score;

        $this->game->setOpponent($opponent);
    }
}
