class PlayerTable {
    lordsStock: Stock;
    locationsStock: Stock;

    constructor(
        private game: ConspiracyGame, 
        private playerId: string,
        private spots: PlayerTableSpot[],
        private readonly: boolean = true) {

        dojo.place(`<div id="player-table-${playerId}">
            Player ${playerId} lords : <div id="player${playerId}-lord-stock"></div>
            Player ${playerId} locations : <div id="player${playerId}-location-stock"></div>
        </div>`, 'players-tables')

        this.lordsStock = new ebg.stock() as Stock;
        this.lordsStock.create( this.game, $(`player${playerId}-lord-stock`), LORD_WIDTH, LORD_HEIGHT );
        this.setupLordCards([this.lordsStock]);

        spots.forEach(spots => {
            const lord = spots.lord;
            if (lord) {
            this.lordsStock.addToStockWithId(this.getCardUniqueId(lord.type, lord.guild), `${lord.id}`);
            }
        });

        this.locationsStock = new ebg.stock() as Stock;
        this.locationsStock.create( this.game, $(`player${playerId}-location-stock`), LOCATION_WIDTH, LOCATION_HEIGHT );
        this.setupLocationCards([this.locationsStock]);

        spots.forEach(spots => {
            const location = spots.location;
            if (location) {
                this.locationsStock.addToStockWithId(this.getCardUniqueId(location.type, location.passivePowerGuild ?? 0), `${location.id}`);
            }
        });
    }

    public setupLordCards(lordStocks: Stock[]) {
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

    public setupLocationCards(locationStocks: Stock[]) {
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