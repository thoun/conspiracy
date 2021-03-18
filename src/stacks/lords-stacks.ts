/*declare const define;
declare const ebg;
declare const $;
declare const dojo: Dojo;
declare const _;
declare const g_gamethemeurl;

declare const board: HTMLDivElement;*/

class LordsStacks extends AbstractStacks<Lord> {
    private lordsStocks: LordStock[] = [];

    constructor(public game: ConspiracyGame, visibleLords: { [spot: number]: Lord[] }) {
        super();

        this.pileDiv.addEventListener('click', e => this.onHiddenLordsClick(e));

        GUILD_IDS.forEach(guild => this.lordsStocks[guild] = new LordStock(this, guild, visibleLords[guild]));

        this.pickStock = new ebg.stock() as Stock;
        this.pickStock.create( this.game, this.pickDiv.children[0], LORD_WIDTH, LORD_HEIGHT );
        this.pickStock.centerItems = true;
        setupLordCards([this.pickStock]);
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

    public getCardUniqueId(lord: Lord) {
        return getUniqueId(lord.type, lord.guild);
    }

    protected pickClick(control_name: string, item_id: string) {
        // removeAllTo => lordsStocks
        this.game.lordPick(Number(item_id));
        super.pickClick(control_name, item_id);
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
}