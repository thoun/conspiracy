abstract class AbstractStacks<T extends Card> {
    protected selectable: boolean;
    protected pickSelectable: boolean;
    protected pickStock: Stock;

    constructor() {
    }

    protected abstract get pileDiv(): HTMLDivElement;
    protected abstract get pickDiv(): HTMLDivElement;
    protected abstract getCardUniqueId(card: T): number;

    public setSelectable(selectable: boolean) {
        this.selectable = selectable;
        const action = selectable ? 'add' : 'remove';
        this.pileDiv.classList[action]('selectable');
    }

    public setPick(showPick: boolean, pickSelectable: boolean, collection?: T[]) {
        this.pickDiv.style.display = showPick ? 'block' : 'none';
        this.pickSelectable = pickSelectable;
        collection?.forEach(item => this.pickStock.addToStockWithId(this.getCardUniqueId(item), `${item.id}`));
    }

    protected setPickStockClick() {
        dojo.connect(this.pickStock, 'onChangeSelection', this, 'pickClick' );
    }

    protected pickClick(control_name: string, item_id: string) {
        this.pickStock.removeAll();
    }
}