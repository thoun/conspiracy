<?php
define("APP_GAMEMODULE_PATH", "../misc/"); // include path to stubs, which defines "table.game.php" and other classes
require_once ('../conspiracy.game.php');

class FakeDeck {
    function getCardsInLocation($string) {
    }
}

class ConspiracyTestLocation extends Conspiracy { // this is your game class defined in ggg.game.php
    function __construct() {
        // parent::__construct();
        include '../material.inc.php';// this is how this normally included, from constructor

        $this->locations = new FakeDeck();
        $this->lords = new FakeDeck();
    }

    function getLordsFromDb($any) { 
        $lord1 = new stdClass();
        $lord1->guild = 1; 
        $lord2 = new stdClass();
        $lord2->guild = 2; 
        $lord3 = new stdClass();
        $lord3->guild = 3; 
        $lord5 = new stdClass();
        $lord5->guild = 5;

        return [$lord5, $lord5, $lord1, $lord2, $lord2,
                    $lord3, $lord5, $lord1, $lord1,
                        $lord1, $lord5];
    }

    function getLocationsFromDb($any) { 
        $location1 = new stdClass();
        $location1->points = 3;
        $location1->passivePower = null;
        $location1->activePower = AP_DECK_LOCATION;
        $location1->passivePowerGuild = null;
        $location1->type = 14;

        $location2 = new stdClass();
        $location2->points = 1;
        $location2->activePower = null;
        $location2->passivePower = PP_LORD_COUNT;
        $location2->passivePowerGuild = 5;
        $location2->type = 101;

        return [$location1, $location2];
    }

    // class tests
    function testLocation() {
        $score = $this->getScoreLocations(1, 4);
        echo 'score='.json_encode($score, JSON_PRETTY_PRINT)."\n";
        
        
        // example from rulebook
        $equal = $score == 8;

        if ($equal)
            echo "Test1: PASSED\n";
        else
            echo "Test1: FAILED\n";
    }

    function testAll() {
        $this->testLocation();
    }
}

$test1 = new ConspiracyTestLocation();
$test1->testAll();