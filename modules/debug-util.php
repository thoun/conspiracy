<?php

trait DebugUtilTrait {

//////////////////////////////////////////////////////////////////////////////
//////////// Utility functions
////////////

	function debugSetup() {
		if ($this->getBgaEnvironment() != 'studio') { 
			return;
		} 

		$this->debugSetLord(2343492, 2, 6);
		$this->debugSetLord(2343492, 4, 6);
		$this->debugSetLord(2343492, 4, 4);
		$this->debugSetLord(2343492, 4, 4, 1);
		$this->debugSetLord(2343492, 1, 6);
		$this->debugSetLord(2343492, 2, 1);
		$this->debugSetLord(2343492, 5, 2);
		$this->debugSetLord(2343492, 1, 1);
	}

	function debugSetLord($playerId, $color, $points, $index = 0) { // color 1 yellow, 2 red, 3 geen, 4 blue, 5 purple. points : lord points
		$card = $this->getLordFromDb(array_values($this->lords->getCardsOfType(min(6, $points+1), $color))[$index]);
		$this->lords->moveCard($card->id, 'player'.$playerId, intval($this->lords->countCardInLocation('player'.$playerId)) + 1);
		return $card;
	}

    function debug($debugData) {
        if ($this->getBgaEnvironment() != 'studio') { 
            return;
        }die('debug data : '.json_encode($debugData));
    }
}
