class PlayerTable {
    private playerId: number;
    private lordsStock: Stock;
    private locationsStock: Stock;

    constructor(
        private game: ConspiracyGame, 
        player: Player,
        private spots: PlayerTableSpot[],
        private readonly: boolean = true) {

        this.playerId = Number(player.id);

        dojo.place(`<div class="whiteblock">
            <div class="player-name" style="color: #${player.color}">${player.name}</div>
            <div id="player-table-${this.playerId}">
                Lords : <div id="player${this.playerId}-lord-stock"></div>
                Locations : <div id="player${this.playerId}-location-stock"></div>
            </div>
        </div>`, 'players-tables')

        this.lordsStock = new ebg.stock() as Stock;
        this.lordsStock.create( this.game, $(`player${this.playerId}-lord-stock`), LORD_WIDTH, LORD_HEIGHT );
        setupLordCards([this.lordsStock]);

        Object.entries(spots).forEach(([spotNumber, spot]) => {
            const lord = spot.lord;
            if (lord) {
            this.lordsStock.addToStockWithId(getUniqueId(lord.type, lord.guild), `${lord.id}`);
            }
        });

        this.locationsStock = new ebg.stock() as Stock;
        this.locationsStock.create( this.game, $(`player${this.playerId}-location-stock`), LOCATION_WIDTH, LOCATION_HEIGHT );
        setupLocationCards([this.locationsStock]);

        Object.entries(spots).forEach(([spotNumber, spot]) => {
            const location = spot.location;
            if (location) {
                this.locationsStock.addToStockWithId(getUniqueId(location.type, location.passivePowerGuild ?? 0), `${location.id}`);
            }
        });
    }
    
    public addLord(spot: number, lord: Lord) {
        this.lordsStock.addToStockWithId(getUniqueId(lord.type, lord.guild), `${lord.id}`);
    }
}