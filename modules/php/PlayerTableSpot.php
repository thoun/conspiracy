<?php

declare(strict_types=1);

namespace Bga\Games\Conspiracy;

class PlayerTableSpot { // 1-indexed
    /**
     * @param Lord|false|null $lord
     * @param Location|false|null $location
     */
    public function __construct(
        public $lord,
        public $location,
    ) {
    }
}
