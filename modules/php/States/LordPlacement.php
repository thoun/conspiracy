<?php

declare(strict_types=1);

namespace Bga\Games\Conspiracy\States;

use Bga\GameFramework\NotificationMessage;
use Bga\GameFramework\StateType;
use Bga\GameFramework\States\GameState;
use Bga\Games\Conspiracy\Game;

class LordPlacement extends GameState {

    public function __construct(protected Game $game) {
        parent::__construct($game,
            id: \ST_PLAY_LORD,
            type: StateType::GAME,
            name: 'lordPlacement',
            transitions: [
                'swap' => \ST_PLAYER_LORDS_SWAP,
                'addLocation' => \ST_PLAYER_LOCATION_STACK_SELECTION,
            ],
        );
    }

    public function getArgs(): array {
        return [
            'remainingLords' => $this->game->getRemainingLords(),
        ];
    }

    public function onEnteringState(): ?string {
        $lord = $this->game->getLordFromDb(array_values($this->game->lords->getCardsInLocation('lord_pick'))[0]);
        $player_id = $this->game->getPlayerIdToPlaceCard();

        $spot = $this->game->lords->countCardInLocation("player{$player_id}") + 1;
        $this->game->lords->moveCard($lord->id, "player{$player_id}", $spot);

        $stackSelection = $this->game->getGameStateValue('stackSelection') == 1;
        $remainingLords = [];
        if ($stackSelection) {
            $remainingLords = $this->game->placeRemainingLordSelectionToTable(false);
        } else {
            $remainingLords = $this->game->getLordsFromDb($this->game->lords->getCardsInLocation('lord_selection'));
        }

        $pearls = $lord->pearls;
        if ($pearls) {
            $this->game->incPearls($player_id, $pearls);
        }

        $message = null;
        switch ($lord->type) {
            case 1: $message = clienttranslate('${player_name} plays 0 point ${guild_name} lord with swap power'); break;
            case 2: $message = clienttranslate('${player_name} plays 1 point ${guild_name} lord with silver key'); break;
            case 3: $message = clienttranslate('${player_name} plays 2 points ${guild_name} lord with gold key'); break;
            case 4: $message = clienttranslate('${player_name} plays 3 points ${guild_name} lord and gets 2 pearls'); break;
            case 5: $message = clienttranslate('${player_name} plays 4 points ${guild_name} lord and get 1 pearl'); break;
            case 6: $message = clienttranslate('${player_name} plays 6 points ${guild_name} lord and reveal a lord from the deck'); break;
        }

        $newScore = $this->game->getAndSavePlayerScore($player_id);

        $this->game->bga->notify->all('lordPlayed', new NotificationMessage($message, [
            'playerId' => $player_id,
            'player_name' => $this->game->getPlayerName($player_id),
            'lord' => $lord,
            'spot' => $spot,
            'stackSelection' => $stackSelection,
            'discardedLords' => $remainingLords,
            'newScore' => $newScore,
            'pearls' => $pearls,
            'guild' => $lord->guild,
            'guild_name' => $this->game->getGuildName($lord->guild),
            'i18n' => ['guild_name'],
        ]));

        if ($lord->showExtraLord && $this->game->getRemainingLords() > 0) {
            $this->game->revealExtraLord();
        }

        if ($lord->pearls > 0) {
            $this->game->checkPearlMaster($player_id);
        }

        if ($player_id > 0) {
            $this->game->bga->playerStats->inc('played_lords', 1, $player_id);

            if ($this->game->isSoloMode() && intval($this->game->getGameStateValue('playAgainPlayer')) == 0) {
                if ($this->createdNewColorArea($player_id, $spot)) {
                    $this->game->setGameStateValue('playAgainPlayer', $player_id);

                    $this->game->bga->notify->all('newPlayAgainPlayer', new NotificationMessage(clienttranslate('${player_name} gets the Replay token'), [
                        'playerId' => $player_id,
                        'player_name' => $this->game->getPlayerName($player_id),
                    ]));
                }
            }
        }

        if ($lord->swap && $this->canSwap($player_id)) {
            $this->game->gamestate->nextState('swap');
            if ($player_id > 0) {
                $this->game->giveExtraTime($player_id);
            }
        } else if ($lord->key && $this->canConstruct($player_id)) {
            $this->game->gamestate->nextState('addLocation');
            if ($player_id > 0) {
                $this->game->giveExtraTime($player_id);
            }
        } else {
            return EndLord::class;
        }
        return null;
    }

    private function canConstructWithNewKey(int $playerId): bool {
        $lords = $this->game->getLordsFromDb($this->game->lords->getCardsInLocation("player$playerId"));
        $locations = $this->game->getLocationsFromDb($this->game->locations->getCardsInLocation("player$playerId"));
        $locationsSpots = array_map(function($location) { return $location->location_arg; }, $locations);
        $lastLocationSpot = count($locationsSpots) > 0 ? max($locationsSpots) : 0;
        $hasActivePowerKeys = $playerId == 0 ?
            $this->game->getOpponentLord() == 5 :
            array_any($locations, fn($location) => $location->activePower === AP_KEYS);

        if ($hasActivePowerKeys) {
            $keys = count(array_filter($lords, function($lord) use ($lastLocationSpot) { return $lord->location_arg > $lastLocationSpot && $lord->key >= 1; }));

            return $keys >= 2;
        } else {
            $silverKeys = count(array_filter($lords, function($lord) use ($lastLocationSpot) { return $lord->location_arg > $lastLocationSpot && $lord->key === 1; }));
            $goldKeys = count(array_filter($lords, function($lord) use ($lastLocationSpot) { return $lord->location_arg > $lastLocationSpot && $lord->key === 2; }));

            return $silverKeys >= 2 || $goldKeys >= 2;
        }
    }

    private function canConstruct(int $playerId): bool {
        $canConstruct = $this->canConstructWithNewKey($playerId);

        if ($canConstruct && $this->game->getGameStateValue('AP_DECK_LOCATION') == $playerId) {
            $canConstruct = $this->game->getRemainingLocations() > 0;
        }

        return $canConstruct;
    }

    private function canSwap(int $player_id): bool {
        if ($player_id == 0) {
            return false;
        }

        $lords = $this->game->getLordsFromDb($this->game->lords->getCardsInLocation("player$player_id"));
        $swappableLords = array_values(array_filter($lords, function($lord) { return !$lord->key; }));

        return count($swappableLords) >= 2;
    }

    private function createdNewColorArea(int $playerId, int $spot) {
        $cardsColors = [];

        $lords = $this->game->getLordsFromDb($this->game->lords->getCardsInLocation("player$playerId"));
        foreach($lords as $lord) {
            $cardsColors[$lord->location_arg] = $lord->guild;
        }

        $spotsNewArea = $this->game->getSpotsInAreaForSpot($spot, $cardsColors, []);
        if (count($spotsNewArea) >= 3) {
            foreach ($spotsNewArea as $spotNewArea) {
                // if card on the new area was already part of a >=3 color area, it extends but doesn't create a new
                if ($spotNewArea != $spot && count($this->game->getSpotsInAreaForSpot($spotNewArea, $cardsColors, [$spot])) >= 3) {
                    return false;
                }
            }

            return true;
        }

        return false;
    }
}
