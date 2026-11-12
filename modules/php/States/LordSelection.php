<?php

declare(strict_types=1);

namespace Bga\Games\Conspiracy\States;

use Bga\GameFramework\StateType;
use Bga\GameFramework\States\GameState;
use Bga\GameFramework\States\PossibleAction;
use Bga\Games\Conspiracy\Game;

class LordSelection extends GameState {

    public function __construct(protected Game $game) {
        parent::__construct($game,
            id: \ST_PLAYER_LORD_SELECTION,
            type: StateType::ACTIVE_PLAYER,
            name: 'lordSelection',
            description: clienttranslate('${actplayer} must choose the lord to recruit'),
            descriptionMyTurn: clienttranslate('${you} must choose the lord to recruit'),
        );
    }

    public function getArgs(): array {
        $lords = $this->game->getLordsFromDb($this->game->lords->getCardsInLocation('lord_selection'));
        return [
            'lords' => $lords,
            'multiple' => $this->game->getGameStateValue('stackSelection') != 1,
            'remainingLords' => $this->game->getRemainingLords(),
            'opponentTurn' => ($this->game->isSoloMode() && $this->game->isOpponentTurn()),
        ];
    }

    #[PossibleAction]
    public function actPickLord(int $id): string {
        $this->game->pickLord($id);
        return LordPlacement::class;
    }

    public function zombie(int $playerId, array $args): string {
        $choices = array_values($args['lords']);
        if ($choices !== []) {
            $lord = $this->getRandomZombieChoice($choices);
            return $this->actPickLord($lord->id);
        }

        $this->game->discardPendingSelections();
        return NextPlayer::class;
    }
}
