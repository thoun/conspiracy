abstract class AbstractStacks<T extends Card> {
    protected selectable: boolean;
    protected pickSelectable: boolean;
    protected pickStock: Stock;

    constructor() {
    }

    protected abstract get pileDiv(): HTMLDivElement;
    protected abstract get pickDiv(): HTMLDivElement;
    protected abstract getCardUniqueId(card: T): number;
    protected abstract pickClick(control_name: string, item_id: string): void;
    public abstract getStockContaining(cardId: string): Stock;

    public setSelectable(selectable: boolean, limitToHidden?: number, allHidden?: boolean) {
        this.selectable = selectable;
        const action = selectable ? 'add' : 'remove';
        this.pileDiv.classList[action]('selectable');

        const buttons = Array.from(this.pileDiv.getElementsByClassName('button'));

        if (limitToHidden) {
            if (selectable) {
                buttons.filter((button: HTMLDivElement) => parseInt(button.dataset.number) !== limitToHidden)
                    .forEach(button => button.classList.add('hidden'));
            }
        }

        if (!selectable) {
            buttons.forEach(button => button.classList.remove('hidden'));
        }

        // if player has all hidden location, we replace the 3 buttons by one special for the rest of the game
        if (allHidden && buttons.length > 1) {
            document.getElementById('location-hidden-pile').innerHTML = '<div class="button eye" data-number="0"></div>';
        }
    }

    public setPick(showPick: boolean, pickSelectable: boolean, from: string | number = null, collection?: T[]) {
        this.pickDiv.style.display = showPick ? 'block' : 'none';
        const action = pickSelectable ? 'add' : 'remove';
        this.pickDiv.classList[action]('selectable');
        this.pickSelectable = pickSelectable;
        if (collection) {
            // TODO ? SHOULD NOT BE NECESSARY this.pickStock.removeAll();

            if (typeof from === 'number') {
                collection.forEach(item => moveToAnotherStock(this.getGuildStock(from), this.pickStock, this.getCardUniqueId(item), `${item.id}`));
            } else {
                collection.forEach(item => this.pickStock.addToStockWithId(this.getCardUniqueId(item), `${item.id}`, from));
            }
        }        
    }

    protected getGuildStock(guild: number): Stock {
        throw new Error("Must be overriden");
    }

    protected setPickStockClick() {
        dojo.connect(this.pickStock, 'onChangeSelection', this, 'pickClick' );
    }
}