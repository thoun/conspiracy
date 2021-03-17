/*declare const define;
declare const ebg;
declare const $;
declare const dojo: Dojo;
declare const _;
declare const g_gamethemeurl;

declare const board: HTMLDivElement;*/

const GUILD_IDS = [1,2,3,4,5];
const LORD_WIDTH = 220;
const LORD_HEIGHT = 220;

const LORDS_IDS = [1,2,3,4,5,6];

class LordsStacks extends AbstractStacks<Lord> {
    private lordsStocks: LordStock[] = [];

    constructor(private game: ConspiracyGame, private visibleLords: { [spot: number]: Lord[] }) {
        super();

        this.pileDiv.addEventListener('click', e => this.onHiddenLordsClick(e));

        GUILD_IDS.forEach(guild => this.lordsStocks[guild] = new LordStock(game, guild, visibleLords[guild]));

        this.pickStock = new ebg.stock() as Stock;
        this.pickStock.create( this.game, this.pickDiv, LORD_WIDTH, LORD_HEIGHT );
        this.pickStock.centerItems = true;
        this.setupLordCards([this.pickStock]);
        this.setPickStockClick();
    }

    get pileDiv(): HTMLDivElement {
        return document.getElementById('lord-hidden-pile') as HTMLDivElement;
    }

    get pickDiv(): HTMLDivElement {
        return document.getElementById('lord-pick') as HTMLDivElement;
    }

    public addLords(lords: Lord[]) {
        const guilds = new Set(lords.map(lord => lord.guild));
        guilds.forEach(guild => this.lordsStocks[guild].addLords(lords.filter(lord => lord.guild === guild)));
    }

    public setSelectable(selectable: boolean) {
        super.setSelectable(selectable);

        this.lordsStocks.forEach(lordStock => lordStock.setSelectable(selectable));
    }

    public discardPick(lords: Lord[]) {
        const guilds = new Set(lords.map(lord => lord.guild));
        guilds.forEach(guild => this.lordsStocks[guild].addLords(lords.filter(lord => lord.guild === guild)));
    }

    protected getCardUniqueId(lord: Lord) {
        return this.getUniqueId(lord.type, lord.guild);
    }

    protected pickClick(control_name: string, item_id: string) {
        // removeAllTo => lordsStocks
        this.game.lordPick(Number(item_id));
        super.pickClick(control_name, item_id);
    }

    private setupLordCards(lordStocks: Stock[]) {
        const cardsurl = `${g_gamethemeurl}img/lords.jpg`;

        lordStocks.forEach(lordStock => 
            GUILD_IDS.forEach((guild, guildIndex) => 
                LORDS_IDS.forEach((id, index) =>
                    lordStock.addItemType(
                        this.getUniqueId(id, guild), 
                        0, 
                        cardsurl, 
                        guildIndex * 20 + index
                    )
                )
            )
        );
    }

    public onHiddenLordsClick(event: MouseEvent) {
        if (!this.selectable) {
            return;
        }

        const number = parseInt((event.target as HTMLDivElement).dataset.number);

        if(!(this.game as any).checkAction('chooseDeckStack')) {
            return;
        }

        this.game.takeAction('chooseLordDeckStack', {
            number
        });
    }

    public onVisibleLordsClick(event: MouseEvent) {
        // TODO
        console.log(event);

        const guild = 3; // TODO
        const lordsNumber = 2 + 2 - 2; // TODO
        const action = lordsNumber === 1 ? 'chooseVisibleStack' : 'chooseVisibleStackMultiple'; // TODO remove multiple
        
        if(!(this.game as any).checkAction(action)) {
            return;
        }

        this.game.takeAction(action, {
            guild
        });
    }
}