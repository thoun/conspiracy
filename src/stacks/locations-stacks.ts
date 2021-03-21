class LocationsStacks extends AbstractStacks<Location> {
    visibleLocationsStock: Stock;

    constructor(private game: ConspiracyGame, visibleLocations: Location[], pickLocations: Location[]) {
        super();

        this.pileDiv.addEventListener('click', e => this.onHiddenLocationClick(e));

        this.visibleLocationsStock = new ebg.stock() as Stock;
        this.visibleLocationsStock.create(this.game, $('location-visible-stock'), LOCATION_WIDTH, LOCATION_HEIGHT);
        this.visibleLocationsStock.setSelectionMode(0);
        this.visibleLocationsStock.setSelectionAppearance('class');
        this.visibleLocationsStock.onItemCreate = dojo.hitch( this, 'setupNewLocationCard' ); 
        dojo.connect(this.visibleLocationsStock, 'onChangeSelection', this, 'onVisibleLocationClick');
        
        this.pickStock = new ebg.stock() as Stock;
        this.pickStock.create(this.game, this.pickDiv.children[0], LOCATION_WIDTH, LOCATION_HEIGHT);
        this.pickStock.centerItems = true;
        this.pickStock.onItemCreate = dojo.hitch(this, 'setupNewLocationCard'); 
        this.setPickStockClick();

        setupLocationCards([this.visibleLocationsStock, this.pickStock]);        

        visibleLocations.forEach(location => this.visibleLocationsStock.addToStockWithId(this.getCardUniqueId(location), `${location.id}`));
        pickLocations.forEach(location => this.pickStock.addToStockWithId(this.getCardUniqueId(location), `${location.id}`));
    }

    get pileDiv(): HTMLDivElement {
        return document.getElementById('location-hidden-pile') as HTMLDivElement;
    }

    get pickDiv(): HTMLDivElement {
        return document.getElementById('location-pick') as HTMLDivElement;
    }

    public setSelectable(selectable: boolean, limitToHidden?: number, allHidden?: boolean) {
        super.setSelectable(selectable, limitToHidden, allHidden);

        this.visibleLocationsStock.setSelectionMode(selectable && !allHidden ? 1 : 0); 
    }

    public discardVisible() {
        this.visibleLocationsStock.removeAll();
    }

    public discardPick(locations: Location[]) {
        locations.forEach(location => this.visibleLocationsStock.addToStockWithId(this.getCardUniqueId(location), `${location.id}`));
    }

    protected getCardUniqueId(location: Location) {
        return getUniqueId(location.type, location.passivePowerGuild ?? 0);
    }

    protected pickClick(control_name: string, item_id: string) {
        console.log('pickClick', item_id, this.pickStock);
        // TODO removeAllTo => locationsStocks
        this.game.locationPick(Number(item_id));
        super.pickClick(control_name, item_id);
    }

    public setupNewLocationCard( card_div: HTMLDivElement, card_type_id: number, card_id: string ) {
        let message = getLocationTooltip(card_type_id);

        if (message) {
            (this.game as any).addTooltip(card_div.id, message, '');
        }
    }

    public onHiddenLocationClick(event: MouseEvent) {
        if (!this.selectable) {
            return;
        }

        const number = parseInt((event.target as HTMLDivElement).dataset.number);

        if(!(this.game as any).checkAction('chooseDeckStack')) {
            return;
        }

        this.game.takeAction('chooseLocationDeckStack', {
            number
        });
    }

    public onVisibleLocationClick(control_name: string, item_id: string) {
        if(!(this.game as any).checkAction('chooseVisibleLocation')) {
            return;
        }

        this.game.takeAction('chooseVisibleLocation', {
            id: item_id
        });
    }
    
    public removeLocation(location: Location) {
        this.visibleLocationsStock.removeFromStockById(`${location.id}`);
    }

}