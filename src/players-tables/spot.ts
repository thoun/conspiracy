class PlayerTableSpotStock {
    private playerId: number;
    private lordsStock: Stock;
    private locationsStock: Stock;

    constructor(
        private game: ConspiracyGame, 
        player: Player,
        spot: PlayerTableSpot,
        private spotNumber: number,
        private readonly: boolean = true) {

        this.playerId = Number(player.id);

        dojo.place(`<div id="player-table-${this.playerId}-spot${spotNumber}" class="player-table-spot spot${spotNumber}">
                <div id="player${this.playerId}-spot${spotNumber}-lord-stock"></div>
                <div id="player${this.playerId}-spot${spotNumber}-location-stock" class="player-table-spot-location"></div>
        </div>`, `player-table-${this.playerId}`);

        this.lordsStock = new ebg.stock() as Stock;
        this.lordsStock.create( this.game, $(`player${this.playerId}-spot${spotNumber}-lord-stock`), LORD_WIDTH, LORD_HEIGHT );
        setupLordCards([this.lordsStock]);

        const lord = spot.lord;
        if (lord) {
            this.lordsStock.addToStockWithId(getUniqueId(lord.type, lord.guild), `${lord.id}`);
        }

        this.locationsStock = new ebg.stock() as Stock;
        this.locationsStock.create( this.game, $(`player${this.playerId}-spot${spotNumber}-location-stock`), LOCATION_WIDTH, LOCATION_HEIGHT );
        setupLocationCards([this.locationsStock]);

        
        const location = spot.location;
        if (location) {
            this.locationsStock.addToStockWithId(getUniqueId(location.type, location.passivePowerGuild ?? 0), `${location.id}`);
        }
    }
    
    public setLord(lord: Lord) {
        this.lordsStock.addToStockWithId(getUniqueId(lord.type, lord.guild), `${lord.id}`);
    }

    public setLocation(location: Location) {
        this.locationsStock.addToStockWithId(getUniqueId(location.type, location.passivePowerGuild ?? 0), `${location.id}`);
    }
}