const SPOTS_NUMBERS = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];

class PlayerTable {
    private playerId: number;
    //private lordsStock: Stock;
    //private locationsStock: Stock;
    private spotsStock: PlayerTableSpotStock[] = [];

    constructor(
        private game: ConspiracyGame, 
        player: Player,
        spots: PlayerTableSpot[],
        private readonly: boolean = true) {

        this.playerId = Number(player.id);

        dojo.place(`<div class="whiteblock">
            <div class="player-name" style="color: #${player.color}">${player.name}</div>
            <div id="player-table-${this.playerId}" class="player-table"></div>
        </div>`, 'players-tables');

        SPOTS_NUMBERS.forEach(spotNumber => {
            this.spotsStock[spotNumber] = new PlayerTableSpotStock(game, player, spots[spotNumber], spotNumber, readonly);
        });
    }
    
    public addLord(spot: number, lord: Lord) {
        this.spotsStock[spot].setLord(lord);
    }

    addLocation(spot: number, location: Location) {
        this.spotsStock[spot].setLocation(location);
    }
}