declare const define;
declare const ebg;
declare const $;
declare const dojo: Dojo;
declare const _;
declare const g_gamethemeurl;

declare const board: HTMLDivElement;

class Conspiracy implements ConspiracyGame {
    private gamedatas: ConspiracyGamedatas;
    private lordsStacks: LordsStacks;
    private locationsStacks: LocationsStacks;
    private playersTables: PlayerTable[] = [];

    constructor() {
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

    public setup(gamedatas: ConspiracyGamedatas) {
        
        console.log( "Starting game setup" );
        
        this.gamedatas = gamedatas;

        console.log(gamedatas);
        
        this.lordsStacks = new LordsStacks(this, gamedatas.visibleLords);
        this.locationsStacks = new LocationsStacks(this, gamedatas.visibleLocations);

        Object.keys(gamedatas.players).forEach((playerId) => this.playersTables[playerId] = new PlayerTable(this, playerId, gamedatas.playersTables[playerId]));

        this.setupNotifications();

        console.log( "Ending game setup" );
    }

    ///////////////////////////////////////////////////
    //// Game & client states

    // onEnteringState: this method is called each time we are entering into a new game state.
    //                  You can use this method to perform some user interface changes at this moment.
    //
    public onEnteringState(stateName: string, args: any) {
        console.log( 'Entering state: '+stateName );

        switch (stateName) {
            case 'lordStackSelection':
                this.onEnteringLordStackSelection(args.args);
                break;
            case 'locationStackSelection':
                this.onEnteringLocationStackSelection(args.args);
                break;
        }
    }

    onEnteringLordStackSelection(args: EnteringLordStackSelectionArgs) {
        if ((this as any).isCurrentPlayerActive()) {
            this.lordsStacks.setSelectable(true);
        }
    }

    onEnteringLocationStackSelection(args: EnteringLocationStackSelectionArgs) {
        if ((this as any).isCurrentPlayerActive()) {
            this.locationsStacks.setSelectable(true);
        }
    }    

    // onLeavingState: this method is called each time we are leaving a game state.
    //                 You can use this method to perform some user interface changes at this moment.
    //
    public onLeavingState(stateName: string) {
        console.log( 'Leaving state: '+stateName );

        switch (stateName) {
            case 'lordStackSelection':
                this.onLeavingLordStackSelection();
                break;
            case 'locationStackSelection':
                this.onLeavingLocationStackSelection();
                break;
        }
    }

    onLeavingLordStackSelection() {
        this.lordsStacks.setSelectable(false);
    }

    onLeavingLocationStackSelection() {
        this.locationsStacks.setSelectable(false);
    }

    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    public onUpdateActionButtons(stateName: string, args: any) {

    } 
    

    ///////////////////////////////////////////////////
    //// Utility methods


    ///////////////////////////////////////////////////

    public takeAction(action: string, data?: any) {
        data = data || {};
        data.lock = true;
        (this as any).ajaxcall(`/conspiracy/conspiracy/${action}.html`, data, this, () => {});
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
        //console.log( 'notifications subscriptions setup' );

        const notifs = [
            /*['newTurn', 1],
            ['dicesPlayed', 1],
            ['removeDuplicates', END_TURN_ANIMATIONS_DURATION],
            ['collectBanknote', END_TURN_ANIMATIONS_DURATION],
            ['removeBanknote', END_TURN_ANIMATIONS_DURATION],
            ['removeDices', END_TURN_ANIMATIONS_DURATION],*/
        ];
    
        notifs.forEach((notif) => {
            dojo.subscribe(notif[0], this, `notif_${notif[0]}`);
            (this as any).notifqueue.setSynchronous(notif[0], notif[1]);
        });
    }

    /*notif_newTurn(notif: Notif<NotifNewTurnArgs>) {
        this.placeFirstPlayerToken(notif.args.playerId);
        this.casinos.forEach(casino => casino.setNewBanknotes(notif.args.casinos[casino.casino]));

        notif.args.neutralDices.forEach(neutralDice => {
            this.casinos[neutralDice].addSpaceForPlayer(0);
            dojo.place(this.createDiceHtml(neutralDice, 0, this.neutralColor), this.casinos[neutralDice].getPlayerSpaceId(0));
            this.casinos[neutralDice].reorderDices();
        });
    }

    notif_dicesPlayed(notif: Notif<NotifDicesPlayedArgs>) {
        this.moveDicesToCasino(notif.args.casino, notif.args.playerId);
        this.dicesCounters[notif.args.playerId].toValue(notif.args.remainingDices.player);
        if (this.isVariant()) {                
            this.dicesCountersNeutral[notif.args.playerId].toValue(notif.args.remainingDices.neutral);
        }
    }

    notif_removeDuplicates(notif: Notif<NotifRemoveDuplicatesArgs>) {
        notif.args.playersId.forEach(playerId => this.casinos[notif.args.casino].removeDices(playerId));
    }

    notif_collectBanknote(notif: Notif<NotifCollectBanknoteArgs>) {
        this.casinos[notif.args.casino].slideBanknoteTo(notif.args.id, notif.args.playerId);
        const points = notif.args.value;
        (this as any).scoreCtrl[notif.args.playerId].incValue(points);
        this.setScoreSuffix(notif.args.playerId);

        (this as any).displayScoring( `banknotes${notif.args.casino}`, this.gamedatas.players[notif.args.playerId].color, points*10000, END_TURN_ANIMATIONS_DURATION);
        this.casinos[notif.args.casino].removeDices(notif.args.playerId);
    }

    notif_removeBanknote(notif: Notif<NotifRemoveBanknoteArgs>) {
        this.casinos[notif.args.casino].removeBanknote(notif.args.id);
    }

    notif_removeDices(notif: Notif<NotifRemoveDicesArgs>) {
        this.casinos.forEach(casino => casino.removeDices());
        this.dicesCounters.forEach(dicesCounter => dicesCounter.setValue(notif.args.resetDicesNumber.player));
        if (this.isVariant()) {
            this.dicesCountersNeutral.forEach(dicesCounter => dicesCounter.setValue(notif.args.resetDicesNumber.neutral));
        }
    }*/

}