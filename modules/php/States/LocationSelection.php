<?php

declare(strict_types=1);

namespace Bga\Games\Conspiracy\States;

use Bga\GameFramework\StateType;
use Bga\GameFramework\States\GameState;
use Bga\GameFramework\States\PossibleAction;
use Bga\Games\Conspiracy\Game;

class LocationSelection extends GameState {

    public function __construct(protected Game $game) {
        parent::__construct($game,
            id: \ST_PLAYER_LOCATION_SELECTION,
            type: StateType::ACTIVE_PLAYER,
            name: 'locationSelection',
            description: clienttranslate('${actplayer} must choose a location'),
            descriptionMyTurn: clienttranslate('${you} must choose a location'),
        );
    }

    public function getArgs(): array {
        $locations = $this->game->getLocationsFromDb($this->game->locations->getCardsInLocation('location_sel'));
        return [
            'locations' => $locations,
            'remainingLocations' => $this->game->getRemainingLocations(),
        ];
    }

    #[PossibleAction]
    public function actPickLocation(int $id): string {
        $location = $this->game->getLocationFromDb($this->game->locations->getCard($id));
        if ($location->location !== 'location_sel') {
            throw new \Error('Picked location is not available');
        }
        $this->game->locations->moveCard($location->id, 'location_pick');

        return AddLocation::class;
    }

    public function zombie(int $playerId, array $args): string {
        $choices = array_values($args['locations']);
        if ($choices !== []) {
            $location = $this->getRandomZombieChoice($choices);
            return $this->actPickLocation($location->id);
        }

        $this->game->discardPendingSelections();
        return NextPlayer::class;
    }
}
