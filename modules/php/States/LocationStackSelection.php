<?php

declare(strict_types=1);

namespace Bga\Games\Conspiracy\States;

use Bga\GameFramework\StateType;
use Bga\GameFramework\States\GameState;
use Bga\GameFramework\States\PossibleAction;
use Bga\Games\Conspiracy\Game;
use Bga\GameFramework\NotificationMessage;

class LocationStackSelection extends GameState {

    public function __construct(protected Game $game) {
        parent::__construct($game,
            id: \ST_PLAYER_LOCATION_STACK_SELECTION,
            type: StateType::ACTIVE_PLAYER,
            name: 'locationStackSelection',
            description: clienttranslate('${actplayer} must choose a location from the deck or discard pile'),
            descriptionMyTurn: clienttranslate('${you} must choose a location from the deck or discard pile'),
        );
    }

    public function getArgs(int $activePlayerId): array {
        $count = $this->game->locations->countCardInLocation('deck');
        return [
            'allHidden' => $this->game->getGameStateValue('AP_DECK_LOCATION') == $activePlayerId,
            'max' => intval(min(3, $count)),
        ];
    }

    public function onEnteringState(int $activePlayerId): ?string {
        $player_id = $this->game->getPlayerIdToPlaceCard();
        if ($player_id == 0) {
            return $this->pickOpponentLocation($activePlayerId);
        }
        return null;
    }

    #[PossibleAction]
    public function actChooseLocationDeckStack(int $number, int $activePlayerId): string {
        $playerId = $this->game->getPlayerIdToPlaceCard($activePlayerId);

        $count = $this->game->locations->countCardInLocation('deck');
        if ($number > $count || $count == 0) {
            throw new \Error("Can't take $number cards, only $count in deck");
        }

        $fromHidden = $playerId != 0 && $this->game->getGameStateValue('AP_DECK_LOCATION') == $activePlayerId;

        if ($fromHidden && $number !== 0) {
            throw new \Error('You must look all locations');
        } else if (!$fromHidden && ($number < 1 || $number > 3)) {
            throw new \Error('You must look 1 to 3 locations');
        }

        if ($fromHidden) {
            $this->game->locations->moveAllCardsInLocation('deck', 'location_sel');
        } else {
            $this->game->locations->pickCardsForLocation($number, 'deck', $number == 1 ? 'location_pick' : 'location_sel');
        }

        $message = null;
        if ($fromHidden) {
            $message = clienttranslate('${player_name} chooses a location from all deck cards');
        } else {
            $message = $number > 1 ?
                clienttranslate('${player_name} chooses to take ${number} locations from the deck') :
                clienttranslate('${player_name} chooses to take ${number} location from the deck');
        }
        $this->game->bga->notify->all('locationDeckNumber', new NotificationMessage($message, [
            'player_name' => $this->game->getPlayerName($this->game->getPlayerIdToPlaceCard($activePlayerId)),
            'number' => $number,
        ]));

        return $number == 1 ? AddLocation::class : LocationSelection::class;
    }

    #[PossibleAction]
    public function actChooseVisibleLocation(int $id): string {
        $this->game->locations->moveCard($id, 'location_pick');

        return AddLocation::class;
    }

    public function zombie(int $playerId, array $args): string {
        $opponentTurn = $this->game->getPlayerIdToPlaceCard($playerId) == 0;
        $allHidden = !$opponentTurn && $args['allHidden'];
        $choices = [];
        if (!$allHidden) {
            $locations = $this->game->getLocationsFromDb($this->game->locations->getCardsInLocation('table'));
            foreach ($locations as $location) {
                $choices[] = ['id' => $location->id];
            }
        }

        if ($args['max'] > 0) {
            if ($allHidden) {
                $choices[] = ['number' => 0];
            } else if ($opponentTurn) {
                if ($choices === []) {
                    $choices[] = ['number' => 1];
                }
            } else {
                for ($number = 1; $number <= $args['max']; $number++) {
                    $choices[] = ['number' => $number];
                }
            }
        }

        if ($choices !== []) {
            $choice = $this->getRandomZombieChoice($choices);
            return isset($choice['id'])
                ? $this->actChooseVisibleLocation($choice['id'])
                : $this->actChooseLocationDeckStack($choice['number'], $playerId);
        }

        $this->game->discardPendingSelections();
        return NextPlayer::class;
    }

    private function pickOpponentLocation(int $activePlayerId): string {
        $visibleLocations = $this->game->getLocationsFromDb($this->game->locations->getCardsInLocation('table'));
        if (count($visibleLocations) > 0) {
            $location = $visibleLocations[bga_rand(0, count($visibleLocations)-1)];
            return $this->actChooseVisibleLocation($location->id);
        } else {
            return $this->actChooseLocationDeckStack(1, $activePlayerId);
        }
    }
}
