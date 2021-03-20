const SPOTS_NUMBERS = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];

class PlayerTable {
    private playerId: number;
    //private lordsStock: Stock;
    //private locationsStock: Stock;
    private spotsStock: PlayerTableSpotStock[] = [];

    private switchSpots: number[] = [];

    constructor(
        private game: ConspiracyGame, 
        player: Player,
        spots: PlayerTableSpot[]) {

        this.playerId = Number(player.id);

        dojo.place(`<div class="whiteblock">
            <div class="player-name" style="color: #${player.color}">${player.name}</div>
            <div id="player-table-${this.playerId}" class="player-table"></div>
        </div>`, 'players-tables');

        SPOTS_NUMBERS.forEach(spotNumber => {
            this.spotsStock[spotNumber] = new PlayerTableSpotStock(game, this, player, spots[spotNumber], spotNumber);
        });
    }
    
    public addLord(spot: number, lord: Lord) {
        this.spotsStock[spot].setLord(lord);
    }

    public addLocation(spot: number, location: Location) {
        this.spotsStock[spot].setLocation(location);
    }

    public setSelectableForSwitch(selectable: boolean) {
        SPOTS_NUMBERS.forEach(spotNumber => this.spotsStock[spotNumber].setSelectableForSwitch(selectable));
    }

    public removeSelectedSpot(spot: number) {
        const index = this.switchSpots.indexOf(spot);
        if (index !== -1) {
            this.switchSpots.splice(index, 1);
            this.setCanSwitch();
        }
    }

    public addSelectedSpot(spot: number) {
        if (!this.switchSpots.some(val => val === spot)) {
            this.switchSpots.push(spot);
            this.setCanSwitch();
        }
    }

    public setCanSwitch() {
        this.game.setCanSwitch(this.switchSpots);
    }

    public moveTopLordToken() {        
            // TODO place/move top lord token
        //throw new Error("Method not implemented.");
    }
}