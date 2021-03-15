<?php
require_once( __DIR__.'/constants.inc.php' );

class Location {
    public /*int*/ $id;
    public /*string*/ $location; // deck, place_selection, table
    public /*int*/ $location_arg; //  1 if deck & visible, else player_id


    public function __construct($dbPlace) {
        $this->id = intval($dbPlace['id']);
        $this->location = $dbPlace['location'];
        $this->location_arg = intval($dbPlace['location_arg']);

        $locationCard = $LOCATIONS[$this->id];
        $this->points = $locationCard->points;
        $this->pearls = $locationCard->pearls;
        $this->power = $locationCard->power;     
    } 
}
?>
