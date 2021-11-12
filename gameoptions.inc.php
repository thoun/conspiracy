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
 * gameoptions.inc.php
 *
 * Conspiracy game options description
 * 
 * In this file, you can define your game options (= game variants).
 *   
 * Note: If your game has no variant, you don't have to modify this file.
 *
 * Note²: All options defined in this file should have a corresponding "game state labels"
 *        with the same ID (see "initGameStateLabels" in conspiracy.game.php)
 *
 * !! It is not a good idea to modify this file when a game is running !!
 *
 */

$game_options = [

    /* note: game variant ID should start at 100 (ie: 100, 101, 102, ...). The maximum is 199.*/

    100 => [
        'name' => totranslate('Scoring'),
        'values' => [
            1 => [
                'name' => totranslate('Visible'),
            ],
            2 => [
                'name' => totranslate('Hidden'),
                'tmdisplay' => totranslate('Hidden'),
            ],
        ],
        'default' => 1,
    ],

    101 => [
        'name' => totranslate('Bonus locations'),
        'values' => [
            1 => [
                'name' => totranslate('No'),
            ],
            2 => [
                'name' => totranslate('Yes'),
                // 'nobeginner' => true,
                // 'beta' => true,
            ],
        ],
        'default' => 1,
    ]
];