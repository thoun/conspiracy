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

	public function loadBugReportSQL(int $reportId, array $studioPlayers): void
    {
        $prodPlayers = $this->getObjectListFromDb("SELECT `player_id` FROM `player`", true);
        $prodCount = count($prodPlayers);
        $studioCount = count($studioPlayers);
        if ($prodCount != $studioCount) {
            throw new BgaVisibleSystemException("Incorrect player count (bug report has $prodCount players, studio table has $studioCount players)");
        }

        // SQL specific to your game
        // For example, reset the current state if it's already game over
        /*$sql = [
            "UPDATE `global` SET `global_value` = 10 WHERE `global_id` = 1 AND `global_value` = 99"
        ];*/
        foreach ($prodPlayers as $index => $prodId) {
            $studioId = $studioPlayers[$index];
            // SQL common to all games
            $sql[] = "UPDATE `player` SET `player_id` = $studioId WHERE `player_id` = $prodId";
            $sql[] = "UPDATE `global` SET `global_value` = $studioId WHERE `global_value` = $prodId";
            $sql[] = "UPDATE `stats` SET `stats_player_id` = $studioId WHERE `stats_player_id` = $prodId";

            // SQL specific to your game
            $sql[] = "UPDATE lord SET card_location='player$studioId' WHERE card_location='player$prodId'";
            $sql[] = "UPDATE location SET card_location='player$studioId' WHERE card_location='player$prodId'";
        }
        foreach ($sql as $q) {
            $this->DbQuery($q);
        }
        $this->reloadPlayersBasicInfos();
    }

    function debug($debugData) {
        if ($this->getBgaEnvironment() != 'studio') { 
            return;
        }die('debug data : '.json_encode($debugData));
    }
}
