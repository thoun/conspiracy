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
    private pearlCounters: Counter[] = [];
    private switchSpots: number[] = [];

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

        console.log('gamedatas', gamedatas);

        this.createPlayerPanels(gamedatas);

        this.lordsStacks = new LordsStacks(this, gamedatas.visibleLords, gamedatas.pickLords);
        this.locationsStacks = new LocationsStacks(this, gamedatas.visibleLocations, gamedatas.pickLocations);

        this.createPlayerTables(gamedatas);

        if (Number(gamedatas.gamestate.id) >= 80) { // score or end
            this.onEnteringShowScore();
        }

        this.setupNotifications();

        console.log( "Ending game setup" );
    }

    ///////////////////////////////////////////////////
    //// Game & client states

    // onEnteringState: this method is called each time we are entering into a new game state.
    //                  You can use this method to perform some user interface changes at this moment.
    //
    public onEnteringState(stateName: string, args: any) {
        console.log( 'Entering state: '+stateName, args.args );

        switch (stateName) {
            case 'lordStackSelection':
                this.onEnteringLordStackSelection();
                break;
            case 'lordSelection':
                this.onEnteringLordSelection(args.args);
                break;
            case 'lordSwitch':
                this.onEnteringLordSwitch();
                break;

            case 'locationStackSelection':
                this.onEnteringLocationStackSelection();
                break;
            case 'locationSelection':
                this.onEnteringLocationSelection(args.args);
                break;

            case 'showScore':
                this.onEnteringShowScore();
                break;
        }
    }

    onEnteringLordStackSelection() {
        if ((this as any).isCurrentPlayerActive()) {
            this.lordsStacks.setSelectable(true);
        }
    }

    onEnteringLordSelection(args: EnteringLordSelectionArgs) {
        this.lordsStacks.setPick(true, (this as any).isCurrentPlayerActive(), args.lords);
    }

    onEnteringLordSwitch() {        
        if ((this as any).isCurrentPlayerActive()) {
            this.playersTables[(this as any).player_id].setSelectableForSwitch(true);
        }
    }

    onEnteringLocationStackSelection() {
        if ((this as any).isCurrentPlayerActive()) {
            this.locationsStacks.setSelectable(true);
        }
    } 

    onEnteringLocationSelection(args: EnteringLocationSelectionArgs) {
        this.locationsStacks.setPick(true, (this as any).isCurrentPlayerActive(), args.locations);
    }   

    onEnteringShowScore() {
        document.getElementById('stacks').style.display = 'none';
        document.getElementById('score').style.display = 'flex';

        Object.values(this.gamedatas.players).forEach(player => {
            const detailedScore: DetailedScore = (player as any).detailedScore;
            
            dojo.place(`<tr>
                <td class="player-name" style="color: #${player.color}">${player.name}</td>
                <td>${detailedScore?.lords !== undefined ? detailedScore.lords : ''}</td>
                <td>${detailedScore?.locations !== undefined ? detailedScore.locations : ''}</td>
                <td>${detailedScore?.coalition !== undefined ? detailedScore.coalition : ''}</td>
                <td>${detailedScore?.pearls !== undefined ? detailedScore.pearls : ''}</td>
                <td>${detailedScore?.pearlMaster !== undefined ? detailedScore.pearlMaster : ''}</td>
            </tr>`, 'score-table-body');
        });
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
    }

    onLeavingLordStackSelection() {
        this.lordsStacks.setSelectable(false);
    }

    onLeavingLordSelection() {
        this.lordsStacks.setPick(false, false);
    }

    onLeavingLordSwitch() {        
        if ((this as any).isCurrentPlayerActive()) {
            this.playersTables[(this as any).player_id].setSelectableForSwitch(false);
        }
    }

    onLeavingLocationStackSelection() {
        this.locationsStacks.setSelectable(false);
    }

    onLeavingLocationSelection() {
        this.locationsStacks.setPick(false, false);
    }

    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    public onUpdateActionButtons(stateName: string, args: any) {
        if((this as any).isCurrentPlayerActive()) {
            switch (stateName) {
                case 'lordSwitch':
                (this as any).addActionButton( 'dontSwitch_button', _("Don't switch"), 'onDontSwitch' );
                break;
            }

        }
    } 
    

    ///////////////////////////////////////////////////
    //// Utility methods


    ///////////////////////////////////////////////////

    private createPlayerPanels(gamedatas: ConspiracyGamedatas) {
        Object.values(gamedatas.players).forEach(player => {
            const playerId = Number(player.id);

            let html = `<div class="top-lord-tokens">`;
            GUILD_IDS.forEach(guild => html += `<div class="token guild${guild}" id="top-lord-token-${guild}-${player.id}"></div>`);
            html += `</div>`;
            dojo.place(html, `player_board_${player.id}`);

            dojo.place(`<div class="pearl-counter">
                <div class="token pearl"></div> 
                <span id="pearl-counter-${player.id}"></span>
            </div>`, `player_board_${player.id}`);

            const counter = new ebg.counter();
            counter.create(`pearl-counter-${player.id}`);
            counter.setValue((player as any).pearls);
            this.pearlCounters[playerId] = counter;

            if (gamedatas.masterPearlsPlayer === playerId) {
                this.placePearlMasterToken(gamedatas.masterPearlsPlayer);
            }
        });
    }

    private createPlayerTables(gamedatas: ConspiracyGamedatas) {
        this.createPlayerTable(gamedatas, Number((this as any).player_id));
        Object.values(gamedatas.players).filter(player => Number(player.id) !== Number((this as any).player_id)).forEach(player => 
            this.createPlayerTable(gamedatas, Number(player.id))
        );
    }

    private createPlayerTable(gamedatas: ConspiracyGamedatas, playerId: number) {
        this.playersTables[playerId] = new PlayerTable(this, gamedatas.players[playerId], gamedatas.playersTables[playerId]);
    }

    public lordPick(id: number) {
        if(!(this as any).checkAction('addLord')) {
            return;
        }

        this.takeAction('pickLord', {
            id
        });
    }

    public lordStockPick(guild: number) {
        if(!(this as any).checkAction('chooseVisibleStack')) {
            return;
        }

        this.takeAction('chooseVisibleStack', {
            guild
        });
    }

    public locationPick(id: number) {
        if(!(this as any).checkAction('addLocation')) {
            return;
        }

        this.takeAction('pickLocation', {
            id
        });
    }

    public takeAction(action: string, data?: any) {
        data = data || {};
        data.lock = true;
        (this as any).ajaxcall(`/conspiracy/conspiracy/${action}.html`, data, this, () => {});
    }

    placePearlMasterToken(playerId: number) {
        const pearlMasterToken = document.getElementById('pearlMasterToken');
        if (pearlMasterToken) {
            const animation = (this as any).slideToObject(pearlMasterToken, `player_board_${playerId}`);
            dojo.connect(animation, 'onEnd', dojo.hitch(this, () => {
                pearlMasterToken.style.top = 'unset';
                pearlMasterToken.style.left = 'unset';
                pearlMasterToken.style.position = 'unset';
                pearlMasterToken.style.zIndex = 'unset';
                document.getElementById(`player_board_${playerId}`).appendChild(pearlMasterToken);
            }));
            animation.play();
        } else {
            dojo.place('<div id="pearlMasterToken" class="token"></div>', `player_board_${playerId}`);
        }
    }

    public setCanSwitch(switchSpots: number[]) {
        if (this.switchSpots.length !== 2 && switchSpots.length === 2) {
            (this as any).addActionButton( 'switch_button', _("Switch"), 'onSwitch' );
        } else if (this.switchSpots.length === 2 && switchSpots.length !== 2) {
            dojo.destroy('switch_button');
        }
        this.switchSpots = switchSpots.slice();
    }

    public onSwitch() {
        if(!(this as any).checkAction('next')) {
            return;
        }
     
        this.takeAction('switch', { spots: this.switchSpots.join(',') });
    }

    public onDontSwitch() {
        /*if(!(this as any).checkAction('next')) {
            return;
        }*/
     
        this.takeAction('dontSwitch');
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
            ['lordVisiblePile', 1],
            ['lordPlayed', 1],
            ['lordSwitched', 1],
            ['extraLordRevealed', 1],
            ['locationPlayed', 1],
            ['discardLords', 1],
            ['discardLocations', 1],
            ['newPearlMaster', 1],
        ];
    
        notifs.forEach((notif) => {
            dojo.subscribe(notif[0], this, `notif_${notif[0]}`);
            (this as any).notifqueue.setSynchronous(notif[0], notif[1]);
        });
    }


    notif_lordVisiblePile(notif: Notif<NotifLordVisiblePileArgs>) {
        this.lordsStacks.discardVisibleLordPile(notif.args.guild);
    }
    

    notif_lordPlayed(notif: Notif<NotifLordPlayedArgs>) {
        this.playersTables[notif.args.playerId].addLord(notif.args.spot, notif.args.lord);
        (this as any).scoreCtrl[notif.args.playerId].incValue(notif.args.points);
        this.pearlCounters[notif.args.playerId].incValue(notif.args.pearls);
        if (notif.args.discardedLords?.length) {
            this.lordsStacks.discardPick(notif.args.discardedLords);
        }
    }

    notif_lordSwitched(notif: Notif<NotifLordSwitchedArgs>) {
        this.playersTables[notif.args.playerId].lordSwitched(notif.args);
    }

    notif_extraLordRevealed(notif: Notif<NotifExtraLordRevealedArgs>) {
        this.lordsStacks.addLords([notif.args.lord]);
    }

    notif_locationPlayed(notif: Notif<NotifLocationPlayedArgs>) {
        this.playersTables[notif.args.playerId].addLocation(notif.args.spot, notif.args.location);
        this.locationsStacks.removeLocation(notif.args.location);
        (this as any).scoreCtrl[notif.args.playerId].incValue(notif.args.points);
        this.pearlCounters[notif.args.playerId].incValue(notif.args.pearls);
        if (notif.args.discardedLocations?.length) {
            this.locationsStacks.discardPick(notif.args.discardedLocations);
        }
    }

    notif_discardLords() {
        this.lordsStacks.discardVisible();
    }

    notif_discardLocations() {
        this.locationsStacks.discardVisible();
    }

    notif_newPearlMaster(notif: Notif<NotifNewPearlMasterArgs>) {
        this.placePearlMasterToken(notif.args.playerId);
    }
/*
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