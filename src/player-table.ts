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
        this.setupLordCards([this.lordsStock]);

        Object.entries(spots).forEach(([spotNumber, spot]) => {
            const lord = spot.lord;
            if (lord) {
            this.lordsStock.addToStockWithId(this.getCardUniqueId(lord.type, lord.guild), `${lord.id}`);
            }
        });

        this.locationsStock = new ebg.stock() as Stock;
        this.locationsStock.create( this.game, $(`player${this.playerId}-location-stock`), LOCATION_WIDTH, LOCATION_HEIGHT );
        this.setupLocationCards([this.locationsStock]);

        Object.entries(spots).forEach(([spotNumber, spot]) => {
            const location = spot.location;
            if (location) {
                this.locationsStock.addToStockWithId(this.getCardUniqueId(location.type, location.passivePowerGuild ?? 0), `${location.id}`);
            }
        });
    }
    
    public addLord(spot: number, lord: Lord) {
        this.lordsStock.addToStockWithId(this.getCardUniqueId(lord.type, lord.guild), `${lord.id}`);
    }

    private setupLordCards(lordStocks: Stock[]) {
        const cardsurl = `${g_gamethemeurl}img/lords.jpg`;

        lordStocks.forEach(lordStock => 
            GUILD_IDS.forEach((guild, guildIndex) => 
                LORDS_IDS.forEach((id, index) =>
                    lordStock.addItemType(
                        this.getCardUniqueId(id, guild), 
                        0, 
                        cardsurl, 
                        guildIndex * 20 + index
                    )
                )
            )
        );
    }

    private setupLocationCards(locationStocks: Stock[]) {
        const cardsurl = `${g_gamethemeurl}img/locations.jpg`;

        locationStocks.forEach(locationStock => {
            LOCATIONS_UNIQUE_IDS.forEach((id, index) =>
                locationStock.addItemType(
                    this.getCardUniqueId(id, 0), 
                    0, 
                    cardsurl, 
                    index
                )
            );

            GUILD_IDS.forEach((guild, guildIndex) => 
                LOCATIONS_GUILDS_IDS.forEach((id, index) =>
                    locationStock.addItemType(
                        this.getCardUniqueId(id, guild), 
                        0, 
                        cardsurl, 
                        14 + guildIndex*LOCATIONS_GUILDS_IDS.length + index
                    )
                )
            );
        });
    }
    
    private getCardUniqueId(type: number, guild: number) {
        return type * 10 + guild;
    }
}