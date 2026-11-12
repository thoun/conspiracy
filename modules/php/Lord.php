<?php

declare(strict_types=1);

namespace Bga\Games\Conspiracy;

class Lord extends LordCard {
    public /*int*/ $id;
    public /*int*/ $type;
    public /*string*/ $location; // deck, lord_selection, lord_pick, table, player${id}
    public /*int*/ $location_arg; // guild index if table, index in player${id}
    public /*int*/ $guild; // 1 yellow, 2 red, 3 green, 4 blue, 5 purple

    public function __construct($dbLord, $LORDS) {
        $this->id = intval($dbLord['id']);
        $this->type = intval($dbLord['type']);
        $this->location = $dbLord['location'];
        $this->location_arg = intval($dbLord['location_arg']);
        $this->guild = intval($dbLord['type_arg']);

        $lordCard = $LORDS[$this->type];
        $this->points = $lordCard->points;
        $this->swap = $lordCard->swap;
        $this->key = $lordCard->key;
        $this->pearls = $lordCard->pearls;
        $this->showExtraLord = $lordCard->showExtraLord;     
    } 
}
