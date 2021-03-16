<?php

define('DICES_PER_PLAYER', 8);

/*
 * State constants
 */
define('ST_BGA_GAME_SETUP', 1);

define('ST_PLAYER_LORD_STACK_SELECTION', 20);
define('ST_PLAYER_LORD_SELECTION', 21);
define('ST_PLAYER_LORD_PICK', 22);
define('ST_ADD_LORD', 23);
define('ST_PLAYER_LORDS_SWITCH', 24);

define('ST_PLAYER_LOCATION_STACK_SELECTION', 40);
define('ST_PLAYER_LOCATION_SELECTION', 41);
define('ST_ADD_LOCATION', 42);
define('ST_DISCARD_LORDS', 43);
define('ST_DISCARD_LOCATIONS', 44);

define('ST_NEXT_PLAYER', 60);

define('ST_SHOW_SCORE', 80);

define('ST_END_GAME', 99);
define('END_SCORE', 100);

/*
 * Powers
 */
// actives
define('AP_FIRST_LORD', 1);
define('AP_FIRST_LORDS', 2);
define('AP_DISCARD_LORDS', 3);
define('AP_DISCARD_LOCATIONS', 4);
define('AP_KEYS', 5);
define('AP_DECK_LOCATION', 6);
// passives
define('PP_SILVER_KEYS', 1);
define('PP_GOLD_KEYS', 2);
define('PP_PEARLS', 3);
define('PP_LOCATIONS', 4);
define('PP_LORD_MAX', 5);
define('PP_LORD_COUNT', 6);
?>