import { LordsStacks } from "./lords-stacks.js";
import { LORD_WIDTH, LORD_HEIGHT, setupLordCards, getLordTooltip } from "../stock-utils.js";
import { dojo, StockClass } from "../libs.js";

export const LORD_OVERLAP_WIDTH = 35;
export const LORD_OVERLAP_HEIGHT = 35;

export function updateDisplay(from: string) {
    if (!document.getElementById(this.control_name)) {
        return;
    }
    let topDestination = 0;
    let leftDestination = 0;

    const itemWidth = this.item_width;
    const itemHeight = this.item_height;

    const topDestinations = [];
    const leftDestinations = [];

    this.items.forEach((item, iIndex) => {;
        if (typeof item.loc == "undefined") {
            topDestinations[iIndex] = iIndex * LORD_OVERLAP_HEIGHT;
            leftDestinations[iIndex] = (this.items.length - iIndex - 1) * LORD_OVERLAP_WIDTH;
        }
    });

    for (let i in this.items) {
        topDestination = topDestinations[i];
        leftDestination = leftDestinations[i];

        const item = this.items[i];
        const itemDivId = this.getItemDivId(item.id);

        let $itemDiv = document.getElementById(itemDivId);
        if ($itemDiv) {
            if (typeof item.loc == "undefined") {
                dojo.fx.slideTo({
                    node: $itemDiv,
                    top: topDestination,
                    left: leftDestination,
                    duration: 1000,
                    unit: "px"
                }).play();
            } else {
                this.page.slideToObject($itemDiv, item.loc, 1000).play();
            }

            $itemDiv.style.width = itemWidth + "px";
            $itemDiv.style.height = itemHeight + "px";
            // $itemDiv.style.zIndex = i;
            // $itemDiv.style.backgroundSize = "100% auto";
        } else {
            const type = this.item_type[item.type];
            if (!type) {
                console.error("Stock control: Unknow type: " + type);
            }
            if (typeof itemDivId == "undefined") {
                console.error("Stock control: Undefined item id");
            } else {
                if (typeof itemDivId == "object") {
                    console.error("Stock control: Item id with 'object' type");
                    console.error(itemDivId);
                }
            }
            const image = type.image;
            const extraClasses = this.extraClasses;
            const itemHtml = `<div id="${itemDivId}" class="stockitem ${extraClasses}" style="top:${topDestination}px;left:${leftDestination}px;width:${itemWidth}px;height:${itemHeight}px;;background-image:url('${image}');"></div>`;
            document.getElementById(this.control_name).insertAdjacentHTML('beforeend', itemHtml);
            $itemDiv = document.getElementById(itemDivId);
            if (typeof item.loc != "undefined") {
                this.page.placeOnObject($itemDiv, item.loc);
            }
            if (this.selectable == 0) {
                $itemDiv?.classList.add("stockitem_unselectable");
            }
            $itemDiv?.addEventListener("click", event => this.onClickOnItem(event));
            if (Number(type.image_position) !== 0) {
                let backgroundPositionWidth = 0;
                let backgroundPositionHeight = 0;
                if (this.image_items_per_row) {
                    const rowNumber = Math.floor(type.image_position / this.image_items_per_row);
                    if (!this.image_in_vertical_row) {
                        backgroundPositionWidth = (type.image_position - (rowNumber * this.image_items_per_row)) * 100;
                        backgroundPositionHeight = rowNumber * 100;
                    } else {
                        backgroundPositionHeight = (type.image_position - (rowNumber * this.image_items_per_row)) * 100;
                        backgroundPositionWidth = rowNumber * 100;
                    }
                    $itemDiv.style.backgroundPosition = "-" + backgroundPositionWidth + "% -" + backgroundPositionHeight + "%";
                } else {
                    backgroundPositionWidth = type.image_position * 100;
                    $itemDiv.style.backgroundPosition = "-" + backgroundPositionWidth + "% 0%";
                }
            }
            if (this.onItemCreate) {
                this.onItemCreate($itemDiv, item.type, itemDivId);
            }
            if (typeof from != "undefined") {
                this.page.placeOnObject($itemDiv, from);
                if (typeof item.loc == "undefined") {
                    let anim = dojo.fx.slideTo({
                        node: $itemDiv,
                        top: topDestination,
                        left: leftDestination,
                        duration: 1000,
                        unit: "px"
                    });
                    anim = this.page.transformSlideAnimTo3d(anim, $itemDiv, 1000, null);
                    anim.play();
                } else {
                    this.page.slideToObject($itemDiv, item.loc, 1000).play();
                }
            } else {
                $itemDiv.style.opacity = "0";
                dojo.fadeIn({
                    node: $itemDiv
                }).play();
            }
        }
    }
    /*const controlHeight = (itemHeight + itemMargin) + (this.items.length - 1) * LORD_OVERLAP_HEIGHT;
    const controlWidth = (itemWidth + itemMargin) + (this.items.length - 1) * LORD_OVERLAP_WIDTH;
    if (this.autowidth) {
        if (controlWidth > 0) {
            document.getElementById(this.control_name).style.width = controlWidth + "px";
        }
        if (controlHeight > 0) {
            document.getElementById(this.control_name).style.height = controlHeight + "px";
        }
        
    }

    document.getElementById(this.control_name).style.minHeight = (itemHeight + itemMargin) + "px";*/
}

