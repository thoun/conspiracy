<?php

declare(strict_types=1);

namespace Bga\Games\Conspiracy;

class LordCard {
    /**
     * @param int $nbr
     * @param int $points
     * @param int|null $key 1 for silver, 2 for gold.
     * @param int $pearls
     * @param bool $swap
     * @param bool $showExtraLord
     */
    public function __construct(
        public $nbr,
        public $points,
        public $key = null,
        public $pearls = 0,
        public $swap = false,
        public $showExtraLord = false,
    ) {
    }
}
