<?php

declare(strict_types=1);

namespace Bga\Games\Conspiracy\States;

use Bga\GameFramework\StateType;
use Bga\GameFramework\States\GameState;
use Bga\GameFramework\States\PossibleAction;
use Bga\Games\Conspiracy\Game;
use Bga\GameFramework\Actions\Types\IntArrayParam;
use Bga\GameFramework\NotificationMessage;

class LordSwap extends GameState {

    public function __construct(protected Game $game) {
        parent::__construct($game,
            id: \ST_PLAYER_LORDS_SWAP,
            type: StateType::ACTIVE_PLAYER,
            name: 'lordSwap',
            description: clienttranslate('${actplayer} must select two lords to swap'),
            descriptionMyTurn: clienttranslate('${you} must select two lords to swap'),
        );
    }

    #[PossibleAction]
    public function actSwap(#[IntArrayParam] array $spots, int $activePlayerId): string {
        $spot1 = $spots[0];
        $spot2 = $spots[1];

        $cardSpot1 = $this->game->getLordsFromDb($this->game->lords->getCardsInLocation("player$activePlayerId", $spot1))[0];
        $cardSpot2 = $this->game->getLordsFromDb($this->game->lords->getCardsInLocation("player$activePlayerId", $spot2))[0];

        $this->game->lords->moveCard($cardSpot1->id, "player$activePlayerId", $spot2);
        $this->game->lords->moveCard($cardSpot2->id, "player$activePlayerId", $spot1);

        $newScore = $this->game->getAndSavePlayerScore($activePlayerId);

        $this->game->bga->notify->all('lordSwapped', new NotificationMessage(clienttranslate('${player_name} swaps two lords'), [
            'playerId' => $activePlayerId,
            'player_name' => $this->game->getPlayerNameById($activePlayerId),
            'spot1' => $spot1,
            'spot2' => $spot2,
            'newScore' => $newScore,
        ]));

        return EndLord::class;
    }

    #[PossibleAction]
    public function actDontSwap(): string {
        return EndLord::class;
    }

    public function zombie(int $playerId): string {
        return $this->actDontSwap();
    }
}
