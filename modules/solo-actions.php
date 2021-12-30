<?php

trait SoloActionTrait {

    //////////////////////////////////////////////////////////////////////////////
    //////////// Player actions
    //////////// 
    
    /*
        Each time a player is doing some game action, one of the methods below is called.
        (note: each method below must match an input method in nicodemus.action.php)
    */

    function useReplayToken(int $use) {
        self::checkAction('useReplayToken'); 
        
        self::setGameStateValue('usePlayAgain', $use);
        $this->gamestate->nextState('nextPlayer');
    }

}
