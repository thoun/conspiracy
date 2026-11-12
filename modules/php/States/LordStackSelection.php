<?php

declare(strict_types=1);

namespace Bga\Games\Conspiracy\States;

use Bga\GameFramework\NotificationMessage;
use Bga\GameFramework\StateType;
use Bga\GameFramework\States\GameState;
use Bga\GameFramework\States\PossibleAction;
use Bga\Games\Conspiracy\Game;

class LordStackSelection extends GameState {

    public function __construct(protected Game $game) {
        parent::__construct($game,
            id: \ST_PLAYER_LORD_STACK_SELECTION,
            type: StateType::ACTIVE_PLAYER,
            name: 'lordStackSelection',
            description: clienttranslate('${actplayer} must choose lords from deck or from a discard pile'),
            descriptionMyTurn: clienttranslate('${you} must choose lords from deck or from a discard pile'),
            transitions: [
                'soloCardAdded' => \ST_PLAYER_LORD_STACK_SELECTION,
            ],
        );
    }

    public function getArgs(): array {
        $limitToHidden = null;
        $count = $this->game->getRemainingLords();

        if ($count > 0) {
            if ($this->game->getGameStateValue('AP_FIRST_LORD') > 0 || intval($this->game->getGameStateValue('forceFirstByMilitary')) == 1) {
                $limitToHidden = 1;
            } else if ($this->game->getGameStateValue('AP_FIRST_LORDS') > 0) {
                $limitToHidden = 2;
            }
        }

        $opponentTurn = $this->game->isSoloMode() && $this->game->isOpponentTurn();
        $piles = [];
        if ($opponentTurn) {
            $piles = $this->getLordDeckPiles(false, false);
        }

        return [
            'limitToHidden' => $limitToHidden,
            'max' => intval(min(3, $count)),
            'opponentTurn' => $opponentTurn,
            'piles' => $piles,
        ];
    }

    public function onEnteringState(int $activePlayerId): int|string|null {
        if ($this->game->isSoloMode() && $this->game->isOpponentTurn()) {
            $piles = $this->getLordDeckPiles(true, true);

            if (count($piles) == 1) {
                return $this->actChooseVisibleStack($piles[0], $activePlayerId);
            }
        }
        return null;
    }

    #[PossibleAction]
    public function actChooseLordDeckStack(int $number, int $activePlayerId): int|string {
        $count = $this->game->getRemainingLords();
        if ($number > $count) {
            throw new \Error("Can't take $number cards, only $count in deck");
        }

        $this->game->lords->pickCardsForLocation($number, 'deck', $number == 1 ? 'lord_pick' : 'lord_selection');

        $message = $number > 1 ?
          clienttranslate('${player_name} chooses to take ${number} lords from the deck') :
          clienttranslate('${player_name} chooses to take ${number} lord from the deck');
        $this->game->bga->notify->all('lordDeckNumber', new NotificationMessage($message, [
            'player_name' => $this->game->getPlayerNameById($activePlayerId),
            'number' => $number,
        ]));

        $this->game->setGameStateValue('stackSelection', 1);
        return $number == 1 ? LordPlacement::class : LordSelection::class;
    }

    #[PossibleAction]
    public function actChooseVisibleStack(int $guild, int $activePlayerId): int|string {
        $number = $this->game->lords->countCardInLocation('table', $guild);

        $this->game->lords->moveAllCardsInLocation('table', $number == 1 ? 'lord_pick' : 'lord_selection', $guild);

        $message = clienttranslate('${player_name} chooses to take all visible ${guild_name} lords');
        $this->game->bga->notify->all('lordVisiblePile', new NotificationMessage($message, [
            'player_name' => $this->game->getPlayerName($this->game->getPlayerIdToPlaceCard($activePlayerId)),
            'guild' => $guild,
            'guild_name' => $this->game->getGuildName($guild),
            'number' => $number,
            'i18n' => ['guild_name'],
        ]));

        $this->game->setGameStateValue('stackSelection', 0);

        if ($guild == 2 && $this->game->isSoloMode() && $this->game->isOpponentTurn() && $this->game->getOpponentLord() == 2) {
            $this->game->setGameStateValue('forceFirstByMilitary', 1);
        }

        return $number == 1 ? LordPlacement::class : LordSelection::class;
    }

