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

    public function debugReplacePlayersIds() {
        if ($this->getBgaEnvironment() != 'studio') { 
            return;
        } 

		// These are the id's from the BGAtable I need to debug.
		/*$ids = [
			85820515, 
            89072523
		];*/
		$ids = array_map(fn($dbPlayer) => intval($dbPlayer['player_id']), array_values($this->getCollectionFromDb('select player_id from player order by player_no')));

		// Id of the first player in BGA Studio
		$sid = 2343492;
		
		foreach ($ids as $id) {
			// basic tables
			self::DbQuery("UPDATE player SET player_id=$sid WHERE player_id = $id" );
			self::DbQuery("UPDATE global SET global_value=$sid WHERE global_value = $id" );
			self::DbQuery("UPDATE stats SET stats_player_id=$sid WHERE stats_player_id = $id" );

			// 'other' game specific tables. example:
			// tables specific to your schema that use player_ids
			self::DbQuery("UPDATE lord SET card_location='player$sid' WHERE card_location='player$id'" );
			self::DbQuery("UPDATE location SET card_location='player$sid' WHERE card_location='player$id'" );
			
			++$sid;
		}
	}

    function debug($debugData) {
        if ($this->getBgaEnvironment() != 'studio') { 
            return;
        }die('debug data : '.json_encode($debugData));
    }
}
