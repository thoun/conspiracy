{OVERALL_GAME_HEADER}

<!-- 
--------
-- BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
-- Conspiracy implementation : © <Your name here> <Your email address here>
-- 
-- This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
-- See http://en.boardgamearena.com/#!doc/Studio for more information.
-------

    conspiracy_conspiracy.tpl
    
    This is the HTML template of your game.
    
    Everything you are writing in this file will be displayed in the HTML page of your game user interface,
    in the "main game zone" of the screen.
    
    You can use in this template:
    _ variables, with the format {MY_VARIABLE_ELEMENT}.
    _ HTML block, with the BEGIN/END format
    
    See your "view" PHP file to check how to set variables and control blocks
    
    Please REMOVE this comment before publishing your game on BGA
-->

<div id="lord-stacks" class="whiteblock">
    <div id="lord-hidden-pile"></div>
    <div id="lord-visible-stocks"></div>
</div>

<div id="location-stacks" class="whiteblock">
    <div id="location-hidden-pile"></div>
    <div id="location-visible-stock"></div>
</div>

<div id="players-tables">
    <div id="player-table">

    </div>

    <!-- TODO other players -->
</div>

{OVERALL_GAME_FOOTER}
