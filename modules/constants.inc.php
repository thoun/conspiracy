<?php

define('SPOT_NUMBER', 15);

/*
 * State constants
 */
define('ST_BGA_GAME_SETUP', 1);

define('ST_PLAYER_LORD_STACK_SELECTION', 20);
define('ST_PLAYER_LORD_SELECTION', 21);
define('ST_PLAYER_LORD_PICK', 22);
define('ST_PLAY_LORD', 23);
define('ST_PLAYER_LORDS_SWAP', 24);
define('ST_END_LORD', 25);

define('ST_PLAYER_LOCATION_STACK_SELECTION', 40);
define('ST_PLAYER_LOCATION_SELECTION', 41);
define('ST_ADD_LOCATION', 42);

define('ST_NEXT_PLAYER', 60);
define('ST_USE_REPLAY', 61);

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

define('PP_LORD_1POINT_COALITION', 21);
define('PP_LORD_2POINT_COALITION', 22);
define('PP_LORD_3POINT_COALITION', 23);
define('PP_LORD_4POINT_COALITION', 24);
define('PP_LORD_NO_KEY_NO_PEARL', 25);

define('SOLO_CONDITION_SEVERAL_LORDS', 1);
define('SOLO_CONDITION_KEY', 2);
define('SOLO_CONDITION_EXTEND_COALITION', 3);
define('SOLO_CONDITION_PEARL', 4);
define('SOLO_CONDITION_MILITARY', 5);
define('SOLO_CONDITION_MAX_LORD', 6);
?>