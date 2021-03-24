<?php
define("APP_GAMEMODULE_PATH", "../misc/"); // include path to stubs, which defines "table.game.php" and other classes
require_once ('../conspiracy.game.php');

class ConspiracyTestCoalitionRulebook extends Conspiracy { // this is your game class defined in ggg.game.php
    function __construct() {
        // parent::__construct();
        include '../material.inc.php';// this is how this normally included, from constructor
    }

    function getLordInSpot(int $player_id, int $spot) {
        $LORDS_GUILDS = [
            4, 4, 1, 1, 3,
             2, 4, 1, 4,
              4, 3, 2,
               4, 5,
                5,
        ];
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
        
        
        // example from rulebook
        $equal = $coalition->spot == 1;
        $equal = $equal && $coalition->size == 5;
        $equal = $equal && $coalition->guild == 4;
        $equal = $equal && count($coalition->alreadyCounted) == 5;
        $equal = $equal && $coalition->alreadyCounted[0] == 1;
        $equal = $equal && $coalition->alreadyCounted[1] == 2;
        $equal = $equal && $coalition->alreadyCounted[2] == 7;
        $equal = $equal && $coalition->alreadyCounted[3] == 10;
        $equal = $equal && $coalition->alreadyCounted[4] == 13;

        if ($equal) {
            echo "Test1: PASSED\n";
        } else {
            echo "Test1: FAILED\n";
            echo json_encode($coalition, JSON_PRETTY_PRINT)."\n";
        }
    }

    function testAll() {
        $this->testCoalition();
    }
}

class ConspiracyTestCoalitionNull extends Conspiracy { // this is your game class defined in ggg.game.php
    function __construct() {
        // parent::__construct();
        include '../material.inc.php';// this is how this normally included, from constructor
    }

    function getLordInSpot(int $player_id, int $spot) {
        $LORDS_GUILDS = [
            4, 4, 1, 1, 3,
             2, 4, 1, 4,
              4, 3, 2,
               4, null,
                null,
        ];
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
        
        $equal = $coalition->spot == 1;
        $equal = $equal && $coalition->size == 5;
        $equal = $equal && $coalition->guild == 4;
        $equal = $equal && count($coalition->alreadyCounted) == 5;
        $equal = $equal && $coalition->alreadyCounted[0] == 1;
        $equal = $equal && $coalition->alreadyCounted[1] == 2;
        $equal = $equal && $coalition->alreadyCounted[2] == 7;
        $equal = $equal && $coalition->alreadyCounted[3] == 10;
        $equal = $equal && $coalition->alreadyCounted[4] == 13;

        if ($equal) {
            echo "Test1: PASSED\n";
        } else {
            echo "Test1: FAILED\n";
            echo json_encode($coalition, JSON_PRETTY_PRINT)."\n";
        }
    }

    function testAll() {
        $this->testCoalition();
    }
}

class ConspiracyTestCoalitionComplex extends Conspiracy { // this is your game class defined in ggg.game.php
    function __construct() {
        // parent::__construct();
        include '../material.inc.php';// this is how this normally included, from constructor
    }

    function getLordInSpot(int $player_id, int $spot) {
        $LORDS_GUILDS = [
            3, 3, 2, 2, 2,
             3, 2, 5, 5,
              3, 4, 4,
               4, 4,
                4,
           ];
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
        
        $equal = $coalition->spot == 11;
        $equal = $equal && $coalition->size == 5;
        $equal = $equal && $coalition->guild == 4;
        $equal = $equal && count($coalition->alreadyCounted) == 5;
        $equal = $equal && $coalition->alreadyCounted[0] == 11;
        $equal = $equal && $coalition->alreadyCounted[1] == 12;
        $equal = $equal && $coalition->alreadyCounted[2] == 14;
        $equal = $equal && $coalition->alreadyCounted[3] == 15;
        $equal = $equal && $coalition->alreadyCounted[4] == 13;


        if ($equal) {
            echo "Test1: PASSED\n";
        } else {
            echo "Test1: FAILED\n";
            echo json_encode($coalition, JSON_PRETTY_PRINT)."\n";
        }
    }

    function testAll() {
        $this->testCoalition();
    }
}

class ConspiracyTestCoalitionBackward extends Conspiracy { // this is your game class defined in ggg.game.php
    function __construct() {
        // parent::__construct();
        include '../material.inc.php';// this is how this normally included, from constructor
    }

    function getLordInSpot(int $player_id, int $spot) {
        $LORDS_GUILDS = [
            3, 4, 4, 5, 5,
             5, 5, 5, 5,
              4, 4, 4,
               2, 2,
                2,
           ];
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
        
        $equal = $coalition->spot == 4;
        $equal = $equal && $coalition->size == 6;
        $equal = $equal && $coalition->guild == 5;
        $equal = $equal && count($coalition->alreadyCounted) == 6;
        $equal = $equal && $coalition->alreadyCounted[0] == 4;
        $equal = $equal && $coalition->alreadyCounted[1] == 5;
        $equal = $equal && $coalition->alreadyCounted[2] == 9;
        $equal = $equal && $coalition->alreadyCounted[3] == 8;
        $equal = $equal && $coalition->alreadyCounted[4] == 7;
        $equal = $equal && $coalition->alreadyCounted[5] == 6;


        if ($equal) {
            echo "Test1: PASSED\n";
        } else {
            echo "Test1: FAILED\n";
            echo json_encode($coalition, JSON_PRETTY_PRINT)."\n";
        }
    }

    function testAll() {
        $this->testCoalition();
    }
}

$test1 = new ConspiracyTestCoalitionRulebook();
$test1->testAll();
$test2 = new ConspiracyTestCoalitionNull();
$test2->testAll();
$test3 = new ConspiracyTestCoalitionComplex();
$test3->testAll();
$test4 = new ConspiracyTestCoalitionBackward();
$test4->testAll();