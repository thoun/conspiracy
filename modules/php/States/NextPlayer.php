<?php

declare(strict_types=1);

namespace Bga\Games\Conspiracy\States;

use Bga\GameFramework\NotificationMessage;
use Bga\GameFramework\StateType;
use Bga\GameFramework\States\GameState;
use Bga\Games\Conspiracy\Game;

class NextPlayer extends GameState {

    public function __construct(protected Game $game) {
        parent::__construct($game,
            id: \ST_NEXT_PLAYER,
            type: StateType::GAME,
            name: 'nextPlayer',
            updateGameProgression: true,
        );
    }

    public function onEnteringState(): int|string {
        $activePlayerId = (int) $this->game->getActivePlayerId();
        $playerId = $this->game->getPlayerIdToPlaceCard();

        $solo = $this->game->isSoloMode();
        $opponentTurn = $solo && $this->game->isOpponentTurn();
        if (intval($this->game->getGameStateValue('playAgainPlayer')) == $activePlayerId && !$opponentTurn && intval($this->game->getGameStateValue('usePlayAgain')) == 0) {

            if ($this->game->lords->countCardInLocation("player{$activePlayerId}") < 15) {
                return UseReplay::class;
            }
        }

        $this->game->bga->tableStats->inc('turns_number', 1);
        if ($playerId > 0) {
            $this->game->bga->playerStats->inc('turns_number', 1, $playerId);
        }

        if (intval($this->game->getGameStateValue('forceFirstByMilitary')) == 1 && !$opponentTurn) {
            $this->game->setGameStateValue('forceFirstByMilitary', 0);
        }

        if ($this->game->getGameStateValue('endTurn') == 0) {
            $playedLords = $this->game->lords->countCardInLocation("player$playerId");

            if ($playedLords == SPOT_NUMBER) {
                $this->game->setGameStateValue('endTurn', $playerId == 0 ? -1 : $playerId);

                $this->game->bga->notify->all('lastTurn', new NotificationMessage(clienttranslate('${player_name} has completed the pyramid, starting last turn !'), [
                    'playerId' => $playerId,
                    'player_name' => $this->game->getPlayerName($playerId),
                ]));
            }
        }

        $activePlayerId = (int) $this->game->activeNextPlayer();
        $this->game->giveExtraTime($activePlayerId);

        if ($solo) {
            if (intval($this->game->getGameStateValue('usePlayAgain')) == 1) {
                $this->game->setGameStateValue('playAgainPlayer', 0);

                $this->game->bga->notify->all('newPlayAgainPlayer', new NotificationMessage(clienttranslate('${player_name} gets the Replay token'), [
                    'playerId' => 0,
                    'player_name' => $this->game->getPlayerName(0),
                ]));
            } else {
                $this->toggleOpponentTurn();
            }
            $this->game->setGameStateValue('usePlayAgain', 0);
        }

        $endTurn = $this->game->getGameStateValue('endTurn');
        $showScore = ($endTurn > 0 && $endTurn == $activePlayerId && !$opponentTurn) || ($endTurn == -1 && $this->game->getPlayerIdToPlaceCard() == 0);
        if ($showScore) {
            return ShowScore::class;
        } else {
            // if we come back to card player, we erase constraint
            if ($this->game->getGameStateValue('AP_FIRST_LORD') == $activePlayerId) {
                $this->game->setGameStateValue('AP_FIRST_LORD', 0);
            }
            if ($this->game->getGameStateValue('AP_FIRST_LORDS') == $activePlayerId) {
                $this->game->setGameStateValue('AP_FIRST_LORDS', 0);
            }

            return LordStackSelection::class;
        }
    }

    private function toggleOpponentTurn() {
        $this->game->bga->globals->set('opponentTurn', !$this->game->isOpponentTurn());
    }
}
