<?php

declare(strict_types=1);

namespace Bga\Games\Conspiracy\States;

use Bga\GameFramework\NotificationMessage;
use Bga\GameFramework\StateType;
use Bga\GameFramework\States\GameState;
use Bga\Games\Conspiracy\Game;

class AddLocation extends GameState {

    public function __construct(protected Game $game) {
        parent::__construct($game,
            id: \ST_ADD_LOCATION,
            type: StateType::GAME,
            name: 'addLocation',
        );
    }

    public function getArgs(): array {
        return [
            'remainingLocations' => $this->game->getRemainingLocations(),
        ];
    }

    public function onEnteringState(): string {
        $location = $this->game->getLocationFromDb(array_values($this->game->locations->getCardsInLocation('location_pick'))[0]);
        $player_id = $this->game->getPlayerIdToPlaceCard();

        $spot = $this->game->lords->countCardInLocation("player{$player_id}");
        $this->game->locations->moveCard($location->id, "player{$player_id}", (int) $spot);

        $fromHidden = $player_id > 0 && $this->game->getGameStateValue('AP_DECK_LOCATION') == $player_id;

        $remainingLocations = $this->game->getLocationsFromDb($this->game->locations->getCardsInLocation('location_sel'));
        foreach($remainingLocations as $remainingLocation) {
            $this->game->locations->moveCard($remainingLocation->id, $fromHidden ? 'deck' : 'table');
        }
        if ($fromHidden) {
            $this->game->locations->shuffle('deck');
        }

        $pearls = $location->pearls;
        if ($pearls) {
            $this->game->incPearls($player_id, $pearls);
        }

        $newScore = $this->game->getAndSavePlayerScore($player_id);

        $this->game->bga->notify->all('locationPlayed', new NotificationMessage(clienttranslate('${player_name} plays ${points} point(s) location'), [
            'playerId' => $player_id,
            'player_name' => $this->game->getPlayerName($player_id),
            'location' => $location,
            'spot' => $spot,
            'discardedLocations' => $fromHidden ? [] : $remainingLocations,
            'points' => $player_id == 0 ? 5 : $location->points,
            'newScore' => $newScore,
            'pearls' => $pearls,
            'remainingLocations' => $this->game->getRemainingLocations(),
        ]));

        if ($player_id > 0) {
            if ($location->pearls > 0) {
                $this->game->checkPearlMaster($player_id);
            }

            if ($location->activePower == AP_DISCARD_LORDS && $this->game->lords->countCardInLocation("table") > 0) {
                $this->game->lords->moveAllCardsInLocation('table', 'deck');
                $this->game->lords->shuffle('deck');
                $this->game->bga->notify->all('discardLords', clienttranslate('Lords are discarded'), [
                    'remainingLords' => $this->game->getRemainingLords(),
                ]);
            }
            if ($location->activePower == AP_DISCARD_LOCATIONS && $this->game->locations->countCardInLocation("table") > 0) {
                $this->game->locations->moveAllCardsInLocation('table', 'deck');
                $this->game->locations->shuffle('deck');
                $this->game->bga->notify->all('discardLocations', clienttranslate('Locations are discarded'), [
                    'remainingLocations' => $this->game->getRemainingLocations(),
                ]);
            }
            if ($location->activePower == AP_FIRST_LORD) {
                $this->game->setGameStateValue('AP_FIRST_LORD', $player_id);
                $this->game->setGameStateValue('AP_FIRST_LORDS', 0);
            }
            if ($location->activePower == AP_FIRST_LORDS) {
                $this->game->setGameStateValue('AP_FIRST_LORDS', $player_id);
                $this->game->setGameStateValue('AP_FIRST_LORD', 0);
            }
            if ($location->activePower == AP_DECK_LOCATION) {
                $this->game->setGameStateValue('AP_DECK_LOCATION', $player_id);
            }

            $this->game->bga->playerStats->inc('played_locations', 1, $player_id);
        }

        return EndLord::class;
    }
}
