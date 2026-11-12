<?php

declare(strict_types=1);

namespace Bga\Games\Conspiracy;

require_once __DIR__ . '/constants.inc.php';

class LocationCard {
    /**
     * @param int $points
     * @param int $pearls
     * @param int|null $activePower Impacts on the game.
     * @param int|null $passivePower Impact on PI count.
     */
    public function __construct(
        public $points,
        public $pearls,
        public $activePower = null,
        public $passivePower = null,
    ) {
    }
}