    public function zombie(int $playerId, array $args): int|string {
        $choices = [];
        if ($args['opponentTurn']) {
            foreach ($args['piles'] as $guild) {
                $choices[] = ['guild' => (int) $guild];
            }
        } else if ($args['limitToHidden'] !== null) {
            if ($args['max'] > 0) {
                $choices[] = ['number' => min($args['limitToHidden'], $args['max'])];
            }
        } else {
            for ($number = 1; $number <= $args['max']; $number++) {
                $choices[] = ['number' => $number];
            }
            for ($guild = 1; $guild <= 5; $guild++) {
                if ($this->game->lords->countCardInLocation('table', $guild) > 0) {
                    $choices[] = ['guild' => $guild];
                }
            }
        }

        if ($choices !== []) {
            $choice = $this->getRandomZombieChoice($choices);
            return isset($choice['guild'])
                ? $this->actChooseVisibleStack($choice['guild'], $playerId)
                : $this->actChooseLordDeckStack($choice['number'], $playerId);
        }

        $this->game->discardPendingSelections();
        return NextPlayer::class;
    }

    private function getLordDeckPiles(bool $canRedirect, bool $notif) {
        $visibleLords = [];
        for ($guild=1; $guild<=5; $guild++) {
            $visibleLords[$guild] = $this->game->getLordsFromDb($this->game->lords->getCardsInLocation('table', $guild));
        }

        $lordConditions = $this->game->SOLO_LORD_CONDITIONS[$this->game->getOpponentLord()];

        foreach($lordConditions as $index => $condition) {
            $piles = $this->pilesMatchingCondition($visibleLords, $condition);
            $count = count($piles);

            if ($notif) {
                $this->game->bga->notify->all('matchingPiles', new NotificationMessage(clienttranslate('${count} pile(s) meet Legendary opponent condition ${conditionNumber}'), [
                    'conditionNumber' => $index + 1,
                    'count' => $count,
                    'condition' => $condition,
                ]));
            }

            if ($count > 0) {
                return $piles;
            }
        }

        if ($canRedirect) {
            $this->game->bga->notify->all('noMatchingPiles', clienttranslate('No Legendary opponent condition can be applied, revealing a new Lord'), []);

            $this->game->revealExtraLord();

            $this->game->gamestate->nextState('soloCardAdded');
        }
        return [];
    }

    private function pilesMatchingCondition(array $visibleLords, int $condition) {
        $piles = [];
        for ($guild=1; $guild<=5; $guild++) {
            $piles[$guild] = $this->pileMatchingCondition($visibleLords[$guild], $condition);
        }

        $max = max($piles);

        if ($max == 0) {
            return [];
        } else {
            return array_keys(array_filter($piles, function ($pile) use ($max) { return $pile == $max; }));
        }
    }

    private function pileMatchingCondition(array $visibleLords, int $condition) {
        switch ($condition) {
            case SOLO_CONDITION_SEVERAL_LORDS:
                $countLords = count($visibleLords);
                return $countLords >= 2 ? $countLords : 0;
            case SOLO_CONDITION_KEY:
                $countKeys = count(array_filter($visibleLords, function($lord) { return $lord->key > 0; }));
                return $countKeys;
            case SOLO_CONDITION_EXTEND_COALITION:
                $newCoalitionSize = $this->getNewCoalitionSizeForOpponent($visibleLords);
                return $newCoalitionSize;
            case SOLO_CONDITION_PEARL:
                $countPearls = count(array_filter($visibleLords, function($lord) { return $lord->pearls > 0; }));
                return $countPearls;
            case SOLO_CONDITION_MILITARY:
                $countMilitary = count(array_filter($visibleLords, function($lord) { return $lord->location_arg  == 2; }));
                return $countMilitary;
            case SOLO_CONDITION_MAX_LORD:
                $countMaxLord = count(array_filter($visibleLords, function($lord) { return $lord->points  == 6; }));
                return $countMaxLord;
        }
        return 0;
    }

    private function getNewCoalitionSizeForOpponent(array $visibleLords) {
        if (count($visibleLords) == 0) {
            return 0;
        }

        $spot = $this->game->lords->countCardInLocation("player0") + 1;
        $cardsColors = [
            $spot => $visibleLords[0]->guild
        ];

        $lords = $this->game->getLordsFromDb($this->game->lords->getCardsInLocation("player0"));
        foreach($lords as $lord) {
            $cardsColors[$lord->location_arg] = $lord->guild;
        }

        $spotsNewArea = $this->game->getSpotsInAreaForSpot($spot, $cardsColors, []);
        $count = count($spotsNewArea);
        if ($count >= 3) {
            return $count + count($visibleLords) - 1;
        } else {
            return 0;
        }
    }
}
