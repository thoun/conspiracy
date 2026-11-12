/*declare const define;
declare const ebg;
declare const $;
declare const dojo: Dojo;
declare const _;
declare const g_gamethemeurl;

declare const board: HTMLDivElement;*/
const GUILD_IDS = [1, 2, 3, 4, 5];
const LORDS_IDS = [1, 2, 3, 4, 5, 6];
const LOCATIONS_UNIQUE_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
const LOCATIONS_GUILDS_IDS = [100, 101];
const LOCATIONS_BONUS_IDS = [21, 22, 23, 24, 25];
const LORD_WIDTH = 207.26;
const LORD_HEIGHT = 207;
const LOCATION_WIDTH = 186.24;
const LOCATION_HEIGHT = 124;
function getUniqueId(type, guild) {
    return type * 10 + guild;
}
function setupLordCards(lordStocks) {
    const cardsurl = `${g_gamethemeurl}img/lords.jpg`;
    lordStocks.forEach(lordStock => GUILD_IDS.forEach((guild, guildIndex) => LORDS_IDS.forEach((lordType, index) => lordStock.addItemType(getUniqueId(lordType, guild), 0, cardsurl, 1 + guildIndex * LORDS_IDS.length + index))));
}
function setupLocationCards(locationStocks) {
    const cardsurl = `${g_gamethemeurl}img/locations.jpg`;
    const bonuscardsurl = `${g_gamethemeurl}img/bonus-locations.jpg`;
    locationStocks.forEach(locationStock => {
        locationStock.addItemType(0, 0, cardsurl, 0);
        LOCATIONS_UNIQUE_IDS.forEach((id, index) => locationStock.addItemType(getUniqueId(id, 0), 0, cardsurl, 1 + index));
        GUILD_IDS.forEach((guild, guildIndex) => LOCATIONS_GUILDS_IDS.forEach((id, index) => locationStock.addItemType(getUniqueId(id, guild), 0, cardsurl, 15 + GUILD_IDS.length * index + guildIndex)));
        LOCATIONS_BONUS_IDS.forEach((id, index) => locationStock.addItemType(getUniqueId(id, 0), 0, bonuscardsurl, index));
    });
}
function getGuildName(guild) {
    let guildName = null;
    switch (guild) {
        case 1:
            guildName = _('Farmer');
            break;
        case 2:
            guildName = _('Military');
            break;
        case 3:
            guildName = _('Merchant');
            break;
        case 4:
            guildName = _('Politician');
            break;
        case 5:
            guildName = _('Mage');
            break;
    }
    return guildName;
}
function getLocationTooltip(typeWithGuild) {
    const type = Math.floor(typeWithGuild / 10);
    const guild = typeWithGuild % 10;
    const allianceMessage = _("At the end of the game, the biggest Alliance of Lords of ${lordIP} IP is identified. This location is worth ${scoreIP} IP per Lord in this alliance.");
    let message = null;
    switch (type) {
        case 1:
            message = _("At the end of the game, this Location is worth 7 IP.");
            break;
        case 2:
            message = _("Immediately gain 1 Pearl. At the end of the game, this Location is worth 5 IP.");
            break;
        case 3:
            message = _("Immediately gain 2 Pearls. At the end of the game, this Location is worth 4 IP.");
            break;
        case 4:
            message = _("Immediately gain 3 Pearls. At the end of the game, this Location is worth 3 IP.");
            break;
        case 5:
            message = _("At the end of the game, this Location is worth 1 IP per silver key held in your Senate Chamber, regardless of whether or not it has been used to take control of a Location.");
            break;
        case 6:
            message = _("At the end of the game, this Location is worth 2 IP per gold key held in your Senate Chamber, regardless of whether or not it has been used to take control of a Location.");
            break;
        case 7:
            message = _("At the end of the game, this Location is worth 1 IP per pair of Pearls in your possession.");
            break;
        case 8:
            message = _("At the end of the game, this Location is worth 2 IP per Location in your control.");
            break;
        case 9:
            message = _("Until your next turn, each opponent MUST only increase the size of their Senate Chamber by taking the first Lord from the deck. At the end of the game, this Location is worth 3 IP.");
            break;
        case 10:
            message = _("Until your next turn, each opponent MUST only increase the size of their Senate Chamber by taking first 2 Lords from the deck. Adding one to their Senate Chamber and discarding the other. At the end of the game, this Location is worth 3 IP.");
            break;
        case 11:
            message = _("Immediately replace all the discarded Lords in to the Lord deck and reshuffle. At the end of the game, this Location is worth 3 IP.");
            break;
        case 12:
            message = _("Immediately replace all the available Locations to the Location deck and reshuffle. At the end of the game, this Location is worth 3 IP.");
            break;
        case 13:
            message = _("Until the end of the game, to take control of a Location, only 2 keys are needed, irrespective of their type. At the end of the game, this Location is worth 3 IP.");
            break;
        case 14:
            message = _("Until the end of the game, when you take control of a Location, you choose this location from the Location deck (No longer from the available Locations). The deck is then reshuffled. At the end of the game, this Location is worth 3 IP.");
            break;
        case 21:
            message = allianceMessage.replace(/\$\{(lordIP|scoreIP)\}/g, '1');
            break;
        case 22:
            message = allianceMessage.replace(/\$\{(lordIP|scoreIP)\}/g, '2');
            break;
        case 23:
            message = allianceMessage.replace(/\$\{(lordIP|scoreIP)\}/g, (_, key) => key === 'lordIP' ? '3' : '2');
            break;
        case 24:
            message = allianceMessage.replace(/\$\{(lordIP|scoreIP)\}/g, (_, key) => key === 'lordIP' ? '4' : '2');
            break;
        case 25:
            message = _("At the end of the game, this Location is worth 1 IP + a bonus of 1 IP per Lord who does not give you either a pearl or a key (Lords of 0 and 6 IP).");
            break;
        case 100:
            message = guild ?
                _("At the end of the game, this Location is worth as many IP as your most influential ${guild_name} Lord.").split('${guild_name}').join(getGuildName(guild).toString()) :
                _("At the end of the game, this Location is worth as many IP as your most influential Lord of the indicated color.");
            break;
        case 101:
            message = guild ?
                _("At the end of the game, this Location is worth 1 IP + a bonus of 1 IP per ${guild_name} Lord present in your Senate Chamber.").split('${guild_name}').join(getGuildName(guild).toString()) :
                _("At the end of the game, this Location is worth 1 IP + a bonus of 1 IP per Lord of the indicated color present in your Senate Chamber.");
            break;
    }
    return message;
}
function getLordTooltip(typeWithGuild) {
    const type = Math.floor(typeWithGuild / 10);
    const guild = typeWithGuild % 10;
    let message = null;
    switch (type) {
        case 1:
            message = _("When this Lord is placed in the Senate Chamber, two Lords in this Chamber (including this one) can be swapped places, except those with keys.");
            break;
        case 2:
            message = _("This Lord gives you 1 silver key.");
            break;
        case 3:
            message = _("This Lord gives you 1 gold key.");
            break;
        case 4:
            message = _("This Lord gives you 2 Pearls.");
            break;
        case 5:
            message = _("This Lord gives you 1 Pearl.");
            break;
        case 6:
            message = _("When this Lord is placed in the Senate Chamber, the top Lord card is taken from the Lord deck and placed in the corresponding discard pile.");
            break;
    }
    if (message) {
        message += `
        <br/><br/>
        ${_("Points :")} <strong>${type == 6 ? type : type - 1}</strong>
        <br/><br/>
        ${_("Guild : ${guild_name}").split('${guild_name}').join(getGuildName(guild).toString())}
        `;
    }
    return message;
}
function moveToAnotherStock(sourceStock, destinationStock, uniqueId, cardId) {
    if (sourceStock === destinationStock) {
        return;
    }
    const sourceStockItemId = `${sourceStock.container_div.id}_item_${cardId}`;
    if (document.getElementById(sourceStockItemId)) {
        destinationStock.addToStockWithId(uniqueId, cardId, sourceStockItemId);
        sourceStock.removeFromStockById(cardId);
    }
    else {
        console.warn(`${sourceStockItemId} not found in `, sourceStock);
        destinationStock.addToStockWithId(uniqueId, cardId, sourceStock.container_div.id);
    }
}

class AbstractStacks {
    constructor(game) {
        this.game = game;
        this.max = 3;
        this.allHidden = false;
    }
    setSelectable(selectable, limitToHidden, allHidden) {
        this.selectable = selectable;
        const action = selectable ? 'add' : 'remove';
        this.pileDiv.classList[action]('selectable');
        const buttons = Array.from(this.pileDiv.getElementsByClassName('button'));
        if (limitToHidden !== null) {
            const adjustedLimitToHidden = Math.min(this.max, limitToHidden);
            if (selectable) {
                buttons.filter((button) => parseInt(button.dataset.number) !== adjustedLimitToHidden)
                    .forEach(button => button.classList.add('hidden'));
            }
        }
        if (!selectable) {
            buttons.forEach(button => button.classList.remove('hidden'));
        }
        // if player has all hidden location, we replace the 3 buttons by one special for the rest of the game
        if (allHidden && buttons.length > 1) {
            this.allHidden = true;
            document.getElementById('location-hidden-pile').innerHTML = '<div role="button" class="button eye location-hidden-pile-eye-tooltip" data-number="0"></div>';
            this.game.bga.gameui.addTooltipHtml('location-hidden-pile-eye-tooltip', _("As you have the See all deck location, you can pick a location from all deck, but you cannot pick visible locations."));
        }
    }
    setMax(max) {
        this.max = max;
        if (max !== 0 && !this.allHidden && max < 3) {
            const buttons = Array.from(this.pileDiv.getElementsByClassName('button'));
            buttons.filter((button) => parseInt(button.dataset.number) > max)
                .forEach(button => button.classList.add('max'));
        }
    }
    setPick(showPick, pickSelectable, collection) {
        if (collection) {
            this.pickStock.items.filter(item => !collection.some(i => item.id === `${i.id}`)).forEach(item => this.pickStock.removeFromStockById(`${item.id}`));
            setTimeout(() => this.pickStock.updateDisplay(), 100);
        }
        this.pickDiv.style.display = showPick ? 'block' : 'none';
        const action = pickSelectable ? 'add' : 'remove';
        this.pickDiv.classList[action]('selectable');
        this.pickSelectable = pickSelectable;
        collection?.filter(item => !this.pickStock.items.some(i => i.id === `${item.id}`)).forEach(item => {
            const from = this.getStockContaining(`${item.id}`);
            if (from) {
                moveToAnotherStock(from, this.pickStock, this.getCardUniqueId(item), `${item.id}`);
            }
            else {
                this.pickStock.addToStockWithId(this.getCardUniqueId(item), `${item.id}`, this.pileDiv.id);
            }
        });
    }
    getGuildStock(guild) {
        throw new Error("Must be overriden");
    }
    setPickStockClick() {
        this.pickStock.onChangeSelection = (controlName, itemId) => this.pickClick(controlName, itemId);
    }
}

