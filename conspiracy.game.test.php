<?php
define("APP_GAMEMODULE_PATH", "misc/"); // include path to stubs, which defines "table.game.php" and other classes
require_once ('conspiracy.game.php');

// example from rulebook
$LORDS_GUILDS = [
 4, 4, 1, 1, 3,
  2, 4, 1, 4,
   4, 3, 2,
    4, 5,
     5,
];

class ConspiracyTestCoalition extends Conspiracy { // this is your game class defined in ggg.game.php
    function __construct() {
        // parent::__construct();
        include './material.inc.php';// this is how this normally included, from constructor
    }

    function getLordInSpot(int $player_id, int $spot) {
        global $LORDS_GUILDS;
        if ($player_id != 1) {
            throw new Error('wrong player_id');
        }

        if (array_key_exists($spot - 1, $LORDS_GUILDS)) {
            $lord = new stdClass();
            $lord->guild = $LORDS_GUILDS[$spot - 1];
            return $lord;
        } else {
            return null;
        }
    }

    // class tests
    function testCoalition() {
        $coalition = $this->getScoreTopCoalition(1);
        echo json_encode($coalition, JSON_PRETTY_PRINT)."\n";
        $equal = $coalition->spot == 1;
        $equal = $equal && $coalition->size == 5;
        $equal = $equal && $coalition->guild == 4;
        $equal = $equal && count($coalition->alreadyCounted) == 5;
        $equal = $equal && $coalition->alreadyCounted[0] == 1;
        $equal = $equal && $coalition->alreadyCounted[1] == 2;
        $equal = $equal && $coalition->alreadyCounted[2] == 7;
        $equal = $equal && $coalition->alreadyCounted[3] == 10;
        $equal = $equal && $coalition->alreadyCounted[4] == 13;

        if ($equal)
            echo "Test1: PASSED\n";
        else
            echo "Test1: FAILED\n";
    }

    function testAll() {
        $this->testCoalition();
    }
}

$test = new ConspiracyTestCoalition();
$test->testAll();