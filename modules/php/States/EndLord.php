<?php

declare(strict_types=1);

namespace Bga\Games\Conspiracy\States;

use Bga\GameFramework\StateType;
use Bga\GameFramework\States\GameState;
use Bga\Games\Conspiracy\Game;

class EndLord extends GameState {

    public function __construct(protected Game $game) {
        parent::__construct($game,
            id: \ST_END_LORD,
            type: StateType::GAME,
            name: 'endLord',
            updateGameProgression: true,
        );
    }

    public function onEnteringState(): int|string {

        if ($this->game->lords->countCardInLocation('lord_selection') > 0) {
            $playerId = $this->game->getPlayerIdToPlaceCard();
            $playedLords = $this->game->lords->countCardInLocation("player$playerId");

            if ($playedLords < SPOT_NUMBER) {
                $this->game->giveExtraTime((int) $this->game->getActivePlayerId());
                return LordSelection::class;
            } else {
                $this->game->placeRemainingLordSelectionToTable(true);
                return NextPlayer::class;
            }
        } else {
            return NextPlayer::class;
        }
    }
}