const [dojoRuntime] = await globalThis.importDojoLibs(['dojo', 'dojo/fx', 'dojo/_base/fx']);
const [CounterClass, StockClass, PopinDialogClass] = await globalThis.importDojoLibs([
    'ebg/counter', 'ebg/stock', 'ebg/popindialog',
]);
const BgaZoom = await globalThis.importEsmLib('bga-zoom', '1.x');
const dojo = dojoRuntime;

const LORD_OVERLAP_WIDTH = 35;
const LORD_OVERLAP_HEIGHT = 35;
function updateDisplay(from) {
    if (!document.getElementById(this.control_name)) {
        return;
    }
    let topDestination = 0;
    let leftDestination = 0;
    const itemWidth = this.item_width;
    const itemHeight = this.item_height;
    const topDestinations = [];
    const leftDestinations = [];
    this.items.forEach((item, iIndex) => {
        ;
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
            }
            else {
                this.page.slideToObject($itemDiv, item.loc, 1000).play();
            }
            $itemDiv.style.width = itemWidth + "px";
            $itemDiv.style.height = itemHeight + "px";
            // $itemDiv.style.zIndex = i;
            // $itemDiv.style.backgroundSize = "100% auto";
        }
        else {
            const type = this.item_type[item.type];
            if (!type) {
                console.error("Stock control: Unknow type: " + type);
            }
            if (typeof itemDivId == "undefined") {
                console.error("Stock control: Undefined item id");
            }
            else {
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
                    }
                    else {
                        backgroundPositionHeight = (type.image_position - (rowNumber * this.image_items_per_row)) * 100;
                        backgroundPositionWidth = rowNumber * 100;
                    }
                    $itemDiv.style.backgroundPosition = "-" + backgroundPositionWidth + "% -" + backgroundPositionHeight + "%";
                }
                else {
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
                }
                else {
                    this.page.slideToObject($itemDiv, item.loc, 1000).play();
                }
            }
            else {
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
class LordStock {
    constructor(lordsStacks, guild, visibleLords) {
        this.lordsStacks = lordsStacks;
        this.guild = guild;
        this.stock = new StockClass();
        this.stock.setSelectionAppearance('class');
        this.stock.selectionClass = 'no-visible-selection';
        this.stock.create(this.lordsStacks.game.bga.gameui, this.div, LORD_WIDTH, LORD_HEIGHT);
        this.stock.setSelectionMode(0);
        this.stock.onItemCreate = (cardDiv, cardTypeId, cardId) => this.setupNewLordCard(cardDiv, cardTypeId, cardId);
        this.stock.image_items_per_row = 16;
        this.stock.updateDisplay = (from) => {
            updateDisplay.apply(this.stock, [from]);
            this.updateSize();
        };
        this.stock.onChangeSelection = () => this.click();
        setupLordCards([this.stock]);
        visibleLords.forEach(lord => this.stock.addToStockWithId(this.lordsStacks.getCardUniqueId(lord), `${lord.id}`));
        //this.updateSize();
        this.div.addEventListener('click', () => this.click());
    }
    getStock() {
        return this.stock;
    }
    addLords(lords) {
        lords.forEach(lord => this.stock.addToStockWithId(this.lordsStacks.getCardUniqueId(lord), `${lord.id}`));
    }
    removeAllTo(to) {
        this.stock.removeAllTo(to);
    }
    updateSize() {
        const size = this.stock.items.length;
        this.div.style.width = `${LORD_WIDTH + (Math.max(size - 1, 0) * LORD_OVERLAP_WIDTH)}px`;
        this.div.style.height = `${LORD_HEIGHT + (Math.max(size - 1, 0) * LORD_OVERLAP_HEIGHT)}px`;
        this.div.style.display = size ? 'inline-block' : 'none';
    }
    get div() {
        return document.getElementById(`lord-visible-stock${this.guild}`);
    }
    setSelectable(selectable) {
        this.selectable = selectable;
        const action = selectable ? 'add' : 'remove';
        this.div.classList[action]('selectable');
        this.stock.setSelectionMode(selectable ? 2 : 0);
    }
    click() {
        if (!this.selectable) {
            return;
        }
        this.lordsStacks.game.lordStockPick(this.guild);
    }
    setupNewLordCard(card_div, card_type_id, card_id) {
        let message = getLordTooltip(card_type_id);
        if (message) {
            this.lordsStacks.game.bga.gameui.addTooltipHtml(card_div.id, message);
        }
    }
}

class LordsStacks extends AbstractStacks {
    constructor(game, visibleLords, pickLords) {
        super(game);
        this.lordsStocks = [];
        this.pileDiv.addEventListener('click', (e) => this.onHiddenLordsClick(e));
        Array.from(this.pileDiv.getElementsByClassName('button')).forEach(button => button.addEventListener('click', (e) => this.onHiddenLordsClick(e)));
        GUILD_IDS.forEach(guild => this.lordsStocks[guild] = new LordStock(this, guild, visibleLords[guild]));
        this.pickStock = new StockClass();
        this.pickStock.setSelectionAppearance('class');
        this.pickStock.selectionClass = 'no-visible-selection';
        this.pickStock.create(this.game.bga.gameui, this.pickDiv.children[0], LORD_WIDTH, LORD_HEIGHT);
        this.pickStock.centerItems = true;
        this.pickStock.image_items_per_row = 16;
        this.pickStock.onItemCreate = (cardDiv, cardTypeId, cardId) => this.setupNewLordCard(cardDiv, cardTypeId, cardId);
        setupLordCards([this.pickStock]);
        this.setPickStockClick();
        pickLords.forEach(lord => this.pickStock.addToStockWithId(this.getCardUniqueId(lord), `${lord.id}`));
        this.game.bga.gameui.addTooltipHtmlToClass('lord-hidden-pile-tooltip', _("Reveal 1 to 3 hidden lords. Choose one, the others are discarded"));
    }
    get pileDiv() {
        return document.getElementById('lord-hidden-pile');
    }
    get pickDiv() {
        return document.getElementById('lord-pick');
    }
    getStockContaining(lordId) {
        if (this.pickStock.items.some(item => item.id === lordId)) {
            return this.pickStock;
        }
        else {
            const guild = GUILD_IDS.find(guild => this.lordsStocks[guild].getStock().items.some(item => item.id === lordId));
            if (guild) {
                return this.lordsStocks[guild].getStock();
            }
        }
        return null;
    }
    discardVisible() {
        GUILD_IDS.forEach(guild => this.lordsStocks[guild].removeAllTo('lord-hidden-pile'));
    }
    addLords(lords) {
        const guilds = new Set(lords.map(lord => lord.guild));
        guilds.forEach(guild => this.lordsStocks[guild].addLords(lords.filter(lord => lord.guild === guild)));
    }
    setSelectable(selectable, limitToHidden, allHidden) {
        super.setSelectable(selectable, limitToHidden, allHidden);
        if (!selectable || !limitToHidden) {
            this.lordsStocks.forEach(lordStock => lordStock.setSelectable(selectable));
        }
    }
    setSelectablePiles(piles) {
        GUILD_IDS.forEach(guild => this.lordsStocks[guild].setSelectable(piles.includes(guild)));
    }
    hasPickCards() {
        return this.pickStock.items.length > 0;
    }
    discardPick(lords) {
        const guilds = new Set(lords.map(lord => lord.guild));
        guilds.forEach(guild => lords.filter(lord => lord.guild === guild).forEach(lord => moveToAnotherStock(this.pickStock, this.lordsStocks[guild].getStock(), this.getCardUniqueId(lord), `${lord.id}`)));
    }
    getCardUniqueId(lord) {
        return getUniqueId(lord.type, lord.guild);
    }
    pickClick(control_name, item_id) {
        this.game.lordPick(Number(item_id));
    }
    onHiddenLordsClick(event) {
        if (!this.selectable) {
            return;
        }
        const number = parseInt(event.target.dataset.number);
        if (isNaN(number)) {
            return;
        }
        this.game.chooseLordDeckStack(number);
        event.stopPropagation();
    }
    setupNewLordCard(card_div, card_type_id, card_id) {
        let message = getLordTooltip(card_type_id);
        if (message) {
            this.game.bga.gameui.addTooltipHtml(card_div.id, message);
        }
    }
    getGuildStock(guild) {
        return this.lordsStocks[guild].getStock();
    }
}

class LocationsStacks extends AbstractStacks {
    constructor(game, visibleLocations, pickLocations) {
        super(game);
        this.pileDiv.addEventListener('click', (e) => this.onHiddenLocationClick(e));
        Array.from(this.pileDiv.getElementsByClassName('button')).forEach(button => button.addEventListener('click', (e) => this.onHiddenLocationClick(e)));
        this.visibleLocationsStock = new StockClass();
        this.visibleLocationsStock.setSelectionAppearance('class');
        this.visibleLocationsStock.selectionClass = 'no-visible-selection';
        this.visibleLocationsStock.create(this.game.bga.gameui, document.getElementById('location-visible-stock'), LOCATION_WIDTH, LOCATION_HEIGHT);
        this.visibleLocationsStock.setSelectionMode(0);
        this.visibleLocationsStock.onItemCreate = (cardDiv, cardTypeId, cardId) => this.setupNewLocationCard(cardDiv, cardTypeId, cardId);
        this.visibleLocationsStock.image_items_per_row = 13;
        this.visibleLocationsStock.onChangeSelection = (controlName, itemId) => this.onVisibleLocationClick(controlName, itemId);
        this.pickStock = new StockClass();
        this.pickStock.setSelectionAppearance('class');
        this.pickStock.selectionClass = 'no-visible-selection';
        this.pickStock.create(this.game.bga.gameui, this.pickDiv.children[0], LOCATION_WIDTH, LOCATION_HEIGHT);
        this.pickStock.centerItems = true;
        this.pickStock.onItemCreate = (cardDiv, cardTypeId, cardId) => this.setupNewLocationCard(cardDiv, cardTypeId, cardId);
        this.pickStock.image_items_per_row = 13;
        this.setPickStockClick();
        setupLocationCards([this.visibleLocationsStock, this.pickStock]);
        visibleLocations.forEach(location => this.visibleLocationsStock.addToStockWithId(this.getCardUniqueId(location), `${location.id}`));
        pickLocations.forEach(location => this.pickStock.addToStockWithId(this.getCardUniqueId(location), `${location.id}`));
        this.game.bga.gameui.addTooltipHtmlToClass('location-hidden-pile-tooltip', _("Reveal 1 to 3 hidden locations. Choose one, the others are discarded"));
    }
    get pileDiv() {
        return document.getElementById('location-hidden-pile');
    }
    get pickDiv() {
        return document.getElementById('location-pick');
    }
    getStockContaining(locationId) {
        if (this.pickStock.items.some(item => item.id === locationId)) {
            return this.pickStock;
        }
        else if (this.visibleLocationsStock.items.some(item => item.id === locationId)) {
            return this.visibleLocationsStock;
        }
        return null;
    }
    setSelectable(selectable, limitToHidden, allHidden) {
        super.setSelectable(selectable, limitToHidden, allHidden);
        const visibleSelectable = selectable && !allHidden;
        this.visibleLocationsStock.setSelectionMode(visibleSelectable ? 1 : 0);
        const action = visibleSelectable && this.visibleLocationsStock.items.length ? 'add' : 'remove';
        this.visibleLocationsStock.container_div.classList[action]('selectable');
    }
    discardVisible() {
        this.visibleLocationsStock.removeAllTo('location-hidden-pile');
    }
    discardPick(locations) {
        locations.forEach(location => moveToAnotherStock(this.pickStock, this.visibleLocationsStock, this.getCardUniqueId(location), `${location.id}`));
    }
    getCardUniqueId(location) {
        return getUniqueId(location.type, location.passivePowerGuild ?? 0);
    }
    pickClick(control_name, item_id) {
        this.game.locationPick(Number(item_id));
    }
    setupNewLocationCard(card_div, card_type_id, card_id) {
        let message = getLocationTooltip(card_type_id);
        if (message) {
            this.game.bga.gameui.addTooltipHtml(card_div.id, message);
        }
    }
    onHiddenLocationClick(event) {
        if (!this.selectable) {
            return;
        }
        const number = parseInt(event.target.dataset.number);
        if (isNaN(number)) {
            return;
        }
        this.game.chooseLocationDeckStack(number);
        event.stopPropagation();
    }
    onVisibleLocationClick(control_name, item_id) {
        if (!item_id) {
            return;
        }
        this.game.chooseVisibleLocation(item_id);
    }
}

function slideToObjectAndAttach(game, object, destinationId, posX, posY) {
    const destination = document.getElementById(destinationId);
    if (destination.contains(object)) {
        return;
    }
    object.style.zIndex = '10';
    const animation = (posX || posY) ?
        game.slideToObjectPos(object, destinationId, posX, posY) :
        game.slideToObject(object, destinationId);
    dojo.connect(animation, 'onEnd', () => {
        object.style.top = 'unset';
        object.style.left = 'unset';
        object.style.position = 'relative';
        object.style.zIndex = 'unset';
        destination.appendChild(object);
    });
    animation.play();
}

class PlayerTableSpotStock {
    constructor(game, playerTable, player, spot, spotNumber) {
        this.game = game;
        this.playerTable = playerTable;
        this.spot = spot;
        this.spotNumber = spotNumber;
        this.playerId = Number(player.id);
        const playerSpotHtml = `<div id="player-table-${this.playerId}-spot${spotNumber}" class="player-table-spot spot${spotNumber}">
                <div id="player${this.playerId}-spot${spotNumber}-lord-stock"></div>
                <div id="player${this.playerId}-spot${spotNumber}-location-stock" class="player-table-spot-location"></div>
                <div id="player${this.playerId}-spot${spotNumber}-token" class="player-table-spot-token"></div>
        </div>`;
        document.getElementById(`player-table-${this.playerId}`).insertAdjacentHTML('beforeend', playerSpotHtml);
        this.lordsStock = new StockClass();
        this.lordsStock.create(this.game.bga.gameui, document.getElementById(`player${this.playerId}-spot${spotNumber}-lord-stock`), LORD_WIDTH, LORD_HEIGHT);
        this.lordsStock.setSelectionMode(0);
        this.lordsStock.setSelectionAppearance('class');
        this.lordsStock.selectionClass = 'selected';
        this.lordsStock.onItemCreate = (cardDiv, cardTypeId, cardId) => this.setupNewLordCard(cardDiv, cardTypeId, cardId);
        this.lordsStock.image_items_per_row = 16;
        this.lordsStock.onChangeSelection = () => this.onLordSelection();
        setupLordCards([this.lordsStock]);
        const lord = spot.lord;
        if (lord) {
            this.lordsStock.addToStockWithId(getUniqueId(lord.type, lord.guild), `${lord.id}`);
        }
        this.locationsStock = new StockClass();
        this.locationsStock.create(this.game.bga.gameui, document.getElementById(`player${this.playerId}-spot${spotNumber}-location-stock`), LOCATION_WIDTH, LOCATION_HEIGHT);
        this.locationsStock.setSelectionMode(0);
        this.locationsStock.onItemCreate = (cardDiv, cardTypeId, cardId) => this.setupNewLocationCard(cardDiv, cardTypeId, cardId);
        this.locationsStock.image_items_per_row = 13;
        setupLocationCards([this.locationsStock]);
        const location = spot.location;
        if (location) {
            this.locationsStock.addToStockWithId(this.playerId == 0 ? 0 : getUniqueId(location.type, location.passivePowerGuild ?? 0), `${location.id}`);
        }
    }
    hasLord() {
        return !!this.spot.lord;
    }
    hasLocation() {
        return !!this.spot.location;
    }
    getLordStock() {
        return this.lordsStock;
    }
    get tokenWrapper() {
        return document.getElementById(`player${this.playerId}-spot${this.spotNumber}-token`);
    }
    getLord() {
        return this.spot.lord;
    }
    setLord(lord, fromStock) {
        if (fromStock) {
            moveToAnotherStock(fromStock, this.lordsStock, getUniqueId(lord.type, lord.guild), `${lord.id}`);
        }
        else {
            this.lordsStock.addToStockWithId(getUniqueId(lord.type, lord.guild), `${lord.id}`, 'lord-hidden-pile');
        }
        this.spot.lord = lord;
    }
    setLocation(location, fromStock) {
        if (fromStock) {
            moveToAnotherStock(fromStock, this.locationsStock, this.playerId == 0 ? 0 : getUniqueId(location.type, location.passivePowerGuild ?? 0), `${location.id}`);
        }
        else {
            this.locationsStock.addToStockWithId(this.playerId == 0 ? 0 : getUniqueId(location.type, location.passivePowerGuild ?? 0), `${location.id}`, 'location-hidden-pile');
        }
        this.spot.location = location;
    }
    setSelectableForSwap(selectable) {
        if (!this.spot.lord) {
            return;
        }
        if (this.spot.lord.key) { // can't swap
            document.getElementById(`player${this.playerId}-spot${this.spotNumber}-lord-stock_item_${this.spot.lord.id}`)?.classList.toggle('disabled', selectable);
        }
        else { // can swap
            this.lordsStock.setSelectionMode(selectable ? 2 : 0);
            document.getElementById(`player${this.playerId}-spot${this.spotNumber}-lord-stock_item_${this.spot.lord.id}`)?.classList.toggle('selectable', selectable);
            if (!selectable) {
                this.lordsStock.unselectAll();
            }
        }
    }
    onLordSelection() {
        const items = this.lordsStock.getSelectedItems();
        if (items.length == 1) {
            this.playerTable.addSelectedSpot(this.spotNumber);
        }
        else if (items.length == 0) {
            this.playerTable.removeSelectedSpot(this.spotNumber);
        }
    }
    placeTopLordToken() {
        const guild = this.spot.lord.guild;
        const tokenDiv = document.getElementById(`top-lord-token-${guild}-${this.playerId}`);
        this.addTokenDiv(tokenDiv);
    }
    setupNewLordCard(card_div, card_type_id, card_id) {
        let message = getLordTooltip(card_type_id);
        if (message) {
            this.game.bga.gameui.addTooltipHtml(card_div.id, message);
        }
    }
    setupNewLocationCard(card_div, card_type_id, card_id) {
        let message = getLocationTooltip(card_type_id);
        if (message) {
            this.game.bga.gameui.addTooltipHtml(card_div.id, message);
        }
    }
    addTokenDiv(tokenDiv) {
        slideToObjectAndAttach(this.game.bga.gameui, tokenDiv, this.tokenWrapper.id);
    }
    getTokenDiv() {
        return this.tokenWrapper.getElementsByTagName('div')[0];
    }
    highlightLord(guild = null) {
        const cardId = this.lordsStock.items[0]?.id;
        cardId && document.getElementById(`${this.lordsStock.container_div.id}_item_${cardId}`).classList.add(`highlight${guild ? `-guild${guild}` : ''}`);
    }
    clearLordHighlight() {
        const cardId = this.lordsStock.items[0]?.id;
        cardId && document.getElementById(`${this.lordsStock.container_div.id}_item_${cardId}`).classList.remove('highlight');
    }
    highlightLocation() {
        const cardId = this.locationsStock.items[0]?.id;
        cardId && document.getElementById(`${this.locationsStock.container_div.id}_item_${cardId}`).classList.add('highlight');
    }
    markForbiddenKey() {
        if (!this.locationsStock.items.length) {
            const lordType = Math.floor(this.lordsStock.items[0].type / 10);
            if ([2, 3].includes(lordType)) {
                document.getElementById(`player${this.playerId}-spot${this.spotNumber}-location-stock`).classList.add('forbidden-key');
            }
        }
    }
}

const SPOTS_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
class PlayerTable {
    constructor(game, player, spots) {
        this.game = game;
        this.spotsStock = [];
        this.swapSpots = null;
        this.playerId = Number(player.id);
        const playerTableHtml = `<div id="player-table-wrapper-${this.playerId}" class="player-table-wrapper">
            <div id="player-table-mat-${this.playerId}" class="player-table-mat mat${player.mat}">
                <div id="player-table-${this.playerId}" class="player-table">
                    <div class="board-player-name mat${player.mat}" style="color: #${player.color};">
                        ${player.name || _('Legendary opponent')}
                    </div>
                </div>
            </div>
        </div>`;
        document.getElementById('players-tables').insertAdjacentHTML('beforeend', playerTableHtml);
        SPOTS_NUMBERS.forEach(spotNumber => {
            this.spotsStock[spotNumber] = new PlayerTableSpotStock(game, this, player, spots[spotNumber], spotNumber);
            if (spots[spotNumber].location) {
                this.markForbiddenKeysTo(spotNumber);
            }
        });
        this.checkTopLordToken();
    }
    checkTopLordToken() {
        const lordsSpots = this.spotsStock.filter(spotStock => spotStock.getLord());
        const guilds = new Set(lordsSpots.map(spotStock => spotStock.getLord().guild));
        guilds.forEach(guild => {
            const guildLordsSpots = lordsSpots.filter(spotStock => spotStock.getLord().guild === guild);
            let topLordSpot = guildLordsSpots[0];
            guildLordsSpots.forEach(spot => {
                if (spot.getLord().points > topLordSpot.getLord().points) {
                    topLordSpot = spot;
                }
            });
            topLordSpot.placeTopLordToken();
        });
    }
    addLord(spot, lord, fromStock) {
        this.spotsStock[spot].setLord(lord, fromStock);
        setTimeout(() => this.checkTopLordToken(), 500);
    }
    addLocation(spot, location, fromStock) {
        this.spotsStock[spot].setLocation(location, fromStock);
        this.markForbiddenKeysTo(spot);
    }
    markForbiddenKeysTo(spot) {
        for (let i = 1; i < spot; i++) {
            this.spotsStock[i].markForbiddenKey();
        }
    }
    setSelectableForSwap(selectable) {
        this.swapSpots = selectable ? [] : null;
        SPOTS_NUMBERS.forEach(spotNumber => this.spotsStock[spotNumber].setSelectableForSwap(selectable));
    }
    removeSelectedSpot(spot) {
        if (!this.swapSpots) {
            return false;
        }
        const index = this.swapSpots.indexOf(spot);
        if (index !== -1) {
            this.swapSpots.splice(index, 1);
            this.setCanSwap();
        }
    }
    addSelectedSpot(spot) {
        if (!this.swapSpots) {
            return false;
        }
        if (!this.swapSpots.some(val => val === spot)) {
            this.swapSpots.push(spot);
            this.setCanSwap();
        }
    }
    setCanSwap() {
        this.game.setCanSwap(this.swapSpots);
    }
    lordSwapped(args) {
        const lordSpot1 = this.spotsStock[args.spot1].getLord();
        const lordSpot2 = this.spotsStock[args.spot2].getLord();
        const tokenSpot1 = this.spotsStock[args.spot1].getTokenDiv();
        const tokenSpot2 = this.spotsStock[args.spot2].getTokenDiv();
        this.spotsStock[args.spot1].setLord(lordSpot2, this.spotsStock[args.spot2].getLordStock());
        this.spotsStock[args.spot2].setLord(lordSpot1, this.spotsStock[args.spot1].getLordStock());
        if (tokenSpot2) {
            setTimeout(() => this.spotsStock[args.spot1].addTokenDiv(tokenSpot2), 500);
        }
        if (tokenSpot1) {
            setTimeout(() => this.spotsStock[args.spot2].addTokenDiv(tokenSpot1), 500);
        }
    }
    highlightCoalition(coalition) {
        this.spotsStock.filter(spotStock => spotStock.hasLord()).forEach(spotStock => spotStock.clearLordHighlight());
        coalition.alreadyCounted.forEach(spotNumber => this.spotsStock[spotNumber].highlightLord(coalition.guild));
    }
    highlightLocations() {
        this.spotsStock.filter(spotStock => spotStock.hasLocation()).forEach(spotStock => spotStock.highlightLocation());
    }
    highlightTopLords() {
        this.spotsStock.filter(spotStock => spotStock.hasLord() && !!spotStock.getTokenDiv()).forEach(spotStock => spotStock.highlightLord());
    }
}

const GUILD_COLOR = [];
GUILD_COLOR[1] = '#E0CA4E';
GUILD_COLOR[2] = '#DB6646';
GUILD_COLOR[3] = '#037552';
GUILD_COLOR[4] = '#0096D2';
GUILD_COLOR[5] = '#74549F';
class Minimap {
    constructor(playerId, spots) {
        this.playerId = playerId;
        let html = `<div id="minimap-${playerId}" class="minimap">`;
        SPOTS_NUMBERS.forEach(spotNumber => html += `<div class="player-table-spot spot${spotNumber}"></div>`);
        html += `</div>`;
        document.getElementById(`lord-counter-wrapper-${playerId}`).insertAdjacentHTML('beforeend', html);
        SPOTS_NUMBERS.filter(spotNumber => !!spots[spotNumber - 1].lord).forEach(spotNumber => this.setGuildToSpot(spotNumber, spots[spotNumber - 1].lord.guild));
    }
    setGuildToSpot(spotNumber, guild) {
        document.getElementById(`minimap-${this.playerId}`).getElementsByClassName(`spot${spotNumber}`)[0].style.background = GUILD_COLOR[guild];
    }
    addLord(spot, lord) {
        this.setGuildToSpot(spot, lord.guild);
    }
    lordSwapped(args) {
        const colorLordSpot1 = document.getElementById(`minimap-${this.playerId}`).getElementsByClassName(`spot${args.spot1}`)[0].style.background;
        const colorLordSpot2 = document.getElementById(`minimap-${this.playerId}`).getElementsByClassName(`spot${args.spot2}`)[0].style.background;
        document.getElementById(`minimap-${this.playerId}`).getElementsByClassName(`spot${args.spot1}`)[0].style.background = colorLordSpot2;
        document.getElementById(`minimap-${this.playerId}`).getElementsByClassName(`spot${args.spot2}`)[0].style.background = colorLordSpot1;
    }
}

const ANIMATION_MS = 500;
const SCORE_MS = 1500;
const isDebug = window.location.host == 'studio.boardgamearena.com';
const log = isDebug ? console.log.bind(window.console) : function () { };
const LOG_GUILD_COLOR = [];
LOG_GUILD_COLOR[1] = '#c1950b';
LOG_GUILD_COLOR[2] = '#770405';
LOG_GUILD_COLOR[3] = '#097138';
LOG_GUILD_COLOR[4] = '#011d4d';
LOG_GUILD_COLOR[5] = '#522886';
const LOCAL_STORAGE_ZOOM_KEY = 'Conspiracy-zoom';
class Game {
    constructor(bga) {
        this.playersTables = [];
        this.minimaps = [];
        this.pearlCounters = [];
        this.silverKeyCounters = [];
        this.goldKeyCounters = [];
        this.playerInPopin = null;
        this.isTouch = window.matchMedia('(hover: none)').matches;
        this.bga = bga;
    }
    /*
        setup:

        This method must set up the game user interface according to current game situation specified
        in parameters.

        The method is called each time the game interface is displayed to a player, ie:
        _ when the game starts
        _ when a player refreshes the game page (F5)

        "gamedatas" argument contains all datas retrieved by your "getAllDatas" PHP method.
    */
    setup(gamedatas) {
        // ignore loading of some pictures
        this.bga.images.dontPreloadImage('eye-shadow.png');
        this.bga.images.dontPreloadImage('publisher.png');
        if (!gamedatas.bonusLocations) {
            this.bga.images.dontPreloadImage('bonus-locations.jpg');
        }
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter(i => !Object.values(gamedatas.players).some(player => Number(player.mat) === i)).forEach(i => this.bga.images.dontPreloadImage(`playmat_${i}.jpg`));
        [1, 2, 3, 4, 5].filter(i => i != gamedatas.opponent?.lord).forEach(i => this.bga.images.dontPreloadImage(`sololord${i}.jpg`));
        log("Starting game setup");
        if (gamedatas.opponent) {
            gamedatas.opponent.name = _('Legendary opponent');
        }
        this.gamedatas = gamedatas;
        log('gamedatas', gamedatas);
        this.createLayout();
        this.createPlayerPanels(gamedatas);
        this.lordsStacks = new LordsStacks(this, gamedatas.visibleLords, gamedatas.pickLords);
        this.lordCounter = new CounterClass();
        this.lordCounter.create('remaining-lord-counter');
        this.setRemainingLords(gamedatas.remainingLords);
        this.locationsStacks = new LocationsStacks(this, gamedatas.visibleLocations, gamedatas.pickLocations);
        this.locationCounter = new CounterClass();
        this.locationCounter.create('remaining-location-counter');
        this.setRemainingLocations(gamedatas.remainingLocations);
        this.createPlayerTables(gamedatas);
        this.zoomManager = new BgaZoom.Manager({
            element: document.getElementById('full-table'),
            localStorageZoomKey: LOCAL_STORAGE_ZOOM_KEY,
            zoomControls: {
                color: 'white',
            },
        });
        if (gamedatas.endTurn) {
            this.notif_lastTurn();
        }
        if (Number(gamedatas.gamestate.id) >= 80) { // score or end
            this.onEnteringShowScore(true);
        }
        this.addHelp();
        this.setupNotifications();
        this.bga.userPreferences.onChange = (prefId, prefValue) => this.onPreferenceChange(prefId, prefValue);
        if (this.bga.gameui.bgaInternal.flags['ingame_player_panels']) {
            setTimeout(() => {
                Object.keys(gamedatas.players).forEach(playerId => {
                    const playerPanel = document.getElementById(`overall_player_board_${playerId}`);
                    const playerTable = document.getElementById(`player-table-${playerId}`).querySelector('.board-player-name');
                    playerTable.innerHTML = '';
                    playerTable.insertAdjacentElement('beforeend', playerPanel);
                    playerTable.style.color = 'black';
                    playerTable.style.fontWeight = 'inherit';
                    playerTable.style.minWidth = '280px';
                    playerTable.style.top = '-195px';
                    playerTable.style.left = 'calc(50% - 140px)';
                    playerTable.style.textAlign = 'inherit';
                    playerTable.parentElement.parentElement.style.marginTop = '200px';
                });
            });
        }
        log("Ending game setup");
    }
    createLayout() {
        const gameArea = this.bga.gameArea.getElement();
        if (gameArea.querySelector('#full-table')) {
            return;
        }
        const scoreColumns = [null, 'lords', 'locations', 'coalition', 'masterPearl', null];
        const cardTypes = ['lord', 'location'];
        const drawCounts = [1, 2, 3];
        gameArea.insertAdjacentHTML('beforeend', `
            <div id="score">
                <table>
                    <thead>
                        <tr>
                            ${scoreColumns.map(column => column
            ? `<th id="th-${column}-score" class="${column}-score"></th>`
            : '<th></th>').join('')}
                        </tr>
                    </thead>
                    <tbody id="score-table-body"></tbody>
                </table>
            </div>
            <div id="full-table">
                <div id="stacks">
                    ${cardTypes.map(type => `
                        <div id="${type}-stacks" class="stacks whiteblock">
                            <div id="${type}-hidden-pile" class="hidden-pile ${type}-hidden-pile-tooltip">
                                ${drawCounts.map(number => `
                                    <div role="button" id="${type}-hidden-pile${number}" class="button${number === 1 ? ' left-radius' : number === 3 ? ' right-radius' : ''} ${type}-hidden-pile-tooltip" data-number="${number}">${number}</div>
                                `).join('')}
                            </div>
                            <div id="remaining-${type}-counter" class="remaining-counter"></div>
                            ${type === 'lord' ? `
                                <div id="lord-visible-stocks">
                                    ${GUILD_IDS.map(guild => `<div id="lord-visible-stock${guild}"></div>`).join('')}
                                </div>
                            ` : '<div id="location-visible-stock"></div>'}
                        </div>
                        <div id="${type}-pick" class="pick-stock whiteblock">
                            <div id="${type}-pick-stock"></div>
                        </div>
                    `).join('')}
                </div>
                <div id="players-tables"></div>
            </div>
        `);
    }
    ///////////////////////////////////////////////////
    //// Game & client states
    // onEnteringState: this method is called each time we are entering into a new game state.
    //                  You can use this method to perform some user interface changes at this moment.
    //
    onEnteringState(stateName, args) {
        log('Entering state: ' + stateName, args.args);
        switch (stateName) {
            case 'lordStackSelection':
                const argsLordStackSelection = args.args;
                if (argsLordStackSelection) {
                    const limitToHidden = argsLordStackSelection.limitToHidden;
                    const active = this.bga.players.isCurrentPlayerActive();
                    let lordStackTitle;
                    if (argsLordStackSelection.opponentTurn) {
                        lordStackTitle = active ? _('${you} must choose lords from a discard pile') : '';
                    }
                    else if (limitToHidden === 1) {
                        lordStackTitle = active ? _('${you} must take the first lord from the deck (Location constraint)') : _('${actplayer} must take the first lord from the deck (Location constraint)');
                    }
                    else if (limitToHidden === 2) {
                        lordStackTitle = active ? _('${you} must take two lords from the deck and choose one (Location constraint)') : _('${actplayer} must take two lords from the deck and choose one (Location constraint)');
                    }
                    else {
                        lordStackTitle = active ? _('${you} must choose lords from deck or from a discard pile') : _('${actplayer} must choose lords from deck or from a discard pile');
                    }
                    if (argsLordStackSelection.opponentTurn) {
                        lordStackTitle += ` (${_("OPPONENT'S TURN")})`;
                    }
                    this.bga.statusBar.setTitle(lordStackTitle, argsLordStackSelection);
                    this.onEnteringLordStackSelection(argsLordStackSelection);
                }
                break;
            case 'lordSelection':
                const argsLordSelection = args.args;
                const multiple = argsLordSelection.multiple;
                const number = argsLordSelection.lords?.length;
                const active = this.bga.players.isCurrentPlayerActive();
                let lordSelectionTitle = multiple
                    ? (number > 1
                        ? (active ? _('${you} must choose the first lord to place') : _('${actplayer} must choose the first lord to place'))
                        : (active ? _('${you} must must place the last lord') : _('${actplayer} must place the last lord')))
                    : (active ? _('${you} must choose the lord to recruit') : _('${actplayer} must choose the lord to recruit'));
                if (argsLordSelection.opponentTurn) {
                    lordSelectionTitle += ` (${_("OPPONENT'S TURN")})`;
                }
                this.bga.statusBar.setTitle(lordSelectionTitle, argsLordSelection);
                this.onEnteringLordSelection(args.args);
                break;
            case 'lordPlacement':
                if (args.args) {
                    this.onEnteringLordPlacement(args.args);
                }
                break;
            case 'lordSwap':
                this.onEnteringLordSwap();
                break;
            case 'locationStackSelection':
                const argsLocationStackSelection = args.args;
                const allHidden = argsLocationStackSelection.allHidden;
                const locationTitle = allHidden
                    ? (this.bga.players.isCurrentPlayerActive() ? _('${you} must choose a location from all deck (Location constraint)') : _('${actplayer} must choose a location from all deck (Location constraint)'))
                    : (this.bga.players.isCurrentPlayerActive() ? _('${you} must choose a location from the deck or discard pile') : _('${actplayer} must choose a location from the deck or discard pile'));
                this.bga.statusBar.setTitle(locationTitle, argsLocationStackSelection);
                this.onEnteringLocationStackSelection(args.args);
                break;
            case 'locationSelection':
                this.onEnteringLocationSelection(args.args);
                break;
            case 'addLocation':
                this.onEnteringLocationPlacement(args.args);
                break;
            case 'showScore':
                const playersIds = Object.keys(this.gamedatas.players);
                if (playersIds.length == 1) {
                    playersIds.push(0);
                }
                playersIds.forEach(playerId => this.bga.playerPanels.getScoreCounter(Number(playerId)).setValue(0));
                this.onEnteringShowScore();
                break;
        }
    }
    onEnteringLordStackSelection(args) {
        this.lordsStacks.setMax(args.max);
        if (this.bga.players.isCurrentPlayerActive()) {
            this.lordsStacks.setSelectable(true, args.opponentTurn ? 0 : args.limitToHidden);
            if (args.opponentTurn && args.piles.length) {
                this.lordsStacks.setSelectablePiles(args.piles);
            }
        }
    }
    onEnteringLordSelection(args) {
        this.lordsStacks.setPick(true, this.bga.players.isCurrentPlayerActive(), args.lords);
        this.setRemainingLords(args.remainingLords);
    }
    onEnteringLordPlacement(args) {
        this.setRemainingLords(args.remainingLords);
    }
    onEnteringLordSwap() {
        if (this.bga.players.isCurrentPlayerActive()) {
            this.swapSpots = [];
            this.playersTables[this.bga.gameui.player_id].setSelectableForSwap(true);
        }
    }
    onEnteringLocationStackSelection(args) {
        this.locationsStacks.setMax(args.max);
        if (this.bga.players.isCurrentPlayerActive()) {
            this.locationsStacks.setSelectable(true, null, args.allHidden);
        }
    }
    onEnteringLocationSelection(args) {
        this.locationsStacks.setPick(true, this.bga.players.isCurrentPlayerActive(), args.locations);
        this.setRemainingLocations(args.remainingLocations);
    }
    onEnteringLocationPlacement(args) {
        this.setRemainingLocations(args.remainingLocations);
    }
    onEnteringShowScore(fromReload = false) {
        this.gamedatas.hiddenScore = false;
        this.closePopin();
        const lastTurnBar = document.getElementById('last-round');
        if (lastTurnBar) {
            lastTurnBar.style.display = 'none';
        }
        document.getElementById('stacks').style.display = 'none';
        document.getElementById('score').style.display = 'flex';
        const players = Object.values(this.gamedatas.players);
        if (players.length == 1) {
            players.push(this.gamedatas.opponent);
        }
        players.forEach(player => {
            //if we are a reload of end state, we display values, else we wait for notifications
            const score = fromReload ? player.newScore : null;
            const scoreRowHtml = `<tr id="score${player.id}">
                <td class="player-name" style="color: #${player.color}">${player.name}</td>
                <td id="lords-score${player.id}" class="score-number lords-score">${score?.lords !== undefined ? score.lords : ''}</td>
                <td id="locations-score${player.id}" class="score-number locations-score">${score?.locations !== undefined ? score.locations : ''}</td>
                <td id="coalition-score${player.id}" class="score-number coalition-score">${score?.coalition !== undefined ? score.coalition : ''}</td>
                <td id="masterPearl-score${player.id}" class="score-number masterPearl-score">${score?.pearlMaster !== undefined ? score.pearlMaster : ''}</td>
                <td class="score-number total">${score?.total !== undefined ? score.total : ''}</td>
            </tr>`;
            document.getElementById('score-table-body').insertAdjacentHTML('beforeend', scoreRowHtml);
        });
        this.bga.gameui.addTooltipHtmlToClass('lords-score', _("The total of Influence Points from the Lords with the Coat of Arms tokens (the most influential Lord of each color in your Senate Chamber)."));
        this.bga.gameui.addTooltipHtmlToClass('locations-score', _("The total of Influence Points from the Locations you control."));
        this.bga.gameui.addTooltipHtmlToClass('coalition-score', _("The biggest area of adjacent Lords of the same color is identified and 3 points are scored for each Lord within it"));
        this.bga.gameui.addTooltipHtmlToClass('masterPearl-score', _("The player who has the Pearl Master token gains a bonus of 5 Influence Points."));
        if (this.zoomManager.zoom == 1 && !document.getElementById('page-content').style.zoom) {
            // scale down 
            Array.from(document.getElementsByClassName('player-table-wrapper')).forEach(elem => elem.classList.add('scaled-down'));
        }
    }
    // onLeavingState: this method is called each time we are leaving a game state.
    //                 You can use this method to perform some user interface changes at this moment.
    //
    onLeavingState(stateName) {
        log('Leaving state: ' + stateName);
        switch (stateName) {
            case 'lordStackSelection':
                this.onLeavingLordStackSelection();
                break;
            case 'lordSelection':
                this.onLeavingLordSelection();
                break;
            case 'lordSwap':
                this.onLeavingLordSwap();
                break;
            case 'locationStackSelection':
                this.onLeavingLocationStackSelection();
                break;
            case 'locationSelection':
                this.onLeavingLocationSelection();
                break;
        }
    }
    onLeavingLordStackSelection() {
        this.lordsStacks.setSelectable(false, null);
    }
    onLeavingLordSelection() {
        this.lordsStacks.setPick(this.lordsStacks.hasPickCards(), false);
    }
    onLeavingLordSwap() {
        if (this.bga.players.isCurrentPlayerActive()) {
            this.playersTables[this.bga.gameui.player_id].setSelectableForSwap(false);
        }
        this.swapSpots = null;
    }
    onLeavingLocationStackSelection() {
        this.locationsStacks.setSelectable(false);
    }
    onLeavingLocationSelection() {
        this.locationsStacks.setSelectable(false);
    }
    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    onUpdateActionButtons(stateName, args) {
        if (this.bga.players.isCurrentPlayerActive()) {
            switch (stateName) {
                case 'lordStackSelection':
                    if (this.isTouch) {
                        const lordArgs = args;
                        if (lordArgs.limitToHidden !== null) {
                            const adjustedLimitToHidden = Math.min(lordArgs.max, lordArgs.limitToHidden);
                            this.bga.gameui.addActionButton(`chooseLordDeckStack${adjustedLimitToHidden}_button`, _("Pick ${number} from deck").replace('${number}', '' + adjustedLimitToHidden), () => this.chooseLordDeckStack(adjustedLimitToHidden));
                        }
                        else {
                            for (let i = 1; i <= 3 && i <= lordArgs.max; i++) {
                                this.bga.gameui.addActionButton(`chooseLordDeckStack${i}_button`, _("Pick ${number} from deck").replace('${number}', '' + i), () => this.chooseLordDeckStack(i));
                            }
                        }
                    }
                    break;
                case 'lordSwap':
                    this.bga.gameui.addActionButton('swap_button', _("Swap"), () => this.onSwap());
                    this.bga.gameui.addActionButton('dontSwap_button', _("Don't swap"), () => this.onDontSwap(), null, false, 'red');
                    document.getElementById('swap_button')?.classList.add('disabled');
                    break;
                case 'locationStackSelection':
                    if (this.isTouch) {
                        const locationArgs = args;
                        if (!locationArgs.allHidden) {
                            for (let i = 1; i <= 3 && i <= locationArgs.max; i++) {
                                this.bga.gameui.addActionButton(`chooseLordDeckStack${i}_button`, _("Pick ${number} from deck").replace('${number}', '' + i), () => this.chooseLocationDeckStack(i));
                            }
                        }
                    }
                    break;
                case 'useReplay':
                    this.bga.gameui.addActionButton('useReplayToen_button', _("Use Replay token"), () => this.useReplayToken(1));
                    this.bga.gameui.addActionButton('dontUseReplayToen_button', _("Don't use Replay token"), () => this.useReplayToken(2));
                    break;
            }
        }
    }
    ///////////////////////////////////////////////////
    //// Utility methods
    ///////////////////////////////////////////////////
    onPreferenceChange(prefId, prefValue) {
        switch (prefId) {
            case 201:
                document.getElementsByTagName('html')[0].dataset.showForbidden = (prefValue == 1).toString();
                break;
        }
    }
    createViewPlayermatPopin() {
        document.body.insertAdjacentHTML('beforeend', `<div id="popin_showPlayermat_container" class="conspiracy_popin_container">
            <div id="popin_showPlayermat_underlay" class="conspiracy_popin_underlay"></div>
                <div id="popin_showPlayermat_wrapper" class="conspiracy_popin_wrapper">
                <div id="popin_showPlayermat" class="conspiracy_popin">
                    <a id="popin_showPlayermat_close" class="closeicon"><i class="fa fa-times fa-2x" aria-hidden="true"></i></a>
                    <a id="popin_showPlayermat_left" class="left arrow"></a>
                    <a id="popin_showPlayermat_right" class="right arrow"></a>
                                
                    <div id="playermat-container-modal" class="player-table-wrapper" style="touch-action: pan-y; user-select: none; -webkit-user-drag: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0);">
                    </div>
                </div>
            </div>
        </div>`);
        document.getElementById(`popin_showPlayermat_close`).addEventListener('click', () => this.closePopin());
        document.getElementById(`popin_showPlayermat_left`).addEventListener('click', () => this.changePopinPlayer(-1));
        document.getElementById(`popin_showPlayermat_right`).addEventListener('click', () => this.changePopinPlayer(1));
    }
    movePlayerTableToPopin(playerId) {
        document.getElementById('playermat-container-modal').style.zoom = document.getElementById('page-content').style.zoom;
        this.playerInPopin = playerId;
        document.getElementById('popin_showPlayermat_container').style.display = 'block';
        document.getElementById('playermat-container-modal').appendChild(document.getElementById(`player-table-mat-${playerId}`));
    }
    closePopin() {
        if (this.playerInPopin === null) {
            return;
        }
        document.getElementById('popin_showPlayermat_container').style.display = 'none';
        document.getElementById(`player-table-wrapper-${this.playerInPopin}`).appendChild(document.getElementById(`player-table-mat-${this.playerInPopin}`));
        this.playerInPopin = null;
    }
    changePopinPlayer(delta) {
        document.getElementById(`player-table-wrapper-${this.playerInPopin}`).appendChild(document.getElementById(`player-table-mat-${this.playerInPopin}`));
        const playerIds = this.gamedatas.playerorder.map(val => Number(val));
        this.playerInPopin = playerIds[(playerIds.indexOf(this.playerInPopin) + delta) % playerIds.length];
        document.getElementById('playermat-container-modal').appendChild(document.getElementById(`player-table-mat-${this.playerInPopin}`));
    }
    createPlayerPanels(gamedatas) {
        this.createViewPlayermatPopin();
        const players = Object.values(gamedatas.players);
        const solo = players.length === 1;
        if (solo) {
            this.bga.playerPanels.addAutomataPlayerPanel(0, _("Legendary opponent"), {
                score: gamedatas.opponent.score,
                iconClass: 'opponent-avatar',
            });
            this.bga.playerPanels.getElement(0).insertAdjacentHTML('beforeend', `<div id="sololord-img" class="sololord sololord${gamedatas.opponent.lord}"></div>`);
            const conditionNumber = gamedatas.opponent.lord == 2 || gamedatas.opponent.lord == 4 ? 4 : 3;
            for (let i = 1; i <= conditionNumber; i++) {
                const conditionHtml = `<div id="sololord-condition${i}" class="condition condition${i} over${conditionNumber}"></div>`;
                document.getElementById(`sololord-img`).insertAdjacentHTML('beforeend', conditionHtml);
            }
        }
        (solo ? [...players, gamedatas.opponent] : players).forEach(player => {
            const playerId = Number(player.id);
            const playerTable = Object.values(gamedatas.playersTables[playerId]);
            // Lord & pearl counters
            this.bga.playerPanels.getElement(playerId).insertAdjacentHTML('beforeend', `<div class="counters">
                <div id="lord-counter-wrapper-${player.id}" class="lord-counter"></div>
                <div id="pearl-counter-wrapper-${player.id}" class="pearl-counter">
                    <div class="token pearl"></div> 
                    <span id="pearl-counter-${player.id}" class="left"></span>
                </div>
            </div>`);
            this.minimaps[playerId] = new Minimap(playerId, playerTable);
            const pearlCounter = new CounterClass();
            pearlCounter.create(`pearl-counter-${player.id}`);
            pearlCounter.setValue(player.pearls);
            this.pearlCounters[playerId] = pearlCounter;
            // keys counters
            this.bga.playerPanels.getElement(playerId).insertAdjacentHTML('beforeend', `<div class="counters">
                <div id="silver-key-counter-wrapper-${player.id}" class="key-counter silver-key-counter">
                    <div id="silver-key-${player.id}" class="token silver key"></div> 
                    <span id="silver-key-counter-${player.id}" class="left"></span>
                </div>
                <div id="gold-key-counter-wrapper-${player.id}" class="key-counter gold-key-counter">
                    <div id="gold-key-${player.id}"  class="token gold key"></div> 
                    <span id="gold-key-counter-${player.id}" class="left"></span>
                </div>
            </div>`);
            const lastLocationSpotIndex = playerTable.map((spot, spotIndex) => spot.location ? spotIndex : -1).reduce((a, b) => a > b ? a : b, -1);
            const silverKeyAvailable = playerTable.filter((spot, spotIndex) => spotIndex > lastLocationSpotIndex && spot.lord?.key === 1).length > 0;
            document.getElementById(`silver-key-counter-wrapper-${player.id}`)?.classList.toggle('available', silverKeyAvailable);
            const silverKeyCounter = new CounterClass();
            silverKeyCounter.create(`silver-key-counter-${player.id}`);
            silverKeyCounter.setValue(playerTable.filter((spot) => spot.lord?.key === 1).length);
            this.silverKeyCounters[playerId] = silverKeyCounter;
            const goldKeyAvailable = playerTable.filter((spot, spotIndex) => spotIndex > lastLocationSpotIndex && spot.lord?.key === 2).length > 0;
            document.getElementById(`gold-key-counter-wrapper-${player.id}`)?.classList.toggle('available', goldKeyAvailable);
            const goldKeyCounter = new CounterClass();
            goldKeyCounter.create(`gold-key-counter-${player.id}`);
            goldKeyCounter.setValue(playerTable.filter((spot) => spot.lord?.key === 2).length);
            this.goldKeyCounters[playerId] = goldKeyCounter;
            // top lord tokens
            let html = `<div class="top-lord-tokens">`;
            GUILD_IDS.forEach(guild => html += `<div class="token guild${guild} token-guild${guild}" id="top-lord-token-${guild}-${player.id}"></div>`);
            html += `</div>`;
            this.bga.playerPanels.getElement(playerId).insertAdjacentHTML('beforeend', html);
            // pearl master token
            this.bga.playerPanels.getElement(playerId).insertAdjacentHTML('beforeend', `
                <div id="player_board_${player.id}_pearlMasterWrapper" class="pearlMasterWrapper"></div>
                <div id="player_board_${player.id}_playAgainWrapper" class="playAgainWrapper"></div>
            `);
            if (gamedatas.pearlMasterPlayer === playerId) {
                this.placePearlMasterToken(gamedatas.pearlMasterPlayer);
            }
            if (gamedatas.playAgainPlayer === playerId) {
                this.placePlayAgainToken(gamedatas.playAgainPlayer);
            }
            // vision popup button
            /*if (playerId !== Number(this.bga.gameui.player_id)) {*/
            const showPlayermatButtonHtml = `<div id="show-playermat-${player.id}" class="show-playermat-button">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 85.333343 145.79321">
                    <path fill="currentColor" d="M 1.6,144.19321 C 0.72,143.31321 0,141.90343 0,141.06039 0,140.21734 5.019,125.35234 11.15333,108.02704 L 22.30665,76.526514 14.626511,68.826524 C 8.70498,62.889705 6.45637,59.468243 4.80652,53.884537 0.057,37.810464 3.28288,23.775161 14.266011,12.727735 23.2699,3.6711383 31.24961,0.09115725 42.633001,0.00129225 c 15.633879,-0.123414 29.7242,8.60107205 36.66277,22.70098475 8.00349,16.263927 4.02641,36.419057 -9.54327,48.363567 l -6.09937,5.36888 10.8401,30.526466 c 5.96206,16.78955 10.84011,32.03102 10.84011,33.86992 0,1.8389 -0.94908,3.70766 -2.10905,4.15278 -1.15998,0.44513 -19.63998,0.80932 -41.06667,0.80932 -28.52259,0 -39.386191,-0.42858 -40.557621,-1.6 z M 58.000011,54.483815 c 3.66666,-1.775301 9.06666,-5.706124 11.99999,-8.735161 l 5.33334,-5.507342 -6.66667,-6.09345 C 59.791321,26.035633 53.218971,23.191944 43.2618,23.15582 33.50202,23.12041 24.44122,27.164681 16.83985,34.94919 c -4.926849,5.045548 -5.023849,5.323672 -2.956989,8.478106 3.741259,5.709878 15.032709,12.667218 24.11715,14.860013 4.67992,1.129637 13.130429,-0.477436 20,-3.803494 z m -22.33337,-2.130758 c -2.8907,-1.683676 -6.3333,-8.148479 -6.3333,-11.893186 0,-11.58942 14.57544,-17.629692 22.76923,-9.435897 8.41012,8.410121 2.7035,22.821681 -9,22.728685 -2.80641,-0.0223 -6.15258,-0.652121 -7.43593,-1.399602 z m 14.6667,-6.075289 c 3.72801,-4.100734 3.78941,-7.121364 0.23656,-11.638085 -2.025061,-2.574448 -3.9845,-3.513145 -7.33333,-3.513145 -10.93129,0 -13.70837,13.126529 -3.90323,18.44946 3.50764,1.904196 7.30574,0.765377 11,-3.29823 z m -11.36999,0.106494 c -3.74071,-2.620092 -4.07008,-7.297494 -0.44716,-6.350078 3.2022,0.837394 4.87543,-1.760912 2.76868,-4.29939 -1.34051,-1.615208 -1.02878,-1.94159 1.85447,-1.94159 4.67573,0 8.31873,5.36324 6.2582,9.213366 -1.21644,2.27295 -5.30653,5.453301 -7.0132,5.453301 -0.25171,0 -1.79115,-0.934022 -3.42099,-2.075605 z"></path>
                    </svg>
                </div>`;
            document.getElementById(`player_board_${player.id}`).insertAdjacentHTML('beforeend', showPlayermatButtonHtml);
            document.getElementById(`show-playermat-${player.id}`).addEventListener('click', () => this.movePlayerTableToPopin(Number(player.id)));
            /*}*/
            this.setNewScore({
                playerId,
                newScore: player.newScore
            });
        });
        this.bga.gameui.addTooltipHtmlToClass('lord-counter', _("Number of lords in player table"));
        this.bga.gameui.addTooltipHtmlToClass('pearl-counter', _("Number of pearls"));
        this.bga.gameui.addTooltipHtmlToClass('silver-key-counter', _("Number of silver keys (surrounded if a silver key is available)"));
        this.bga.gameui.addTooltipHtmlToClass('gold-key-counter', _("Number of gold keys (surrounded if a gold key is available)"));
        GUILD_IDS.forEach(guild => this.bga.gameui.addTooltipHtmlToClass(`token-guild${guild}`, _("The Coat of Arms token indicates the most influential Lord of each color.")));
    }
    updateKeysForPlayer(playerId) {
        const playerTable = this.playersTables[playerId];
        const lastLocationSpotIndex = playerTable.spotsStock.map((spotStock, spotIndex) => spotStock.hasLocation() ? spotIndex : -1).reduce((a, b) => a > b ? a : b, -1);
        const silverKeyAvailable = playerTable.spotsStock.filter((spotStock, spotIndex) => spotIndex > lastLocationSpotIndex && spotStock.getLord()?.key === 1).length > 0;
        document.getElementById(`silver-key-counter-wrapper-${playerId}`)?.classList.toggle('available', silverKeyAvailable);
        const totalSilverKeyCounter = playerTable.spotsStock.filter((spotStock) => spotStock.getLord()?.key === 1).length;
        this.silverKeyCounters[playerId].toValue(totalSilverKeyCounter);
        const goldKeyAvailable = playerTable.spotsStock.filter((spotStock, spotIndex) => spotIndex > lastLocationSpotIndex && spotStock.getLord()?.key === 2).length > 0;
        document.getElementById(`gold-key-counter-wrapper-${playerId}`)?.classList.toggle('available', goldKeyAvailable);
        const totalGoldKeyCounter = playerTable.spotsStock.filter((spotStock) => spotStock.getLord()?.key === 2).length;
        this.goldKeyCounters[playerId].toValue(totalGoldKeyCounter);
    }
    createPlayerTables(gamedatas) {
        const players = Object.values(gamedatas.players).sort((a, b) => a.playerNo - b.playerNo);
        const playerIndex = players.findIndex(player => Number(player.id) === Number(this.bga.gameui.player_id));
        const orderedPlayers = playerIndex > 0 ? [...players.slice(playerIndex), ...players.slice(0, playerIndex)] : players;
        const solo = orderedPlayers.length === 1;
        (solo ? [...orderedPlayers, gamedatas.opponent] : orderedPlayers).forEach(player => this.createPlayerTable(gamedatas, Number(player.id)));
    }
    createPlayerTable(gamedatas, playerId) {
        this.playersTables[playerId] = new PlayerTable(this, playerId > 0 ? gamedatas.players[playerId] : gamedatas.opponent, gamedatas.playersTables[playerId]);
    }
    chooseLordDeckStack(number) {
        this.bga.actions.performAction('actChooseLordDeckStack', {
            number
        });
    }
    chooseLocationDeckStack(number) {
        this.bga.actions.performAction('actChooseLocationDeckStack', {
            number
        });
    }
    chooseVisibleLocation(id) {
        this.bga.actions.performAction('actChooseVisibleLocation', {
            id
        });
    }
    lordPick(id) {
        this.bga.actions.performAction('actPickLord', {
            id
        });
    }
    lordStockPick(guild) {
        this.bga.actions.performAction('actChooseVisibleStack', {
            guild
        });
    }
    locationPick(id) {
        this.bga.actions.performAction('actPickLocation', {
            id
        });
    }
    placePearlMasterToken(playerId) {
        const pearlMasterToken = document.getElementById('pearlMasterToken');
        if (pearlMasterToken) {
            slideToObjectAndAttach(this.bga.gameui, pearlMasterToken, `player_board_${playerId}_pearlMasterWrapper`);
        }
        else {
            const pearlMasterHtml = '<div id="pearlMasterToken" class="token"></div>';
            document.getElementById(`player_board_${playerId}_pearlMasterWrapper`).insertAdjacentHTML('beforeend', pearlMasterHtml);
            this.bga.gameui.addTooltipHtml('pearlMasterToken', _("Pearl Master token. At the end of the game, the player possessing the Pearl Master token gains a bonus of 5 Influence Points."));
        }
    }
    placePlayAgainToken(playerId) {
        const playAgainToken = document.getElementById('playAgainToken');
        if (playAgainToken) {
            slideToObjectAndAttach(this.bga.gameui, playAgainToken, `player_board_${playerId}_playAgainWrapper`);
        }
        else {
            const playAgainHtml = '<div id="playAgainToken" class="token"></div>';
            document.getElementById(`player_board_${playerId}_playAgainWrapper`).insertAdjacentHTML('beforeend', playAgainHtml);
            this.bga.gameui.addTooltipHtml('playAgainToken', _("Replay token. You can use it to gain an extra turn when you play it."));
        }
    }
    setCanSwap(swapSpots) {
        if (this.swapSpots.length !== 2 && swapSpots.length === 2) {
            document.getElementById('swap_button')?.classList.remove('disabled');
        }
        else if (this.swapSpots.length === 2 && swapSpots.length !== 2) {
            document.getElementById('swap_button')?.classList.add('disabled');
        }
        this.swapSpots = swapSpots.slice();
    }
    onSwap() {
        this.bga.actions.performAction('actSwap', { spots: this.swapSpots });
    }
    onDontSwap() {
        this.bga.actions.performAction('actDontSwap');
    }
    useReplayToken(use) {
        this.bga.actions.performAction('actUseReplayToken', { use });
    }
    setScore(playerId, column, score) {
        const cell = document.getElementById(`score${playerId}`).getElementsByTagName('td')[column];
        cell.innerHTML = `${score}`;
        cell.classList.add('highlight');
    }
    addHelp() {
        const helpButtonHtml = `<button id="conspiracy-help-button">?</button>`;
        document.getElementById('left-side').insertAdjacentHTML('beforeend', helpButtonHtml);
        document.getElementById('conspiracy-help-button').addEventListener('click', () => this.showHelp());
    }
    showHelp() {
        const helpDialog = new PopinDialogClass();
        helpDialog.create('conspiracyHelpDialog');
        helpDialog.setTitle(_("Cards help"));
        let html = `<div id="help-popin">
            <h1>${_("Lords")}</h1>
            <div id="help-lords" class="help-section">
                <table>`;
        LORDS_IDS.forEach(number => html += `<tr><td><div id="lord${number}" class="lord"></div></td><td>${getLordTooltip(number * 10 + 3)}</td></tr>`);
        html += `</table>
            </div>
            <h1>${_("Locations")}</h1>
            <div id="help-locations" class="help-section">
                <table>`;
        LOCATIONS_UNIQUE_IDS.forEach(number => html += `<tr><td><div id="location${number}" class="location"></div></td><td>${getLocationTooltip(number * 10)}</td></tr>`);
        LOCATIONS_GUILDS_IDS.forEach(number => html += `<tr><td><div id="location${number}" class="location"></div></td><td>${getLocationTooltip(number * 10)}</td></tr>`);
        html += `</table>
            </div>`;
        if (this.gamedatas.bonusLocations) {
            html += `<h1>${_("Bonus locations")}</h1>
                <div id="help-locations" class="help-section">
                    <table>`;
            LOCATIONS_BONUS_IDS.forEach(number => html += `<tr><td><div id="location${number}" class="location"></div></td><td>${getLocationTooltip(number * 10)}</td></tr>`);
            html += `</table>
                    <div id="alliance">
                        <hr>
                        ${_("An alliance is an area of adjacent Lords of the same value, regardless of their color.")}
                        <div class="example-wrapper">
                            <div class="example"></div>
                        </div>
                    </div>
                </div>`;
        }
        html += `</div>`;
        // Show the dialog
        helpDialog.setContent(html);
        helpDialog.show();
    }
    setNewScoreTooltip(playerId) {
        const score = (playerId > 0 ? this.gamedatas.players[playerId] : this.gamedatas.opponent).newScore;
        const html = `
            ${_("Lords points")} : <strong>${score.lords}</strong><br>
            ${_("Locations points")} : <strong>${score.locations}</strong><br>
            ${_("Coalition points")} : <strong>${score.coalition}</strong><br>
            ${_("Pearl Master points")} : <strong>${score.pearlMaster}</strong><br>
        `;
        this.bga.gameui.addTooltipHtml(`player_score_${playerId}`, html);
        this.bga.gameui.addTooltipHtml(`icon_point_${playerId}`, html);
    }
    setNewScore(args) {
        if (this.gamedatas.hiddenScore) {
            setTimeout(() => {
                const playersIds = Object.keys(this.gamedatas.players);
                if (playersIds.length == 1) {
                    playersIds.push(0);
                }
                playersIds.forEach(playerId => document.getElementById(`player_score_${playerId}`).innerHTML = '-');
            }, 100);
        }
        else {
            const score = args.newScore;
            (args.playerId ? this.gamedatas.players[args.playerId] : this.gamedatas.opponent).newScore = score;
            if (!isNaN(score.total)) {
                this.bga.playerPanels.getScoreCounter(Number(args.playerId))?.toValue(score.total);
            }
            this.setNewScoreTooltip(args.playerId);
        }
    }
    setRemainingLords(remainingLords) {
        this.lordCounter.setValue(remainingLords);
        const visibility = remainingLords > 0 ? 'visible' : 'hidden';
        document.getElementById('lord-hidden-pile').style.visibility = visibility;
        document.getElementById('remaining-lord-counter').style.visibility = visibility;
    }
    setRemainingLocations(remainingLocations) {
        this.locationCounter.setValue(remainingLocations);
        const visibility = remainingLocations > 0 ? 'visible' : 'hidden';
        document.getElementById('location-hidden-pile').style.visibility = visibility;
        document.getElementById('remaining-location-counter').style.visibility = visibility;
    }
    ///////////////////////////////////////////////////
    //// Reaction to cometD notifications
    /*
        setupNotifications:

        In this method, you associate each of your game notifications with your local method to handle it.

        Note: game notification names correspond to "notifyAllPlayers" and "notifyPlayer" calls in
                your pylos.game.php file.

    */
    setupNotifications() {
        //log( 'notifications subscriptions setup' );
        const notifs = [
            ['lordPlayed', ANIMATION_MS],
            ['lordSwapped', ANIMATION_MS],
            ['extraLordRevealed', ANIMATION_MS],
            ['locationPlayed', ANIMATION_MS],
            ['discardLords', ANIMATION_MS],
            ['discardLocations', ANIMATION_MS],
            ['matchingPiles', 1000],
            ['newPearlMaster', 1],
            ['newPlayAgainPlayer', 1],
            ['discardLordPick', 1],
            ['discardLocationPick', 1],
            ['lastTurn', 1],
            ['scoreLords', SCORE_MS],
            ['scoreLocations', SCORE_MS],
            ['scoreCoalition', SCORE_MS],
            ['scorePearlMaster', SCORE_MS],
            ['scoreTotal', SCORE_MS],
        ];
        notifs.forEach((notif) => {
            dojo.subscribe(notif[0], (...args) => this[`notif_${notif[0]}`](...args));
            this.bga.gameui.notifqueue.setSynchronous(notif[0], notif[1]);
        });
    }
    notif_lordPlayed(notif) {
        const from = this.lordsStacks.getStockContaining(`${notif.args.lord.id}`);
        this.playersTables[notif.args.playerId].addLord(notif.args.spot, notif.args.lord, from);
        this.minimaps[notif.args.playerId].addLord(notif.args.spot, notif.args.lord);
        this.setNewScore(notif.args);
        this.pearlCounters[notif.args.playerId].incValue(notif.args.pearls);
        if (notif.args.stackSelection || !notif.args.discardedLords.length) {
            this.lordsStacks.discardPick(notif.args.discardedLords);
            this.lordsStacks.setPick(false, false);
        }
        if (notif.args.lord.key) {
            this.updateKeysForPlayer(notif.args.playerId);
        }
    }
    notif_lordSwapped(notif) {
        this.playersTables[notif.args.playerId].lordSwapped(notif.args);
        this.minimaps[notif.args.playerId].lordSwapped(notif.args);
        this.setNewScore(notif.args);
    }
    notif_extraLordRevealed(notif) {
        this.lordsStacks.addLords([notif.args.lord]);
        this.setRemainingLords(notif.args.remainingLords);
    }
    notif_locationPlayed(notif) {
        const from = this.locationsStacks.getStockContaining(`${notif.args.location.id}`);
        this.playersTables[notif.args.playerId].addLocation(notif.args.spot, notif.args.location, from);
        this.setNewScore(notif.args);
        this.pearlCounters[notif.args.playerId].incValue(notif.args.pearls);
        if (notif.args.discardedLocations?.length) {
            this.locationsStacks.discardPick(notif.args.discardedLocations);
        }
        this.setRemainingLocations(notif.args.remainingLocations);
        this.locationsStacks.setPick(false, false);
        this.updateKeysForPlayer(notif.args.playerId);
    }
    notif_discardLords(notif) {
        this.lordsStacks.discardVisible();
        this.setRemainingLords(notif.args.remainingLords);
    }
    notif_discardLordPick(notif) {
        // log('notif_discardLordPick', notif.args);
        this.lordsStacks.discardPick(notif.args.discardedLords);
        this.lordsStacks.setPick(false, false);
    }
    notif_discardLocationPick(notif) {
        // log('notif_discardLordPick', notif.args);
        this.locationsStacks.discardPick(notif.args.discardedLocations);
        this.locationsStacks.setPick(false, false);
    }
    notif_discardLocations(notif) {
        this.locationsStacks.discardVisible();
        this.setRemainingLocations(notif.args.remainingLocations);
    }
    notif_matchingPiles(notif) {
        const conditionDiv = document.getElementById(`sololord-condition${notif.args.conditionNumber}`);
        conditionDiv.dataset.count = '' + notif.args.count;
        conditionDiv.classList.add('show');
        setTimeout(() => conditionDiv.classList.remove('show'), 2000);
    }
    notif_newPearlMaster(notif) {
        const playerId = notif.args.playerId;
        this.placePearlMasterToken(playerId);
        if (!this.gamedatas.hiddenScore) {
            this.bga.playerPanels.getScoreCounter(Number(playerId)).incValue(5);
            (playerId == 0 ? this.gamedatas.opponent : this.gamedatas.players[playerId]).newScore.pearlMaster = 5;
            this.setNewScoreTooltip(playerId);
            const previousPlayerId = notif.args.previousPlayerId;
            if (previousPlayerId >= (Object.keys(this.gamedatas.players).length > 1 ? 1 : 0)) {
                this.bga.playerPanels.getScoreCounter(Number(previousPlayerId))?.incValue(-5);
                (previousPlayerId == 0 ? this.gamedatas.opponent : this.gamedatas.players[previousPlayerId]).newScore.pearlMaster = 0;
                this.setNewScoreTooltip(previousPlayerId);
            }
        }
    }
    notif_newPlayAgainPlayer(notif) {
        const playerId = notif.args.playerId;
        this.placePlayAgainToken(playerId);
    }
    notif_lastTurn() {
        const lastRoundHtml = `<div id="last-round">
            ${_("This is the last round of the game!")}
        </div>`;
        document.getElementById('page-title').insertAdjacentHTML('beforeend', lastRoundHtml);
    }
    notif_scoreLords(notif) {
        log('notif_scoreLords', notif.args);
        this.setScore(notif.args.playerId, 1, notif.args.points);
        this.bga.playerPanels.getScoreCounter(Number(notif.args.playerId)).incValue(notif.args.points);
        this.playersTables[notif.args.playerId].highlightTopLords();
    }
    notif_scoreLocations(notif) {
        log('notif_scoreLocations', notif.args);
        this.setScore(notif.args.playerId, 2, notif.args.points);
        this.bga.playerPanels.getScoreCounter(Number(notif.args.playerId)).incValue(notif.args.points);
        this.playersTables[notif.args.playerId].highlightLocations();
    }
    notif_scoreCoalition(notif) {
        log('notif_scoreCoalition', notif.args);
        this.setScore(notif.args.playerId, 3, notif.args.points);
        this.bga.playerPanels.getScoreCounter(Number(notif.args.playerId)).incValue(notif.args.points);
        this.playersTables[notif.args.playerId].highlightCoalition(notif.args.coalition);
    }
    notif_scorePearlMaster(notif) {
        log('notif_scorePearlMaster', notif.args);
        const playersIds = Object.keys(this.gamedatas.players);
        if (playersIds.length == 1) {
            playersIds.push(0);
        }
        playersIds.forEach(playerId => {
            const isPearlMaster = notif.args.playerId == Number(playerId);
            this.setScore(playerId, 4, isPearlMaster ? 5 : 0);
            if (isPearlMaster) {
                this.bga.playerPanels.getScoreCounter(Number(notif.args.playerId)).incValue(5);
            }
        });
        document.getElementById('pearlMasterToken').classList.add('highlight');
    }
    notif_scoreTotal(notif) {
        log('notif_scoreTotal', notif.args);
        this.setScore(notif.args.playerId, 5, notif.args.points);
    }
    /* This enable to inject translatable styled things to logs or action bar */
    /* @Override */
    bgaFormatText(log, args) {
        try {
            if (log && args && !args.processed) {
                // Representation of the color of a card
                if (args.guild !== undefined && args.guild_name !== undefined && args.guild_name[0] !== '<') {
                    args.guild_name = `<span class='log-guild-name' style='color: ${LOG_GUILD_COLOR[args.guild]}'>${_(args.guild_name)}</span>`;
                }
            }
        }
        catch (e) {
            console.error(log, args, "Exception thrown", e.stack);
        }
        return { log, args };
    }
}

export { Game };