export class LordStock {
    private stock: Stock;
    protected selectable: boolean;

    constructor(private lordsStacks: LordsStacks, private guild: number, visibleLords: Lord[]) {
        this.stock = new StockClass() as Stock;
        this.stock.setSelectionAppearance('class');
        this.stock.selectionClass = 'no-visible-selection';
        this.stock.create(this.lordsStacks.game.bga.gameui, this.div as HTMLDivElement, LORD_WIDTH, LORD_HEIGHT);
        this.stock.setSelectionMode(0);
        this.stock.onItemCreate = (cardDiv, cardTypeId, cardId) => this.setupNewLordCard(cardDiv, cardTypeId, cardId);
        this.stock.image_items_per_row = 16;
        this.stock.updateDisplay = (from: string) => {
            updateDisplay.apply(this.stock, [from]);
            this.updateSize();
        }
        this.stock.onChangeSelection = () => this.click();
        setupLordCards([this.stock]);

        visibleLords.forEach(lord => this.stock.addToStockWithId(this.lordsStacks.getCardUniqueId(lord), `${lord.id}`));
        //this.updateSize();

        this.div.addEventListener('click', () => this.click());
    }

    getStock(): Stock {
        return this.stock;
    }

    addLords(lords: Lord[]): void {
        lords.forEach(lord => this.stock.addToStockWithId(this.lordsStacks.getCardUniqueId(lord), `${lord.id}`));
    }

    removeAllTo(to: string): void {
        this.stock.removeAllTo(to);
    }

    private updateSize() {
        const size = this.stock.items.length;
        this.div.style.width = `${LORD_WIDTH + (Math.max(size - 1, 0) * LORD_OVERLAP_WIDTH)}px`;
        this.div.style.height = `${LORD_HEIGHT + (Math.max(size - 1, 0) * LORD_OVERLAP_HEIGHT)}px`;
        this.div.style.display = size ? 'inline-block' : 'none';
    }

    get div() {
        return document.getElementById(`lord-visible-stock${this.guild}`);
    }

    public setSelectable(selectable: boolean) {
        this.selectable = selectable;
        const action = selectable ? 'add' : 'remove';
        this.div.classList[action]('selectable');
        this.stock.setSelectionMode(selectable ? 2 : 0);
    }

    private click() {
        if (!this.selectable) {
            return;
        }
        this.lordsStacks.game.lordStockPick(this.guild);
    }

    public setupNewLordCard(card_div: HTMLElement, card_type_id: number, card_id: string) {
        let message = getLordTooltip(card_type_id);

        if (message) {
            this.lordsStacks.game.bga.gameui.addTooltipHtml(card_div.id, message);
        }
    }
}