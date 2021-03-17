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
    // TODO
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
    visibleLocations: Location[];
    masterPearlsPlayer: number;
    playersTables: { [playerId: number]: PlayerTableSpot[] };
}

interface ConspiracyGame extends Game {
    takeAction: (action: string, data?: any) => void;
    lordPick: (id: number) => void;
    lordStockPick: (guild: number) => void;
    locationPick: (id: number) => void;
}

interface EnteringLordStackSelectionArgs {
    // TODO
}
interface EnteringLordSelectionArgs {
    lords: Lord[];
}

interface EnteringLocationStackSelectionArgs {
    // TODO
}

interface NotifLordPlayedArgs {
    playerId: number;
    lord: Lord;
    spot: number;
    discardedLords: Lord[];
}

interface NotifExtraLordRevealedArgs {
    lord: Lord;
}

/*
interface NotifRemoveDuplicatesArgs {
    casino: number;
    duplicatesValues: number[];
    playersId: number[];
}

interface NotifCollectBanknoteArgs {
    casino: number;
    playerId: number;
    id: number;
    value: number;
}

interface NotifRemoveBanknoteArgs {
    casino: number;
    id: number;
}
interface NotifRemoveDicesArgs {
    resetDicesNumber: DicesCount;
}*/