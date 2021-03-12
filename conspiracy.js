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
        //console.log( "Starting game setup" );
        this.gamedatas = gamedatas;
        console.log(gamedatas);
        this.setupNotifications();
        //console.log( "Ending game setup" );
        //colors.forEach(color => dojo.place(this.createDiceHtml(5, color), `dices-test`));
    };
    ///////////////////////////////////////////////////
    //// Game & client states
    // onEnteringState: this method is called each time we are entering into a new game state.
    //                  You can use this method to perform some user interface changes at this moment.
    //
    Conspiracy.prototype.onEnteringState = function (stateName, args) {
        //console.log( 'Entering state: '+stateName );
        switch (stateName) {
            case 'playerTurn':
                this.onEnteringPlayerTurn(args.args);
                break;
        }
    };
    Conspiracy.prototype.onEnteringPlayerTurn = function (args) {
    };
    // onLeavingState: this method is called each time we are leaving a game state.
    //                 You can use this method to perform some user interface changes at this moment.
    //
    Conspiracy.prototype.onLeavingState = function (stateName) {
        switch (stateName) {
            case 'playerTurn':
                this.onLeavingPlayerTurn();
                break;
        }
    };
    Conspiracy.prototype.onLeavingPlayerTurn = function () {
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
    /*public casinoSelected(casino: number) {
        if(!(this as any).checkAction('chooseCasino')) {
            return;
        }

        this.moveDicesToCasino(casino, (this as any).getActivePlayerId());

        this.takeAction("chooseCasino", {
            casino
        });
    }*/
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
