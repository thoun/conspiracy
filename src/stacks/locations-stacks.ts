/*declare const define;
declare const ebg;
declare const $;
declare const dojo: Dojo;
declare const _;
declare const g_gamethemeurl;

declare const board: HTMLDivElement;*/




class LocationsStacks extends AbstractStacks<Location> {
    visibleLocationsStock: Stock;

    constructor(private game: ConspiracyGame, visibleLocations: Location[]) {
        super();

        this.pileDiv.addEventListener('click', e => this.onHiddenLocationClick(e));

        this.visibleLocationsStock = new ebg.stock() as Stock;
        this.visibleLocationsStock.create( this.game, $('location-visible-stock'), LOCATION_WIDTH, LOCATION_HEIGHT );
        this.visibleLocationsStock.setSelectionMode(1);            
        this.visibleLocationsStock.setSelectionAppearance('class');
        this.visibleLocationsStock.onItemCreate = dojo.hitch( this, 'setupNewLocationCard' ); 
        dojo.connect( this.visibleLocationsStock, 'onChangeSelection', this, 'onVisibleLocationClick' );
        
        this.pickStock = new ebg.stock() as Stock;
        this.pickStock.create( this.game, this.pickDiv.children[0], LOCATION_WIDTH, LOCATION_HEIGHT );
        this.pickStock.centerItems = true;
        this.setPickStockClick();

        setupLocationCards([this.visibleLocationsStock, this.pickStock]);        

        visibleLocations.forEach(location => this.visibleLocationsStock.addToStockWithId(this.getCardUniqueId(location), `${location.id}`));
    }

    get pileDiv(): HTMLDivElement {
        return document.getElementById('location-hidden-pile') as HTMLDivElement;
    }

    get pickDiv(): HTMLDivElement {
        return document.getElementById('location-pick') as HTMLDivElement;
    }

    protected getCardUniqueId(location: Location) {
        return getUniqueId(location.type, location.passivePowerGuild ?? 0);
    }

    protected pickClick(control_name: string, item_id: string) {
        // removeAllTo => lordsStocks
        this.game.locationPick(Number(item_id));
        super.pickClick(control_name, item_id);
    }

    public setupNewLocationCard( card_div: HTMLDivElement, card_type_id: number, card_id: string ) {
        // TODO (this as any).addTooltip( card_div.id, this.mowCards.getTooltip(card_type_id), '' );
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

    public onVisibleLocationClick(event: MouseEvent) {
        // TODO
        console.log(event);

        
        if(!(this.game as any).checkAction('chooseVisibleLocation')) {
            return;
        }

        this.game.takeAction('chooseVisibleLocation');
    }

}