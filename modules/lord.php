<?php
class LordCard {
    //public /*int*/ $id;
    public /*int*/ $nbr;
    public /*int*/ $points;
    public /*bool*/ $switch;
    public /*int*/ $key; // 1 for silver, 2 for gold
    public /*int*/ $pearls;
    public /*bool*/ $showExtraLord;
  
  
    public function __construct(/*$id,*/ $nbr, $points, $key = null, $pearls = 0, $switch = false, $showExtraLord = false) {
        //$this->id = $id;
        $this->nbr = $nbr;
        $this->points = $points;
        $this->switch = $switch;
        $this->key = $key;
        $this->pearls = $pearls;
        $this->showExtraLord = $showExtraLord;
    } 
}

class Lord extends LordCard {
    public /*int*/ $id;
    public /*int*/ $type;
    public /*string*/ $location; // deck, lord_selection, table, player${id}
    public /*int*/ $location_arg; // guild index if table, index in player${id}
    public /*int*/ $guild;

    public function __construct($dbLord, $LORDS) {
        $this->id = intval($dbLord['id']);
        $this->type = intval($dbLord['type']);
        $this->location = $dbLord['location'];
        $this->location_arg = intval($dbLord['location_arg']);
        $this->guild = intval($dbPlace['type_arg']);

        $lordCard = $LORDS[$this->type];
        $this->points = $lordCard->points;
        $this->switch = $lordCard->switch;
        $this->key = $lordCard->key;
        $this->pearls = $lordCard->pearls;
        $this->showExtraLord = $lordCard->showExtraLord;     
    } 
}
?>
