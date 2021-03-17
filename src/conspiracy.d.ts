/**
 * Your game interfaces
 */

interface Lord {
    id: number;
    type: number;
    guild: number;
    // TODO
}
interface Location {
    id: number;
    type: number;
    activePower?: number;
    passivePower?: number;
    passivePowerGuild?: number;
    pearls: number;
    points: number;
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
    visibleLords: Lord[][];
    visibleLocations: Location[];
    masterPearlsPlayer: number;
    playersTables: { [playerId: number]: PlayerTableSpot[] };
}

interface ConspiracyGame extends Game {
    takeAction: (action: string, data?: any) => void;
}

interface EnteringLordStackSelectionArgs {
    // TODO
}

interface EnteringLocationStackSelectionArgs {
    // TODO
}

/*
interface NotifNewTurnArgs {
    casinos: any;
    playerId: number;
    neutralDices: number[];
}

interface NotifDicesPlayedArgs {
    casino: number;
    playerId: number;
    remainingDices: DicesCount;
}

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