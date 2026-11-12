<?php

declare(strict_types=1);

namespace Bga\Games\Conspiracy\States;

use Bga\GameFramework\StateType;
use Bga\GameFramework\States\GameState;
use Bga\GameFramework\States\PossibleAction;
use Bga\Games\Conspiracy\Game;

class LordPick extends GameState {

    public function __construct(protected Game $game) {
        parent::__construct($game,
            id: \ST_PLAYER_LORD_PICK,
            type: StateType::ACTIVE_PLAYER,
            name: 'lordPick',
            description: clienttranslate('${actplayer} must choose the lord to recruit'),
            descriptionMyTurn: clienttranslate('${you} must choose the lord to recruit'),
        );
    }

    #[PossibleAction]
    public function actPickLord(int $id): string {
        $this->game->pickLord($id);

        return LordPlacement::class;
    }

    public function zombie(int $playerId): string {
        $choices = $this->game->getLordsFromDb($this->game->lords->getCardsInLocation('lord_selection'));
        if ($choices !== []) {
            $lord = $this->getRandomZombieChoice(array_values($choices));
            return $this->actPickLord($lord->id);
        }

        $this->game->discardPendingSelections();
        return NextPlayer::class;
    }
}
