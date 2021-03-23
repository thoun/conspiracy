<?php
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * Conspiracy implementation : © <Your name here> <Your email address here>
 * 
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * material.inc.php
 *
 * Conspiracy game material description
 *
 * Here, you can describe the material of your game with PHP variables.
 *   
 * This file is loaded in your game logic class constructor, ie these variables
 * are available everywhere in your game logic code.
 *
 */

require_once( 'modules/constants.inc.php' );
require_once( 'modules/lord.php' );
require_once( 'modules/location.php' );

/*
 * Lords
 */
$this->LORDS = [
    1 => new LordCard(1, 0, null, 0, true),
    2 => new LordCard(4, 1, 1),
    3 => new LordCard(2, 2, 2),
    4 => new LordCard(2, 3, null, 2),
    5 => new LordCard(2, 4, null, 1),
    6 => new LordCard(1, 6, null, 0, false, true)
];

/*
 * Locations
 */
$this->LOCATIONS_UNIQUE = [
    1 => new LocationCard(7, 0),
    2 => new LocationCard(5, 1),
    3 => new LocationCard(4, 2),
    4 => new LocationCard(3, 3),
    5 => new LocationCard(0, 0, null, PP_SILVER_KEYS),
    6 => new LocationCard(0, 0, null, PP_GOLD_KEYS),
    7 => new LocationCard(0, 0, null, PP_PEARLS),
    8 => new LocationCard(0, 0, null, PP_LOCATIONS),
    9 => new LocationCard(3, 0, AP_FIRST_LORD),
    10 => new LocationCard(3, 0, AP_FIRST_LORDS),
    11 => new LocationCard(3, 0, AP_DISCARD_LORDS),
    12 => new LocationCard(3, 0, AP_DISCARD_LOCATIONS),
    13 => new LocationCard(3, 0, AP_KEYS),
    14 => new LocationCard(3, 0, AP_DECK_LOCATION),
]; 
$this->LOCATIONS_GUILD = [
    100 => new LocationCard(0, 0, null, PP_LORD_MAX),
    101 => new LocationCard(1, 0, null, PP_LORD_COUNT),
];

$this->LOCATIONS = $this->LOCATIONS_UNIQUE + $this->LOCATIONS_GUILD;

/*
 * Coalition
 */
$this->NEIGHBOURS = [
    1 => [2, 6],
    2 => [3, 6, 7],
    3 => [4, 7, 8],
    4 => [5, 8, 9],
    5 => [9],
    6 => [7, 10],
    7 => [8, 10, 11],
    8 => [9, 11, 12],
    9 => [12],
    10 => [11, 13],
    11 => [12, 13, 14],
    12 => [14],
    13 => [14, 15],
    14 => [15],
    15 => [],
];