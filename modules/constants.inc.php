<?php

define('DICES_PER_PLAYER', 8);

/*
 * State constants
 */
define('ST_BGA_GAME_SETUP', 1);

define('ST_PLAYER_LORD_STACK_SELECTION', 20);
define('ST_PLAYER_LORD_SELECTION', 21);
define('ST_PLAYER_LORD_PICK', 22);
define('ST_PLAY_LORD', 23);
define('ST_PLAYER_LORDS_SWITCH', 24);

define('ST_PLAYER_PLACE_STACK_SELECTION', 40);
define('ST_PLACE_PLACE_SELECTION', 41);
define('ST_PLAY_PLACE', 42);
define('ST_DISCARD_LORDS', 43);
define('ST_DISCARD_PLACES', 44);

define('ST_NEXT_PLAYER', 60);

define('ST_SHOW_SCORE', 80);

define('ST_END_GAME', 99);
define('END_SCORE', 100);

/*
 * Lords
 */

class LordCard {
    //public /*int*/ $id;
    public /*int*/ $points;
    public /*int*/ $guild; // 1 blue, 2 green, 3 yellow, 4 red, 5 purple
    public /*bool*/ $switch;
    public /*int*/ $key; // 1 for silver, 2 for gold
    public /*int*/ $pearls;
    public /*bool*/ $showExtraLord;
  
  
    public function __construct(/*$id,*/ $points, $guild, $switch, $key, $pearls, $showExtraLord) {
        //$this->id = $id;
        $this->points = $points;
        $this->guild = $guild;
        $this->switch = $switch;
        $this->key = $key;
        $this->pearls = $pearls;
        $this->showExtraLord = $showExtraLord;
    } 
}
  
$LORDS = array(
    1 => new LordCard(6, 1, false, null, 0, true)
);
define('LORDS', $LORDS);

/*
 * Places
 */

class PlaceCard {
    //public /*int*/ $id;
    public /*int*/ $points;
    public /*int*/ $pearls;
    public /*bool*/ $showExtraLord;
  
  
    public function __construct(/*$id,*/ $points, $pearls, $power) {
        //$this->id = $id;
        $this->points = $points;
        $this->pearls = $pearls;
        $this->power = $power;
    } 
}
  
$PLACES = array(
    1 => new PlaceCard(7, 0, null)
);

define('PLACES', $PLACES);
?>