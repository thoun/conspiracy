declare const define;
declare const ebg;
declare const $;
declare const dojo: Dojo;
declare const _;
declare const g_gamethemeurl;

declare const board: HTMLDivElement;

const SCORE_MS = 1500;

const GUILD_COLOR = [];
GUILD_COLOR[1] = '#c1950b';
GUILD_COLOR[2] = '#770405';
GUILD_COLOR[3] = '#097138';
GUILD_COLOR[4] = '#011d4d';
GUILD_COLOR[5] = '#522886';

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
        console.log( 'Entering state: '+stateName /*, args.args*/ );

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
    }

    onEnteringLordStackSelection(args: EnteringLordStackSelectionArgs) {
        if ((this as any).isCurrentPlayerActive()) {
            this.lordsStacks.setSelectable(true, args.limitToHidden);
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

    onEnteringLocationStackSelection(args: EnteringLocationStackSelectionArgs) {
        if ((this as any).isCurrentPlayerActive()) {
            this.locationsStacks.setSelectable(true, null, args.allHidden);
        }
    } 

    onEnteringLocationSelection(args: EnteringLocationSelectionArgs) {console.log(args.locations);
        this.locationsStacks.setPick(true, (this as any).isCurrentPlayerActive(), args.locations);
    }   

    onEnteringShowScore() {
        document.getElementById('stacks').style.display = 'none';
        document.getElementById('score').style.display = 'flex';

        Object.values(this.gamedatas.players).forEach(player => {
            const detailedScore: DetailedScore = (player as any).detailedScore;

            dojo.place(`<tr id="score${player.id}">
                <td class="player-name" style="color: #${player.color}">${player.name}</td>
                <td>${detailedScore?.lords !== undefined ? detailedScore.lords : ''}</td>
                <td>${detailedScore?.locations !== undefined ? detailedScore.locations : ''}</td>
                <td>${detailedScore?.coalition !== undefined ? detailedScore.coalition : ''}</td>
                <td>${detailedScore?.pearlMaster !== undefined ? detailedScore.pearlMaster : ''}</td>
                <td class="total">${detailedScore?.total !== undefined ? detailedScore.total : ''}</td>
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
        this.lordsStacks.setSelectable(false, null);
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

            if (gamedatas.pearlMasterPlayer === playerId) {
                this.placePearlMasterToken(gamedatas.pearlMasterPlayer);
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

    private setScore(playerId: number | string, column: number, score: number) { // column 1 for lord ... 5 for pearl master
        (document.getElementById(`score${playerId}`).getElementsByTagName('td')[column] as HTMLTableDataCellElement).innerHTML = `${score}`;
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
            ['scoreLords', SCORE_MS],
            ['scoreLocations', SCORE_MS],
            ['scoreCoalition', SCORE_MS],
            ['scorePearlMaster', SCORE_MS],
            ['scoreTotal', SCORE_MS],
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

    notif_locationPlayed(notif: Notif<NotifLocationPlayedArgs>) {console.log(notif.args.location);
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

    notif_scoreLords(notif: Notif<NotifScorePointArgs>) {
        this.setScore(notif.args.playerId, 1, notif.args.points);
    }

    notif_scoreLocations(notif: Notif<NotifScorePointArgs>) {
        this.setScore(notif.args.playerId, 2, notif.args.points);
    }

    notif_scoreCoalition(notif: Notif<NotifScorePointArgs>) {
        this.setScore(notif.args.playerId, 3, notif.args.points);
    }

    notif_scorePearlMaster(notif: Notif<NotifScorePearlMasterArgs>) {
        Object.keys(this.gamedatas.players).forEach(playerId => this.setScore(playerId, 4, notif.args.playerId == Number(playerId) ? 5 : 0));
    }

    notif_scoreTotal(notif: Notif<NotifScorePointArgs>) {
        this.setScore(notif.args.playerId, 5, notif.args.points);
    }

    /* This enable to inject translatable styled things to logs or action bar */
    /* @Override */
    public format_string_recursive(log: string, args: any) {
        try {
            if (log && args && !args.processed) {
                // Representation of the color of a card
                if (args.guild !== undefined && args.guild_name !== undefined && args.guild_name[0] !== '<') {
                    args.guild_name = `<span class='log-guild-name' style='color: ${GUILD_COLOR[args.guild]}'>${args.guild_name}</span>`;
                }
            }
        } catch (e) {
            console.error(log,args,"Exception thrown", e.stack);
        }
        return (this as any).inherited(arguments);
    }
} // TODO add animations