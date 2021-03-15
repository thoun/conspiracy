<?php
require_once( __DIR__.'/constants.inc.php' );

class Lord extends LordCard {
    public /*int*/ $id;
    public /*string*/ $location; // deck, lord_selection, lord_pick, table
    public /*int*/ $location_arg; //  guild index if deck & visible, else player_id

    public function __construct($dbLord) {
        $this->id = intval($dbLord['id']);
        $this->location = $dbLord['location'];
        $this->location_arg = intval($dbLord['location_arg']);

        $lordCard = $LORDS[$this->id];
        $this->points = $lordCard->points;
        $this->guild = $lordCard->guild;
        $this->switch = $lordCard->switch;
        $this->key = $lordCard->key;
        $this->pearls = $lordCard->pearls;
        $this->showExtraLord = $lordCard->showExtraLord;     
    } 
}
?>
