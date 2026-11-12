<?php

declare(strict_types=1);

namespace Bga\Games\Conspiracy;

class Location extends LocationCard {
    public /*int*/ $id;
    public /*int*/ $type;
    public /*string*/ $location; // deck, location_sel, location_pick, table, player${id}
    public /*int*/ $location_arg; // index in player${id}
    public /*int*/ $passivePowerGuild;


    public function __construct($dbLocation, $LOCATIONS) {
        $this->id = intval($dbLocation['id']);
        $this->type = intval($dbLocation['type']);
        $this->location = $dbLocation['location'];
        $this->location_arg = intval($dbLocation['location_arg']);
        $this->passivePowerGuild = intval($dbLocation['type_arg']);

        $locationCard = $LOCATIONS[$this->type];
        $this->points = $locationCard->points;
        $this->pearls = $locationCard->pearls;
        $this->activePower = $locationCard->activePower;   
        $this->passivePower = $locationCard->passivePower;    
    } 
}
