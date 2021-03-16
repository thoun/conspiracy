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

    constructor(private game: ConspiracyGame, private visibleLords: Lord[][]) {
    }
    
    private getCardUniqueId(type: number, guild: number) {
        return type * 10 + guild;
    }

    public setSelectable(selectable: boolean) {
        this.selectable = selectable;
        const action = selectable ? 'add' : 'remove';
        document.getElementById('lord-hidden-pile').classList[action]('visible');
    }

    public onHiddenLordsClick(a, b) {
        // TODO
        console.log(a, b);

        

        const number = 2 + 2 - 2; // TODO
        const action = number === 1 ? 'chooseOneOnStack' : 'chooseDeckStack';

        if(!(this.game as any).checkAction(action)) {
            return;
        }

        this.game.takeAction(action.replace('choose', 'chooseLord'), {
            number
        });
    }

    public onVisibleLordsClick(a, b) {
        // TODO
        console.log(a, b);

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