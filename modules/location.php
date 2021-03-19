<?php
require_once( __DIR__.'/constants.inc.php' );

class LocationCard {
    //public /*int*/ $id;
    public /*int*/ $points;
    public /*int*/ $pearls;
    public /*int*/ $activePower; // impacts on the game
    public /*int*/ $passivePower; // impact on PI count
  
  
    public function __construct(/*$id,*/ $points, $pearls, $activePower = null, $passivePower = null) {
        //$this->id = $id;
        $this->points = $points;
        $this->pearls = $pearls;
        $this->activePower = $activePower;
        $this->passivePower = $passivePower;
    } 
}

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
?>
