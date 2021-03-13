<?php
require_once( 'constants.inc.php' );

class Place {
    public /*int*/ $id;
    public /*string*/ $location; // deck, place_selection, table
    public /*int*/ $location_arg; //  1 if deck & visible, else player_id


    public function __construct($dbPlace) {
        $this->id = intval($dbPlace['id']);
        $this->location = $dbPlace['location'];
        $this->location_arg = intval($dbPlace['location_arg']);

        $placeCard = PLACES[$this->id];
        $this->points = $placeCard->points;
        $this->pearls = $placeCard->pearls;
        $this->power = $placeCard->power;     
    } 
}
?>
