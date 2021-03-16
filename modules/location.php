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
    public /*string*/ $location; // deck, place_selection, table
    public /*int*/ $location_arg; //  1 if deck & visible, else player_id
    public /*int*/ $passivePowerGuild;


    public function __construct($dbPlace, $LOCATIONS) {
        $this->id = intval($dbPlace['id']);
        $this->location = $dbPlace['location'];
        $this->location_arg = intval($dbPlace['location_arg']);
        $this->passivePowerGuild = intval($dbPlace['type_arg']);

        $locationCard = $LOCATIONS[intval($dbPlace['type'])];
        $this->points = $locationCard->points;
        $this->pearls = $locationCard->pearls;
        $this->power = $locationCard->power;     
    } 
}
?>
