class PlayerTableSpotStock {
    private playerId: number;
    private lordsStock: Stock;
    private locationsStock: Stock;

    constructor(
        private game: ConspiracyGame, 
        private playerTable: PlayerTable,
        player: Player,
        private spot: PlayerTableSpot,
        private spotNumber: number) {

        this.playerId = Number(player.id);

        dojo.place(`<div id="player-table-${this.playerId}-spot${spotNumber}" class="player-table-spot spot${spotNumber}">
                <div id="player${this.playerId}-spot${spotNumber}-lord-stock"></div>
                <div id="player${this.playerId}-spot${spotNumber}-location-stock" class="player-table-spot-location"></div>
                <div id="player${this.playerId}-spot${spotNumber}-token" class="player-table-spot-token"></div>
        </div>`, `player-table-${this.playerId}`);

        this.lordsStock = new ebg.stock() as Stock;
        this.lordsStock.create( this.game, $(`player${this.playerId}-spot${spotNumber}-lord-stock`), LORD_WIDTH, LORD_HEIGHT );
        this.lordsStock.setSelectionMode(0);
        this.lordsStock.setSelectionAppearance('class');
        dojo.connect(this.lordsStock, 'onChangeSelection', this, 'onLordSelection');
        setupLordCards([this.lordsStock]);

        const lord = spot.lord;
        if (lord) {
            this.lordsStock.addToStockWithId(getUniqueId(lord.type, lord.guild), `${lord.id}`);
        }

        this.locationsStock = new ebg.stock() as Stock;
        this.locationsStock.create( this.game, $(`player${this.playerId}-spot${spotNumber}-location-stock`), LOCATION_WIDTH, LOCATION_HEIGHT );
        this.locationsStock.setSelectionMode(0);
        setupLocationCards([this.locationsStock]);

        
        const location = spot.location;
        if (location) {
            this.locationsStock.addToStockWithId(getUniqueId(location.type, location.passivePowerGuild ?? 0), `${location.id}`);
        }
    }

    public getLord(): Lord {
        return this.spot.lord;
    }
    
    public setLord(lord: Lord) {
        if (this.spot.lord) {
            this.lordsStock.removeFromStockById(`${this.spot.lord.id}`);
        }
        this.lordsStock.addToStockWithId(getUniqueId(lord.type, lord.guild), `${lord.id}`);
        this.spot.lord = lord;
        
    }

    public setLocation(location: Location) {
        if (this.spot.location) {
            this.locationsStock.removeFromStockById(`${this.spot.location.id}`);
        }
        this.locationsStock.addToStockWithId(getUniqueId(location.type, location.passivePowerGuild ?? 0), `${location.id}`);
        this.spot.location = location;
    }

    public setSelectableForSwitch(selectable: boolean): void {
        if (!this.spot.lord) {
            return;
        }

        if (this.spot.lord.key) { // can't switch
            dojo.toggleClass(`player${this.playerId}-spot${this.spotNumber}-lord-stock_item_${this.spot.lord.id}`, 'disabled', selectable);
        } else { // can switch
            this.lordsStock.setSelectionMode(selectable ? 2 : 0);
            dojo.toggleClass(`player${this.playerId}-spot${this.spotNumber}-lord-stock_item_${this.spot.lord.id}`, 'selectable', selectable);
            
            if (!selectable) {
                this.lordsStock.unselectAll();
            }
        }
    }

    onLordSelection() {
        const items = this.lordsStock.getSelectedItems();
        if (items.length == 1) {
            this.playerTable.addSelectedSpot(this.spotNumber);
        } else if (items.length == 0) {
            this.playerTable.removeSelectedSpot(this.spotNumber);
        }
    }

    public placeTopLordToken() {
        const tokenWrapper = document.getElementById(`player${this.playerId}-spot${this.spotNumber}-token`);
        const guild = this.spot.lord.guild;
        const tokenDiv = document.getElementById(`top-lord-token-${guild}-${this.playerId}`);
        tokenWrapper.appendChild(tokenDiv);
    }
}