/*declare const define;
declare const ebg;
declare const $;
declare const dojo: Dojo;
declare const _;
declare const g_gamethemeurl;

declare const board: HTMLDivElement;*/
var GUILD_IDS = [1, 2, 3, 4, 5];
var LORDS_IDS = [1, 2, 3, 4, 5, 6];
var LOCATIONS_UNIQUE_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
var LOCATIONS_GUILDS_IDS = [100, 101];
var LORD_WIDTH = 207.26;
var LORD_HEIGHT = 207;
var LOCATION_WIDTH = 186.24;
var LOCATION_HEIGHT = 124;
function getUniqueId(type, guild) {
    return type * 10 + guild;
}
function setupLordCards(lordStocks) {
    var _this = this;
    var cardsurl = g_gamethemeurl + "img/lords.jpg";
    lordStocks.forEach(function (lordStock) {
        return GUILD_IDS.forEach(function (guild, guildIndex) {
            return LORDS_IDS.forEach(function (lordType, index) {
                return lordStock.addItemType(_this.getUniqueId(lordType, guild), 0, cardsurl, 1 + guildIndex * LORDS_IDS.length + index);
            });
        });
    });
}
function setupLocationCards(locationStocks) {
    var cardsurl = g_gamethemeurl + "img/locations.jpg";
    locationStocks.forEach(function (locationStock) {
        LOCATIONS_UNIQUE_IDS.forEach(function (id, index) {
            return locationStock.addItemType(getUniqueId(id, 0), 0, cardsurl, 1 + index);
        });
        GUILD_IDS.forEach(function (guild, guildIndex) {
            return LOCATIONS_GUILDS_IDS.forEach(function (id, index) {
                return locationStock.addItemType(getUniqueId(id, guild), 0, cardsurl, 15 + GUILD_IDS.length * index + guildIndex);
            });
        });
    });
}
function getGuildName(guild) {
    var guildName = null;
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
    var type = Math.floor(typeWithGuild / 10);
    var guild = typeWithGuild % 10;
    var message = null;
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
        case 100:
            message = dojo.string.substitute(_("At the end of the game, this Location is worth as many IP as your most influential ${guild_name} Lord."), { guild_name: getGuildName(guild) });
            break;
        case 101:
            message = dojo.string.substitute(_("At the end of the game, this Location is worth 1 IP + a bonus of 1 IP per ${guild_name} Lord present in your Senate Chamber."), { guild_name: getGuildName(guild) });
            break;
    }
    return message;
}
function getLordTooltip(typeWithGuild) {
    var type = Math.floor(typeWithGuild / 10);
    var message = null;
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
    return message;
}
var LORD_OVERLAP_WIDTH = 45;
var LORD_OVERLAP_HEIGHT = 65;
function updateDisplay(from) {
    var _this = this;
    if (!$(this.control_name)) {
        return;
    }
    var topDestination = 0;
    var leftDestination = 0;
    var itemWidth = this.item_width;
    var itemHeight = this.item_height;
    var topDestinations = [];
    var leftDestinations = [];
    this.items.forEach(function (item, iIndex) {
        ;
        if (typeof item.loc == "undefined") {
            topDestinations[iIndex] = iIndex * LORD_OVERLAP_HEIGHT;
            leftDestinations[iIndex] = (_this.items.length - iIndex - 1) * LORD_OVERLAP_WIDTH;
        }
    });
    for (var i in this.items) {
        topDestination = topDestinations[i];
        leftDestination = leftDestinations[i];
        var item = this.items[i];
        var itemDivId = this.getItemDivId(item.id);
        var $itemDiv = $(itemDivId);
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
            dojo.style($itemDiv, "width", itemWidth + "px");
            dojo.style($itemDiv, "height", itemHeight + "px");
            //dojo.style($itemDiv, "z-index", i);
            // dojo.style($itemDiv, "background-size", "100% auto");
        }
        else {
            var type = this.item_type[item.type];
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
            var additional_style = "";
            var jstpl_stock_item_template = dojo.trim(dojo.string.substitute(this.jstpl_stock_item, {
                id: itemDivId,
                width: itemWidth,
                height: itemHeight,
                top: topDestination,
                left: leftDestination,
                image: type.image,
                position: '',
                extra_classes: this.extraClasses,
                additional_style: additional_style
            }));
            dojo.place(jstpl_stock_item_template, this.control_name);
            $itemDiv = $(itemDivId);
            if (typeof item.loc != "undefined") {
                this.page.placeOnObject($itemDiv, item.loc);
            }
            if (this.selectable == 0) {
                dojo.addClass($itemDiv, "stockitem_unselectable");
            }
            dojo.connect($itemDiv, "onclick", this, "onClickOnItem");
            if (Number(type.image_position) !== 0) {
                var backgroundPositionWidth = 0;
                var backgroundPositionHeight = 0;
                if (this.image_items_per_row) {
                    var rowNumber = Math.floor(type.image_position / this.image_items_per_row);
                    if (!this.image_in_vertical_row) {
                        backgroundPositionWidth = (type.image_position - (rowNumber * this.image_items_per_row)) * 100;
                        backgroundPositionHeight = rowNumber * 100;
                    }
                    else {
                        backgroundPositionHeight = (type.image_position - (rowNumber * this.image_items_per_row)) * 100;
                        backgroundPositionWidth = rowNumber * 100;
                    }
                    dojo.style($itemDiv, "backgroundPosition", "-" + backgroundPositionWidth + "% -" + backgroundPositionHeight + "%");
                }
                else {
                    backgroundPositionWidth = type.image_position * 100;
                    dojo.style($itemDiv, "backgroundPosition", "-" + backgroundPositionWidth + "% 0%");
                }
            }
            if (this.onItemCreate) {
                this.onItemCreate($itemDiv, item.type, itemDivId);
            }
            if (typeof from != "undefined") {
                this.page.placeOnObject($itemDiv, from);
                if (typeof item.loc == "undefined") {
                    var anim = dojo.fx.slideTo({
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
                dojo.style($itemDiv, "opacity", 0);
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
            dojo.style(this.control_name, "width", controlWidth + "px");
        }
        if (controlHeight > 0) {
            dojo.style(this.control_name, "height", controlHeight + "px");
        }
        
    }

    dojo.style(this.control_name, "minHeight", (itemHeight + itemMargin) + "px");*/
}
var LordStock = /** @class */ (function () {
    function LordStock(lordsStacks, guild, visibleLords) {
        var _this = this;
        this.lordsStacks = lordsStacks;
        this.guild = guild;
        this.stock = new ebg.stock();
        this.stock.create(this.lordsStacks.game, this.div, LORD_WIDTH, LORD_HEIGHT);
        this.stock.setSelectionMode(0);
        this.stock.onItemCreate = dojo.hitch(this, 'setupNewLordCard');
        this.stock.updateDisplay = function (from) { return updateDisplay.apply(_this.stock, [from]); };
        dojo.connect(this.stock, 'onChangeSelection', this, 'click');
        setupLordCards([this.stock]);
        visibleLords.forEach(function (lord) { return _this.stock.addToStockWithId(_this.lordsStacks.getCardUniqueId(lord), "" + lord.id); });
        this.updateSize();
        this.div.addEventListener('click', function () { return _this.click(); });
    }
    LordStock.prototype.addLords = function (lords) {
        var _this = this;
        lords.forEach(function (lord) { return _this.stock.addToStockWithId(_this.lordsStacks.getCardUniqueId(lord), "" + lord.id); });
        this.updateSize();
    };
    LordStock.prototype.removeLords = function () {
        this.stock.removeAll();
        this.updateSize();
    };
    LordStock.prototype.updateSize = function () {
        var size = this.stock.items.length;
        this.div.style.width = LORD_WIDTH + (Math.max(size - 1, 0) * LORD_OVERLAP_WIDTH) + "px";
        this.div.style.height = LORD_HEIGHT + (Math.max(size - 1, 0) * LORD_OVERLAP_HEIGHT) + "px";
        this.div.style.display = size ? 'inline-block' : 'none';
    };
    Object.defineProperty(LordStock.prototype, "div", {
        get: function () {
            return document.getElementById("lord-visible-stock" + this.guild);
        },
        enumerable: false,
        configurable: true
    });
    LordStock.prototype.setSelectable = function (selectable) {
        this.selectable = selectable;
        var action = selectable ? 'add' : 'remove';
        this.div.classList[action]('selectable');
        this.stock.setSelectionMode(selectable ? 2 : 0);
    };
    LordStock.prototype.click = function () {
        if (!this.selectable) {
            return;
        }
        this.lordsStacks.game.lordStockPick(this.guild);
    };
    LordStock.prototype.setupNewLordCard = function (card_div, card_type_id, card_id) {
        var message = getLordTooltip(card_type_id);
        if (message) {
            this.lordsStacks.game.addTooltip(card_div.id, message, '');
        }
    };
    return LordStock;
}());
var AbstractStacks = /** @class */ (function () {
    function AbstractStacks() {
    }
    AbstractStacks.prototype.setSelectable = function (selectable, limitToHidden, allHidden) {
        this.selectable = selectable;
        var action = selectable ? 'add' : 'remove';
        this.pileDiv.classList[action]('selectable');
        var buttons = Array.from(this.pileDiv.getElementsByClassName('button'));
        if (limitToHidden) {
            if (selectable) {
                buttons.filter(function (button) { return parseInt(button.dataset.number) !== limitToHidden; })
                    .forEach(function (button) { return button.classList.add('hidden'); });
            }
        }
        if (!selectable) {
            buttons.forEach(function (button) { return button.classList.remove('hidden'); });
        }
        // if player has all hidden location, we replace the 3 buttons by one special for the rest of the game
        if (allHidden && buttons.length > 1) {
            document.getElementById('location-hidden-pile').innerHTML = '<div class="button" data-number="0">*</div>';
        }
    };
    AbstractStacks.prototype.setPick = function (showPick, pickSelectable, collection) {
        var _this = this;
        this.pickDiv.style.display = showPick ? 'block' : 'none';
        this.pickSelectable = pickSelectable;
        if (collection) {
            this.pickStock.removeAll();
            collection.forEach(function (item) { return _this.pickStock.addToStockWithId(_this.getCardUniqueId(item), "" + item.id); });
        }
    };
    AbstractStacks.prototype.setPickStockClick = function () {
        dojo.connect(this.pickStock, 'onChangeSelection', this, 'pickClick');
    };
    AbstractStacks.prototype.pickClick = function (control_name, item_id) {
        this.pickStock.removeAll();
    };
    return AbstractStacks;
}());
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var LordsStacks = /** @class */ (function (_super) {
    __extends(LordsStacks, _super);
    function LordsStacks(game, visibleLords, pickLords) {
        var _this = _super.call(this) || this;
        _this.game = game;
        _this.lordsStocks = [];
        _this.pileDiv.addEventListener('click', function (e) { return _this.onHiddenLordsClick(e); });
        GUILD_IDS.forEach(function (guild) { return _this.lordsStocks[guild] = new LordStock(_this, guild, visibleLords[guild]); });
        _this.pickStock = new ebg.stock();
        _this.pickStock.create(_this.game, _this.pickDiv.children[0], LORD_WIDTH, LORD_HEIGHT);
        _this.pickStock.centerItems = true;
        _this.pickStock.onItemCreate = dojo.hitch(_this, 'setupNewLordCard');
        setupLordCards([_this.pickStock]);
        _this.setPickStockClick();
        pickLords.forEach(function (lord) { return _this.pickStock.addToStockWithId(_this.getCardUniqueId(lord), "" + lord.id); });
        return _this;
    }
    Object.defineProperty(LordsStacks.prototype, "pileDiv", {
        get: function () {
            return document.getElementById('lord-hidden-pile');
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LordsStacks.prototype, "pickDiv", {
        get: function () {
            return document.getElementById('lord-pick');
        },
        enumerable: false,
        configurable: true
    });
    LordsStacks.prototype.discardVisible = function () {
        var _this = this;
        GUILD_IDS.forEach(function (guild) { return _this.lordsStocks[guild].removeLords(); });
    };
    LordsStacks.prototype.addLords = function (lords) {
        var _this = this;
        var guilds = new Set(lords.map(function (lord) { return lord.guild; }));
        guilds.forEach(function (guild) { return _this.lordsStocks[guild].addLords(lords.filter(function (lord) { return lord.guild === guild; })); });
    };
    LordsStacks.prototype.setSelectable = function (selectable, limitToHidden, allHidden) {
        _super.prototype.setSelectable.call(this, selectable, limitToHidden, allHidden);
        if (!selectable || !limitToHidden) {
            this.lordsStocks.forEach(function (lordStock) { return lordStock.setSelectable(selectable); });
        }
    };
    LordsStacks.prototype.discardPick = function (lords) {
        var _this = this;
        var guilds = new Set(lords.map(function (lord) { return lord.guild; }));
        guilds.forEach(function (guild) { return _this.lordsStocks[guild].addLords(lords.filter(function (lord) { return lord.guild === guild; })); });
    };
    LordsStacks.prototype.discardVisibleLordPile = function (guild) {
        this.lordsStocks[guild].removeLords();
    };
    LordsStacks.prototype.getCardUniqueId = function (lord) {
        return getUniqueId(lord.type, lord.guild);
    };
    LordsStacks.prototype.pickClick = function (control_name, item_id) {
        // TODO removeAllTo => lordsStocks
        this.game.lordPick(Number(item_id));
        _super.prototype.pickClick.call(this, control_name, item_id);
    };
    LordsStacks.prototype.onHiddenLordsClick = function (event) {
        if (!this.selectable) {
            return;
        }
        var number = parseInt(event.target.dataset.number);
        if (!this.game.checkAction('chooseDeckStack')) {
            return;
        }
        this.game.takeAction('chooseLordDeckStack', {
            number: number
        });
    };
    LordsStacks.prototype.setupNewLordCard = function (card_div, card_type_id, card_id) {
        var message = getLordTooltip(card_type_id);
        if (message) {
            this.game.addTooltip(card_div.id, message, '');
        }
    };
    return LordsStacks;
}(AbstractStacks));
var LocationsStacks = /** @class */ (function (_super) {
    __extends(LocationsStacks, _super);
    function LocationsStacks(game, visibleLocations, pickLocations) {
        var _this = _super.call(this) || this;
        _this.game = game;
        _this.pileDiv.addEventListener('click', function (e) { return _this.onHiddenLocationClick(e); });
        _this.visibleLocationsStock = new ebg.stock();
        _this.visibleLocationsStock.create(_this.game, $('location-visible-stock'), LOCATION_WIDTH, LOCATION_HEIGHT);
        _this.visibleLocationsStock.setSelectionMode(0);
        _this.visibleLocationsStock.setSelectionAppearance('class');
        _this.visibleLocationsStock.onItemCreate = dojo.hitch(_this, 'setupNewLocationCard');
        dojo.connect(_this.visibleLocationsStock, 'onChangeSelection', _this, 'onVisibleLocationClick');
        _this.pickStock = new ebg.stock();
        _this.pickStock.create(_this.game, _this.pickDiv.children[0], LOCATION_WIDTH, LOCATION_HEIGHT);
        _this.pickStock.centerItems = true;
        _this.pickStock.onItemCreate = dojo.hitch(_this, 'setupNewLocationCard');
        _this.setPickStockClick();
        setupLocationCards([_this.visibleLocationsStock, _this.pickStock]);
        visibleLocations.forEach(function (location) { return _this.visibleLocationsStock.addToStockWithId(_this.getCardUniqueId(location), "" + location.id); });
        pickLocations.forEach(function (location) { return _this.pickStock.addToStockWithId(_this.getCardUniqueId(location), "" + location.id); });
        return _this;
    }
    Object.defineProperty(LocationsStacks.prototype, "pileDiv", {
        get: function () {
            return document.getElementById('location-hidden-pile');
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LocationsStacks.prototype, "pickDiv", {
        get: function () {
            return document.getElementById('location-pick');
        },
        enumerable: false,
        configurable: true
    });
    LocationsStacks.prototype.setSelectable = function (selectable, limitToHidden, allHidden) {
        _super.prototype.setSelectable.call(this, selectable, limitToHidden, allHidden);
        this.visibleLocationsStock.setSelectionMode(selectable && !allHidden ? 1 : 0);
    };
    LocationsStacks.prototype.discardVisible = function () {
        this.visibleLocationsStock.removeAll();
    };
    LocationsStacks.prototype.discardPick = function (locations) {
        var _this = this;
        locations.forEach(function (location) { return _this.visibleLocationsStock.addToStockWithId(_this.getCardUniqueId(location), "" + location.id); });
    };
    LocationsStacks.prototype.getCardUniqueId = function (location) {
        var _a;
        return getUniqueId(location.type, (_a = location.passivePowerGuild) !== null && _a !== void 0 ? _a : 0);
    };
    LocationsStacks.prototype.pickClick = function (control_name, item_id) {
        console.log('pickClick', item_id, this.pickStock);
        // TODO removeAllTo => locationsStocks
        this.game.locationPick(Number(item_id));
        _super.prototype.pickClick.call(this, control_name, item_id);
    };
    LocationsStacks.prototype.setupNewLocationCard = function (card_div, card_type_id, card_id) {
        var message = getLocationTooltip(card_type_id);
        if (message) {
            this.game.addTooltip(card_div.id, message, '');
        }
    };
    LocationsStacks.prototype.onHiddenLocationClick = function (event) {
        if (!this.selectable) {
            return;
        }
        var number = parseInt(event.target.dataset.number);
        if (!this.game.checkAction('chooseDeckStack')) {
            return;
        }
        this.game.takeAction('chooseLocationDeckStack', {
            number: number
        });
    };
    LocationsStacks.prototype.onVisibleLocationClick = function (control_name, item_id) {
        if (!this.game.checkAction('chooseVisibleLocation')) {
            return;
        }
        this.game.takeAction('chooseVisibleLocation', {
            id: item_id
        });
    };
    LocationsStacks.prototype.removeLocation = function (location) {
        this.visibleLocationsStock.removeFromStockById("" + location.id);
    };
    return LocationsStacks;
}(AbstractStacks));
var PlayerTableSpotStock = /** @class */ (function () {
    function PlayerTableSpotStock(game, playerTable, player, spot, spotNumber) {
        var _a;
        this.game = game;
        this.playerTable = playerTable;
        this.spot = spot;
        this.spotNumber = spotNumber;
        this.playerId = Number(player.id);
        dojo.place("<div id=\"player-table-" + this.playerId + "-spot" + spotNumber + "\" class=\"player-table-spot spot" + spotNumber + "\">\n                <div id=\"player" + this.playerId + "-spot" + spotNumber + "-lord-stock\"></div>\n                <div id=\"player" + this.playerId + "-spot" + spotNumber + "-location-stock\" class=\"player-table-spot-location\"></div>\n                <div id=\"player" + this.playerId + "-spot" + spotNumber + "-token\" class=\"player-table-spot-token\"></div>\n        </div>", "player-table-" + this.playerId);
        this.lordsStock = new ebg.stock();
        this.lordsStock.create(this.game, $("player" + this.playerId + "-spot" + spotNumber + "-lord-stock"), LORD_WIDTH, LORD_HEIGHT);
        this.lordsStock.setSelectionMode(0);
        this.lordsStock.setSelectionAppearance('class');
        this.lordsStock.onItemCreate = dojo.hitch(this, 'setupNewLordCard');
        dojo.connect(this.lordsStock, 'onChangeSelection', this, 'onLordSelection');
        setupLordCards([this.lordsStock]);
        var lord = spot.lord;
        if (lord) {
            this.lordsStock.addToStockWithId(getUniqueId(lord.type, lord.guild), "" + lord.id);
            this.hidePlaceholder();
        }
        this.locationsStock = new ebg.stock();
        this.locationsStock.create(this.game, $("player" + this.playerId + "-spot" + spotNumber + "-location-stock"), LOCATION_WIDTH, LOCATION_HEIGHT);
        this.locationsStock.setSelectionMode(0);
        this.locationsStock.onItemCreate = dojo.hitch(this, 'setupNewLocationCard');
        setupLocationCards([this.locationsStock]);
        var location = spot.location;
        if (location) {
            this.locationsStock.addToStockWithId(getUniqueId(location.type, (_a = location.passivePowerGuild) !== null && _a !== void 0 ? _a : 0), "" + location.id);
        }
    }
    Object.defineProperty(PlayerTableSpotStock.prototype, "tokenWrapper", {
        get: function () {
            return document.getElementById("player" + this.playerId + "-spot" + this.spotNumber + "-token");
        },
        enumerable: false,
        configurable: true
    });
    PlayerTableSpotStock.prototype.getLord = function () {
        return this.spot.lord;
    };
    PlayerTableSpotStock.prototype.setLord = function (lord) {
        if (this.spot.lord) {
            this.lordsStock.removeFromStockById("" + this.spot.lord.id);
        }
        this.lordsStock.addToStockWithId(getUniqueId(lord.type, lord.guild), "" + lord.id);
        this.spot.lord = lord;
        this.hidePlaceholder();
    };
    PlayerTableSpotStock.prototype.hidePlaceholder = function () {
        dojo.style("player-table-" + this.playerId + "-spot" + this.spotNumber, 'background', 'none');
        dojo.style("player-table-" + this.playerId + "-spot" + this.spotNumber, 'box-shadow', 'none');
    };
    PlayerTableSpotStock.prototype.setLocation = function (location) {
        var _a;
        if (this.spot.location) {
            this.locationsStock.removeFromStockById("" + this.spot.location.id);
        }
        this.locationsStock.addToStockWithId(getUniqueId(location.type, (_a = location.passivePowerGuild) !== null && _a !== void 0 ? _a : 0), "" + location.id);
        this.spot.location = location;
    };
    PlayerTableSpotStock.prototype.setSelectableForSwitch = function (selectable) {
        if (!this.spot.lord) {
            return;
        }
        if (this.spot.lord.key) { // can't switch
            dojo.toggleClass("player" + this.playerId + "-spot" + this.spotNumber + "-lord-stock_item_" + this.spot.lord.id, 'disabled', selectable);
        }
        else { // can switch
            this.lordsStock.setSelectionMode(selectable ? 2 : 0);
            dojo.toggleClass("player" + this.playerId + "-spot" + this.spotNumber + "-lord-stock_item_" + this.spot.lord.id, 'selectable', selectable);
            if (!selectable) {
                this.lordsStock.unselectAll();
            }
        }
    };
    PlayerTableSpotStock.prototype.onLordSelection = function () {
        var items = this.lordsStock.getSelectedItems();
        if (items.length == 1) {
            this.playerTable.addSelectedSpot(this.spotNumber);
        }
        else if (items.length == 0) {
            this.playerTable.removeSelectedSpot(this.spotNumber);
        }
    };
    PlayerTableSpotStock.prototype.placeTopLordToken = function () {
        var guild = this.spot.lord.guild;
        var tokenDiv = document.getElementById("top-lord-token-" + guild + "-" + this.playerId);
        this.addTokenDiv(tokenDiv);
    };
    PlayerTableSpotStock.prototype.setupNewLordCard = function (card_div, card_type_id, card_id) {
        var message = getLordTooltip(card_type_id);
        if (message) {
            this.game.addTooltip(card_div.id, message, '');
        }
    };
    PlayerTableSpotStock.prototype.setupNewLocationCard = function (card_div, card_type_id, card_id) {
        var message = getLocationTooltip(card_type_id);
        if (message) {
            this.game.addTooltip(card_div.id, message, '');
        }
    };
    PlayerTableSpotStock.prototype.addTokenDiv = function (tokenDiv) {
        this.tokenWrapper.appendChild(tokenDiv);
    };
    PlayerTableSpotStock.prototype.getTokenDiv = function () {
        return this.tokenWrapper.getElementsByTagName('div')[0];
    };
    return PlayerTableSpotStock;
}());
var SPOTS_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
var PlayerTable = /** @class */ (function () {
    function PlayerTable(game, player, spots) {
        var _this = this;
        this.game = game;
        //private lordsStock: Stock;
        //private locationsStock: Stock;
        this.spotsStock = [];
        this.switchSpots = [];
        this.playerId = Number(player.id);
        dojo.place("<div class=\"whiteblock\">\n            <div class=\"player-name\" style=\"color: #" + player.color + "\">" + player.name + "</div>\n            <div id=\"player-table-" + this.playerId + "\" class=\"player-table\"></div>\n        </div>", 'players-tables');
        SPOTS_NUMBERS.forEach(function (spotNumber) {
            _this.spotsStock[spotNumber] = new PlayerTableSpotStock(game, _this, player, spots[spotNumber], spotNumber);
        });
        this.checkTopLordToken();
    }
    PlayerTable.prototype.checkTopLordToken = function () {
        var lordsSpots = this.spotsStock.filter(function (spotStock) { return spotStock.getLord(); });
        var guilds = new Set(lordsSpots.map(function (spotStock) { return spotStock.getLord().guild; }));
        guilds.forEach(function (guild) {
            var guildLordsSpots = lordsSpots.filter(function (spotStock) { return spotStock.getLord().guild === guild; });
            var topLordSpot = guildLordsSpots[0];
            guildLordsSpots.forEach(function (spot) {
                if (spot.getLord().points > topLordSpot.getLord().points) {
                    topLordSpot = spot;
                }
            });
            topLordSpot.placeTopLordToken();
        });
    };
    PlayerTable.prototype.addLord = function (spot, lord) {
        this.spotsStock[spot].setLord(lord);
        this.checkTopLordToken();
    };
    PlayerTable.prototype.addLocation = function (spot, location) {
        this.spotsStock[spot].setLocation(location);
    };
    PlayerTable.prototype.setSelectableForSwitch = function (selectable) {
        var _this = this;
        SPOTS_NUMBERS.forEach(function (spotNumber) { return _this.spotsStock[spotNumber].setSelectableForSwitch(selectable); });
    };
    PlayerTable.prototype.removeSelectedSpot = function (spot) {
        var index = this.switchSpots.indexOf(spot);
        if (index !== -1) {
            this.switchSpots.splice(index, 1);
            this.setCanSwitch();
        }
    };
    PlayerTable.prototype.addSelectedSpot = function (spot) {
        if (!this.switchSpots.some(function (val) { return val === spot; })) {
            this.switchSpots.push(spot);
            this.setCanSwitch();
        }
    };
    PlayerTable.prototype.setCanSwitch = function () {
        this.game.setCanSwitch(this.switchSpots);
    };
    PlayerTable.prototype.lordSwitched = function (args) {
        var lordSpot1 = this.spotsStock[args.spot1].getLord();
        var lordSpot2 = this.spotsStock[args.spot2].getLord();
        var tokenSpot1 = this.spotsStock[args.spot1].getTokenDiv();
        var tokenSpot2 = this.spotsStock[args.spot2].getTokenDiv();
        this.spotsStock[args.spot1].setLord(lordSpot2);
        this.spotsStock[args.spot2].setLord(lordSpot1);
        if (tokenSpot2) {
            this.spotsStock[args.spot1].addTokenDiv(tokenSpot2);
        }
        if (tokenSpot1) {
            this.spotsStock[args.spot2].addTokenDiv(tokenSpot1);
        }
    };
    return PlayerTable;
}());
var SCORE_MS = 1500;
var Conspiracy = /** @class */ (function () {
    function Conspiracy() {
        this.playersTables = [];
        this.pearlCounters = [];
        this.switchSpots = [];
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
    Conspiracy.prototype.setup = function (gamedatas) {
        console.log("Starting game setup");
        this.gamedatas = gamedatas;
        console.log('gamedatas', gamedatas);
        this.createPlayerPanels(gamedatas);
        this.lordsStacks = new LordsStacks(this, gamedatas.visibleLords, gamedatas.pickLords);
        this.locationsStacks = new LocationsStacks(this, gamedatas.visibleLocations, gamedatas.pickLocations);
        this.createPlayerTables(gamedatas);
        if (Number(gamedatas.gamestate.id) >= 80) { // score or end
            this.onEnteringShowScore();
        }
        this.setupNotifications();
        console.log("Ending game setup");
    };
    ///////////////////////////////////////////////////
    //// Game & client states
    // onEnteringState: this method is called each time we are entering into a new game state.
    //                  You can use this method to perform some user interface changes at this moment.
    //
    Conspiracy.prototype.onEnteringState = function (stateName, args) {
        console.log('Entering state: ' + stateName, args.args);
        switch (stateName) {
            case 'lordStackSelection':
                this.onEnteringLordStackSelection(args.args);
                break;
            case 'lordSelection':
                this.onEnteringLordSelection(args.args);
                break;
            case 'lordSwitch':
                this.onEnteringLordSwitch();
                break;
            case 'locationStackSelection':
                this.onEnteringLocationStackSelection(args.args);
                break;
            case 'locationSelection':
                this.onEnteringLocationSelection(args.args);
                break;
            case 'showScore':
                this.onEnteringShowScore();
                break;
        }
    };
    Conspiracy.prototype.onEnteringLordStackSelection = function (args) {
        if (this.isCurrentPlayerActive()) {
            this.lordsStacks.setSelectable(true, args.limitToHidden);
        }
    };
    Conspiracy.prototype.onEnteringLordSelection = function (args) {
        this.lordsStacks.setPick(true, this.isCurrentPlayerActive(), args.lords);
    };
    Conspiracy.prototype.onEnteringLordSwitch = function () {
        if (this.isCurrentPlayerActive()) {
            this.playersTables[this.player_id].setSelectableForSwitch(true);
        }
    };
    Conspiracy.prototype.onEnteringLocationStackSelection = function (args) {
        if (this.isCurrentPlayerActive()) {
            this.locationsStacks.setSelectable(true, null, args.allHidden);
        }
    };
    Conspiracy.prototype.onEnteringLocationSelection = function (args) {
        console.log(args.locations);
        this.locationsStacks.setPick(true, this.isCurrentPlayerActive(), args.locations);
    };
    Conspiracy.prototype.onEnteringShowScore = function () {
        document.getElementById('stacks').style.display = 'none';
        document.getElementById('score').style.display = 'flex';
        Object.values(this.gamedatas.players).forEach(function (player) {
            var detailedScore = player.detailedScore;
            dojo.place("<tr id=\"score" + player.id + "\">\n                <td class=\"player-name\" style=\"color: #" + player.color + "\">" + player.name + "</td>\n                <td>" + ((detailedScore === null || detailedScore === void 0 ? void 0 : detailedScore.lords) !== undefined ? detailedScore.lords : '') + "</td>\n                <td>" + ((detailedScore === null || detailedScore === void 0 ? void 0 : detailedScore.locations) !== undefined ? detailedScore.locations : '') + "</td>\n                <td>" + ((detailedScore === null || detailedScore === void 0 ? void 0 : detailedScore.coalition) !== undefined ? detailedScore.coalition : '') + "</td>\n                <td>" + ((detailedScore === null || detailedScore === void 0 ? void 0 : detailedScore.pearls) !== undefined ? detailedScore.pearls : '') + "</td>\n                <td>" + ((detailedScore === null || detailedScore === void 0 ? void 0 : detailedScore.pearlMaster) !== undefined ? detailedScore.pearlMaster : '') + "</td>\n            </tr>", 'score-table-body');
        });
    };
    // onLeavingState: this method is called each time we are leaving a game state.
    //                 You can use this method to perform some user interface changes at this moment.
    //
    Conspiracy.prototype.onLeavingState = function (stateName) {
        console.log('Leaving state: ' + stateName);
        switch (stateName) {
            case 'lordStackSelection':
                this.onLeavingLordStackSelection();
                break;
            case 'lordSelection':
                this.onLeavingLordSelection();
                break;
            case 'lordSwitch':
                this.onLeavingLordSwitch();
                break;
            case 'locationStackSelection':
                this.onLeavingLocationStackSelection();
                break;
            case 'locationSelection':
                this.onLeavingLocationSelection();
                break;
        }
    };
    Conspiracy.prototype.onLeavingLordStackSelection = function () {
        this.lordsStacks.setSelectable(false, null);
    };
    Conspiracy.prototype.onLeavingLordSelection = function () {
        this.lordsStacks.setPick(false, false);
    };
    Conspiracy.prototype.onLeavingLordSwitch = function () {
        if (this.isCurrentPlayerActive()) {
            this.playersTables[this.player_id].setSelectableForSwitch(false);
        }
    };
    Conspiracy.prototype.onLeavingLocationStackSelection = function () {
        this.locationsStacks.setSelectable(false);
    };
    Conspiracy.prototype.onLeavingLocationSelection = function () {
        this.locationsStacks.setPick(false, false);
    };
    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    Conspiracy.prototype.onUpdateActionButtons = function (stateName, args) {
        if (this.isCurrentPlayerActive()) {
            switch (stateName) {
                case 'lordSwitch':
                    this.addActionButton('dontSwitch_button', _("Don't switch"), 'onDontSwitch');
                    break;
            }
        }
    };
    ///////////////////////////////////////////////////
    //// Utility methods
    ///////////////////////////////////////////////////
    Conspiracy.prototype.createPlayerPanels = function (gamedatas) {
        var _this = this;
        Object.values(gamedatas.players).forEach(function (player) {
            var playerId = Number(player.id);
            var html = "<div class=\"top-lord-tokens\">";
            GUILD_IDS.forEach(function (guild) { return html += "<div class=\"token guild" + guild + "\" id=\"top-lord-token-" + guild + "-" + player.id + "\"></div>"; });
            html += "</div>";
            dojo.place(html, "player_board_" + player.id);
            dojo.place("<div class=\"pearl-counter\">\n                <div class=\"token pearl\"></div> \n                <span id=\"pearl-counter-" + player.id + "\"></span>\n            </div>", "player_board_" + player.id);
            var counter = new ebg.counter();
            counter.create("pearl-counter-" + player.id);
            counter.setValue(player.pearls);
            _this.pearlCounters[playerId] = counter;
            if (gamedatas.pearlMasterPlayer === playerId) {
                _this.placePearlMasterToken(gamedatas.pearlMasterPlayer);
            }
        });
    };
    Conspiracy.prototype.createPlayerTables = function (gamedatas) {
        var _this = this;
        this.createPlayerTable(gamedatas, Number(this.player_id));
        Object.values(gamedatas.players).filter(function (player) { return Number(player.id) !== Number(_this.player_id); }).forEach(function (player) {
            return _this.createPlayerTable(gamedatas, Number(player.id));
        });
    };
    Conspiracy.prototype.createPlayerTable = function (gamedatas, playerId) {
        this.playersTables[playerId] = new PlayerTable(this, gamedatas.players[playerId], gamedatas.playersTables[playerId]);
    };
    Conspiracy.prototype.lordPick = function (id) {
        if (!this.checkAction('addLord')) {
            return;
        }
        this.takeAction('pickLord', {
            id: id
        });
    };
    Conspiracy.prototype.lordStockPick = function (guild) {
        if (!this.checkAction('chooseVisibleStack')) {
            return;
        }
        this.takeAction('chooseVisibleStack', {
            guild: guild
        });
    };
    Conspiracy.prototype.locationPick = function (id) {
        if (!this.checkAction('addLocation')) {
            return;
        }
        this.takeAction('pickLocation', {
            id: id
        });
    };
    Conspiracy.prototype.takeAction = function (action, data) {
        data = data || {};
        data.lock = true;
        this.ajaxcall("/conspiracy/conspiracy/" + action + ".html", data, this, function () { });
    };
    Conspiracy.prototype.placePearlMasterToken = function (playerId) {
        var pearlMasterToken = document.getElementById('pearlMasterToken');
        if (pearlMasterToken) {
            var animation = this.slideToObject(pearlMasterToken, "player_board_" + playerId);
            dojo.connect(animation, 'onEnd', dojo.hitch(this, function () {
                pearlMasterToken.style.top = 'unset';
                pearlMasterToken.style.left = 'unset';
                pearlMasterToken.style.position = 'unset';
                pearlMasterToken.style.zIndex = 'unset';
                document.getElementById("player_board_" + playerId).appendChild(pearlMasterToken);
            }));
            animation.play();
        }
        else {
            dojo.place('<div id="pearlMasterToken" class="token"></div>', "player_board_" + playerId);
        }
    };
    Conspiracy.prototype.setCanSwitch = function (switchSpots) {
        if (this.switchSpots.length !== 2 && switchSpots.length === 2) {
            this.addActionButton('switch_button', _("Switch"), 'onSwitch');
        }
        else if (this.switchSpots.length === 2 && switchSpots.length !== 2) {
            dojo.destroy('switch_button');
        }
        this.switchSpots = switchSpots.slice();
    };
    Conspiracy.prototype.onSwitch = function () {
        if (!this.checkAction('next')) {
            return;
        }
        this.takeAction('switch', { spots: this.switchSpots.join(',') });
    };
    Conspiracy.prototype.onDontSwitch = function () {
        /*if(!(this as any).checkAction('next')) {
            return;
        }*/
        this.takeAction('dontSwitch');
    };
    Conspiracy.prototype.setScore = function (playerId, column, score) {
        document.getElementById("score" + playerId).getElementsByTagName('td')[column].innerHTML = "" + score;
    };
    ///////////////////////////////////////////////////
    //// Reaction to cometD notifications
    /*
        setupNotifications:

        In this method, you associate each of your game notifications with your local method to handle it.

        Note: game notification names correspond to "notifyAllPlayers" and "notifyPlayer" calls in
                your pylos.game.php file.

    */
    Conspiracy.prototype.setupNotifications = function () {
        //console.log( 'notifications subscriptions setup' );
        var _this = this;
        var notifs = [
            ['lordVisiblePile', 1],
            ['lordPlayed', 1],
            ['lordSwitched', 1],
            ['extraLordRevealed', 1],
            ['locationPlayed', 1],
            ['discardLords', 1],
            ['discardLocations', 1],
            ['newPearlMaster', 1],
            ['scoreLords', SCORE_MS],
            ['scoreLocations', SCORE_MS],
            ['scoreCoalition', SCORE_MS],
            ['scorePearlMaster', SCORE_MS],
            ['scoreTotal', SCORE_MS],
        ];
        notifs.forEach(function (notif) {
            dojo.subscribe(notif[0], _this, "notif_" + notif[0]);
            _this.notifqueue.setSynchronous(notif[0], notif[1]);
        });
    };
    Conspiracy.prototype.notif_lordVisiblePile = function (notif) {
        this.lordsStacks.discardVisibleLordPile(notif.args.guild);
    };
    Conspiracy.prototype.notif_lordPlayed = function (notif) {
        var _a;
        this.playersTables[notif.args.playerId].addLord(notif.args.spot, notif.args.lord);
        this.scoreCtrl[notif.args.playerId].incValue(notif.args.points);
        this.pearlCounters[notif.args.playerId].incValue(notif.args.pearls);
        if ((_a = notif.args.discardedLords) === null || _a === void 0 ? void 0 : _a.length) {
            this.lordsStacks.discardPick(notif.args.discardedLords);
        }
    };
    Conspiracy.prototype.notif_lordSwitched = function (notif) {
        this.playersTables[notif.args.playerId].lordSwitched(notif.args);
    };
    Conspiracy.prototype.notif_extraLordRevealed = function (notif) {
        this.lordsStacks.addLords([notif.args.lord]);
    };
    Conspiracy.prototype.notif_locationPlayed = function (notif) {
        var _a;
        console.log(notif.args.location);
        this.playersTables[notif.args.playerId].addLocation(notif.args.spot, notif.args.location);
        this.locationsStacks.removeLocation(notif.args.location);
        this.scoreCtrl[notif.args.playerId].incValue(notif.args.points);
        this.pearlCounters[notif.args.playerId].incValue(notif.args.pearls);
        if ((_a = notif.args.discardedLocations) === null || _a === void 0 ? void 0 : _a.length) {
            this.locationsStacks.discardPick(notif.args.discardedLocations);
        }
    };
    Conspiracy.prototype.notif_discardLords = function () {
        this.lordsStacks.discardVisible();
    };
    Conspiracy.prototype.notif_discardLocations = function () {
        this.locationsStacks.discardVisible();
    };
    Conspiracy.prototype.notif_newPearlMaster = function (notif) {
        this.placePearlMasterToken(notif.args.playerId);
    };
    Conspiracy.prototype.notif_scoreLords = function (notif) {
        this.setScore(notif.args.playerId, 1, notif.args.points);
    };
    Conspiracy.prototype.notif_scoreLocations = function (notif) {
        this.setScore(notif.args.playerId, 2, notif.args.points);
    };
    Conspiracy.prototype.notif_scoreCoalition = function (notif) {
        this.setScore(notif.args.playerId, 3, notif.args.points);
    };
    Conspiracy.prototype.notif_scorePearlMaster = function (notif) {
        var _this = this;
        Object.keys(this.gamedatas.players).forEach(function (playerId) { return _this.setScore(playerId, 4, notif.args.playerId == Number(playerId) ? 5 : 0); });
    };
    Conspiracy.prototype.notif_scoreTotal = function (notif) {
        this.setScore(notif.args.playerId, 5, notif.args.points);
    };
    return Conspiracy;
}());
define([
    "dojo", "dojo/_base/declare",
    "ebg/core/gamegui",
    "ebg/counter",
    "ebg/stock"
], function (dojo, declare) {
    return declare("bgagame.conspiracy", ebg.core.gamegui, new Conspiracy());
});
