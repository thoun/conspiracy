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
    ],

    102 => [
        'name' => totranslate('Legendary opponent (solo mode)'),
        'values' => [
            0 => [
                'name' => totranslate('Random'),
            ],
            1 => [
                'name' => totranslate('Farmer'),
            ],
            2 => [
                'name' => totranslate('Military'),
            ],
            3 => [
                'name' => totranslate('Merchant'),
            ],
            4 => [
                'name' => totranslate('Politician'),
            ],
            5 => [
                'name' => totranslate('Mage'),
            ],
        ],
        'default' => 0,
        'displaycondition' => [[
            'type' => 'maxplayers',
            'value' => 1,
        ]]
    ],
];

$game_preferences = [
    201 => [
        'name' => totranslate('Show sign on used keys'),
        'needReload' => false,
        'values' => [
            1 => ['name' => totranslate('Enabled')],
            2 => ['name' => totranslate('Disabled')],
        ],
        'default' => 2,
    ],
];