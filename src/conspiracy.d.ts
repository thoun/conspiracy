/**
 * Your game interfaces
 */

interface Card {
    id: number;
    type: number;
    pearls: number;
    points: number;
}

interface Lord extends Card {
    guild: number;    
    key: number; 
    showExtraLord: boolean;
    swap: boolean;
}

interface Location extends Card {
    activePower?: number;
    passivePower?: number;
    passivePowerGuild?: number;
}

interface PlayerTableSpot {
    lord?: Lord;
    location?: Location;
}

interface DetailedScore {
    lords: number;
    locations: number;
    coalition: number;
    pearlMaster: number;
    total: number;
}

interface ConspiracyGamedatas {
    current_player_id: string;
    decision: {decision_type: string};
    game_result_neutralized: string;
    gamestate: Gamestate;
    gamestates: { [gamestateId: number]: Gamestate };
    neutralized_player_id: string;
    notifications: {last_packet_id: string, move_nbr: string}
    playerorder: (string | number)[];
    players: { [playerId: number]: Player };
    tablespeed: string;

    // Add here variables you set up in getAllDatas
    visibleLords: { [spot: number]: Lord[] };
    pickLords: Lord[];
    visibleLocations: Location[];
    pickLocations: Location[];
    pearlMasterPlayer: number;
    playersTables: { [playerId: number]: PlayerTableSpot[] };
    endTurn: boolean;
}

interface ConspiracyGame extends Game {
    takeAction: (action: string, data?: any) => void;
    lordPick: (id: number) => void;
    lordStockPick: (guild: number) => void;
    setCanSwap(swapSpots: number[]);
    locationPick: (id: number) => void;
}

interface EnteringStackSelectionArgs {
    max: number;
}

interface EnteringLordStackSelectionArgs extends EnteringStackSelectionArgs {
    limitToHidden: number;
}

interface EnteringLordSelectionArgs {
    lords: Lord[];
    multiple: boolean;
}

interface EnteringLocationStackSelectionArgs extends EnteringStackSelectionArgs {
    allHidden: boolean;
}

interface EnteringLocationSelectionArgs {
    locations: Location[];
}

interface NotifDiscardLordPickArgs {
    discardedLords: Lord[];
}

interface NotifDiscardLocationPickArgs {
    discardedLocations: Location[];
}

interface NotifLordPlayedArgs {
    playerId: number;
    lord: Lord;
    spot: number;
    stackSelection: boolean;
    discardedLords: Lord[];
    newScore: number;
    pearls: number;
}

interface NotifLordSwappedArgs {
    playerId: number;
    spot1: number;
    spot2: number;
    newScore: number;
}

interface NotifExtraLordRevealedArgs {
    lord: Lord;
}

interface NotifLocationPlayedArgs {
    playerId: number;
    location: Location;
    spot: number;
    discardedLocations: Location[];
    newScore: number;
    pearls: number;
}

interface NotifNewPearlMasterArgs {
    playerId: number;
    previousPlayerId: number;
}

interface NotifScorePointArgs {
    playerId: number;
    points: number;
}

interface Coalition {
    spot: number;
    size: number;
    guild: number;
    alreadyCounted: number[];
}

interface NotifScoreCoalitionArgs extends NotifScorePointArgs {
    coalition: Coalition;
}

interface NotifScorePearlMasterArgs {
    playerId: number;
}