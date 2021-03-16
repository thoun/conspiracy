/*declare const define;
declare const ebg;
declare const $;
declare const dojo: Dojo;
declare const _;
declare const g_gamethemeurl;

declare const board: HTMLDivElement;*/
var GUILD_IDS = [1, 2, 3, 4, 5];
var LORD_WIDTH = 220;
var LORD_HEIGHT = 220;
var LORDS_IDS = [1, 2, 3, 4, 5, 6];
var LordsStacks = /** @class */ (function () {
    function LordsStacks(game, visibleLords) {
        this.game = game;
        this.visibleLords = visibleLords;
    }
    LordsStacks.prototype.getCardUniqueId = function (type, guild) {
        return type * 10 + guild;
    };
    LordsStacks.prototype.setSelectable = function (selectable) {
        this.selectable = selectable;
        var action = selectable ? 'add' : 'remove';
        document.getElementById('lord-hidden-pile').classList[action]('visible');
    };
    LordsStacks.prototype.onHiddenLordsClick = function (a, b) {
        // TODO
        console.log(a, b);
        var number = 2 + 2 - 2; // TODO
        var action = number === 1 ? 'chooseOneOnStack' : 'chooseDeckStack';
        if (!this.game.checkAction(action)) {
            return;
        }
        this.game.takeAction(action.replace('choose', 'chooseLord'), {
            number: number
        });
    };
    LordsStacks.prototype.onVisibleLordsClick = function (a, b) {
        // TODO
        console.log(a, b);
        var guild = 3; // TODO
        var lordsNumber = 2 + 2 - 2; // TODO
        var action = lordsNumber === 1 ? 'chooseVisibleStack' : 'chooseVisibleStackMultiple'; // TODO remove multiple
        if (!this.game.checkAction(action)) {
            return;
        }
        this.game.takeAction(action, {
            guild: guild
        });
    };
    return LordsStacks;
}());
/*declare const define;
declare const ebg;
declare const $;
declare const dojo: Dojo;
declare const _;
declare const g_gamethemeurl;

declare const board: HTMLDivElement;*/
var LOCATION_WIDTH = 200;
var LOCATION_HEIGHT = 100;
var LOCATIONS_UNIQUE_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
var LOCATIONS_GUILDS_IDS = [100, 101];
var LocationsStacks = /** @class */ (function () {
    function LocationsStacks(game, visibleLocations) {
        var _this = this;
        this.game = game;
        dojo.connect($('location-hidden-pile'), 'click', this, 'onHiddenLocationClick');
        this.visibleLocationsStock = new ebg.stock();
        this.visibleLocationsStock.create(this.game, $('location-visible-stock'), LOCATION_WIDTH, LOCATION_HEIGHT);
        this.visibleLocationsStock.setSelectionMode(1);
        this.visibleLocationsStock.setSelectionAppearance('class');
        this.visibleLocationsStock.onItemCreate = dojo.hitch(this, 'setupNewLocationCard');
        dojo.connect(this.visibleLocationsStock, 'onChangeSelection', this, 'onVisibleLocationClick');
        this.setupLocationCards([this.visibleLocationsStock]);
        visibleLocations.forEach(function (location) { var _a; return _this.visibleLocationsStock.addToStockWithId(_this.getCardUniqueId(location.type, (_a = location.passivePowerGuild) !== null && _a !== void 0 ? _a : 0), "" + location.id); });
    }
    LocationsStacks.prototype.setSelectable = function (selectable) {
        this.selectable = selectable;
        var action = selectable ? 'add' : 'remove';
        document.getElementById('lord-hidden-pile').classList[action]('visible');
    };
    LocationsStacks.prototype.setupLocationCards = function (locationStocks) {
        var _this = this;
        var cardsurl = g_gamethemeurl + "img/locations.jpg";
        locationStocks.forEach(function (locationStock) {
            LOCATIONS_UNIQUE_IDS.forEach(function (id, index) {
                return locationStock.addItemType(_this.getCardUniqueId(id, 0), 0, cardsurl, index);
            });
            GUILD_IDS.forEach(function (guild, guildIndex) {
                return LOCATIONS_GUILDS_IDS.forEach(function (id, index) {
                    return locationStock.addItemType(_this.getCardUniqueId(id, guild), 0, cardsurl, 14 + guildIndex * LOCATIONS_GUILDS_IDS.length + index);
                });
            });
        });
    };
    LocationsStacks.prototype.getCardUniqueId = function (type, guild) {
        return type * 10 + guild;
    };
    LocationsStacks.prototype.setupNewLocationCard = function (card_div, card_type_id, card_id) {
        // TODO (this as any).addTooltip( card_div.id, this.mowCards.getTooltip(card_type_id), '' );
    };
    LocationsStacks.prototype.onHiddenLocationClick = function (a, b) {
        // TODO
        console.log(a, b);
        var number = 2 + 2 - 2; // TODO
        var action = number === 1 ? 'chooseOneOnStack' : 'chooseDeckStack';
        if (!this.game.checkAction(action)) {
            return;
        }
        this.game.takeAction(action, {
            number: number
        });
    };
    LocationsStacks.prototype.onVisibleLocationClick = function (a, b) {
        // TODO
        console.log(a, b);
        if (!this.game.checkAction('chooseVisibleLocation')) {
            return;
        }
        this.game.takeAction('chooseVisibleLocation');
    };
    return LocationsStacks;
}());
var Conspiracy = /** @class */ (function () {
    function Conspiracy() {
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
        console.log(gamedatas);
        this.lordsStacks = new LordsStacks(this, gamedatas.visibleLords);
        this.locationsStacks = new LocationsStacks(this, gamedatas.visibleLocations);
        this.setupNotifications();
        console.log("Ending game setup");
    };
    ///////////////////////////////////////////////////
    //// Game & client states
    // onEnteringState: this method is called each time we are entering into a new game state.
    //                  You can use this method to perform some user interface changes at this moment.
    //
    Conspiracy.prototype.onEnteringState = function (stateName, args) {
        console.log('Entering state: ' + stateName);
        switch (stateName) {
            case 'lordStackSelection':
                this.onEnteringLordStackSelection(args.args);
                break;
            case 'locationStackSelection':
                this.onEnteringLocationStackSelection(args.args);
                break;
        }
    };
    Conspiracy.prototype.onEnteringLordStackSelection = function (args) {
        if (this.isCurrentPlayerActive()) {
            this.lordsStacks.setSelectable(true);
        }
    };
    Conspiracy.prototype.onEnteringLocationStackSelection = function (args) {
        if (this.isCurrentPlayerActive()) {
            this.locationsStacks.setSelectable(true);
        }
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
            case 'locationStackSelection':
                this.onLeavingLocationStackSelection();
                break;
        }
    };
    Conspiracy.prototype.onLeavingLordStackSelection = function () {
        this.lordsStacks.setSelectable(false);
    };
    Conspiracy.prototype.onLeavingLocationStackSelection = function () {
        this.locationsStacks.setSelectable(false);
    };
    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    Conspiracy.prototype.onUpdateActionButtons = function (stateName, args) {
    };
    ///////////////////////////////////////////////////
    //// Utility methods
    ///////////////////////////////////////////////////
    Conspiracy.prototype.takeAction = function (action, data) {
        data = data || {};
        data.lock = true;
        this.ajaxcall("/conspiracy/conspiracy/" + action + ".html", data, this, function () { });
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
        /*['newTurn', 1],
        ['dicesPlayed', 1],
        ['removeDuplicates', END_TURN_ANIMATIONS_DURATION],
        ['collectBanknote', END_TURN_ANIMATIONS_DURATION],
        ['removeBanknote', END_TURN_ANIMATIONS_DURATION],
        ['removeDices', END_TURN_ANIMATIONS_DURATION],*/
        ];
        notifs.forEach(function (notif) {
            dojo.subscribe(notif[0], _this, "notif_" + notif[0]);
            _this.notifqueue.setSynchronous(notif[0], notif[1]);
        });
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
