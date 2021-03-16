/*declare const define;
declare const ebg;
declare const $;
declare const dojo: Dojo;
declare const _;
declare const g_gamethemeurl;

declare const board: HTMLDivElement;*/


const LOCATION_WIDTH = 200;
const LOCATION_HEIGHT = 100;

const LOCATIONS_UNIQUE_IDS = [1,2,3,4,5,6,7,8,9,10,11,12,13,14];
const LOCATIONS_GUILDS_IDS = [100,101];


class LocationsStacks {
    visibleLocationsStock: Stock;

    constructor(private game: ConspiracyGame, visibleLocations: Location[]) {
        dojo.connect( $('location-hidden-pile'), 'click', this, 'onHiddenLocationClick' );

        this.visibleLocationsStock = new ebg.stock() as Stock;
        this.visibleLocationsStock.create( this.game, $('location-visible-stock'), LOCATION_WIDTH, LOCATION_HEIGHT );
        this.visibleLocationsStock.setSelectionMode(1);            
        this.visibleLocationsStock.setSelectionAppearance('class');
        this.visibleLocationsStock.onItemCreate = dojo.hitch( this, 'setupNewLocationCard' ); 
        dojo.connect( this.visibleLocationsStock, 'onChangeSelection', this, 'onVisibleLocationClick' );
        this.setupLocationCards([this.visibleLocationsStock]);

        visibleLocations.forEach(location => this.visibleLocationsStock.addToStockWithId(this.getCardUniqueId(location.type, location.passivePowerGuild ?? 0), `${location.id}`));
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

    public setupNewLocationCard( card_div: HTMLDivElement, card_type_id: number, card_id: string ) {
        // TODO (this as any).addTooltip( card_div.id, this.mowCards.getTooltip(card_type_id), '' );
    }

    public onHiddenLocationClick(a, b) {
        // TODO
        console.log(a, b);

        

        const number = 2 + 2 - 2; // TODO
        const action = number === 1 ? 'chooseOneOnStack' : 'chooseDeckStack'

        if(!(this.game as any).checkAction(action)) {
            return;
        }

        this.game.takeAction(action, {
            number
        });
    }

    public onVisibleLocationClick(a, b) {
        // TODO
        console.log(a, b);

        
        if(!(this.game as any).checkAction('chooseVisibleLocation')) {
            return;
        }

        this.game.takeAction('chooseVisibleLocation');
    }

}