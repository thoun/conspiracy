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

class LordsStacks {
    private selectable: boolean;
    private lordsStocks: LordStock[];

    constructor(private game: ConspiracyGame, private visibleLords: Lord[][]) {
        this.pileDiv.addEventListener('click', e => this.onHiddenLordsClick(e));

        // TODO init lordsStocks with associated visibleLords
    }

    get pileDiv(): HTMLDivElement {
        return document.getElementById('lord-hidden-pile') as HTMLDivElement;
    }
    
    private getCardUniqueId(type: number, guild: number) {
        return type * 10 + guild;
    }

    public setSelectable(selectable: boolean) {
        this.selectable = selectable;
        const action = selectable ? 'add' : 'remove';
        this.pileDiv.classList[action]('selectable');
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