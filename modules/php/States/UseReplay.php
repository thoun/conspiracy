<?php

declare(strict_types=1);

namespace Bga\Games\Conspiracy\States;

use Bga\GameFramework\StateType;
use Bga\GameFramework\States\GameState;
use Bga\GameFramework\States\PossibleAction;
use Bga\Games\Conspiracy\Game;

class UseReplay extends GameState {

    public function __construct(protected Game $game) {
        parent::__construct($game,
            id: \ST_USE_REPLAY,
            type: StateType::ACTIVE_PLAYER,
            name: 'useReplay',
            description: '',
            descriptionMyTurn: clienttranslate('${you} can use Replay token'),
        );
    }

    #[PossibleAction]
    public function actUseReplayToken(int $use): string {
        $this->game->setGameStateValue('usePlayAgain', $use);
        return NextPlayer::class;
    }

    public function zombie(int $playerId): string {
        return $this->actUseReplayToken(1);
    }
}
