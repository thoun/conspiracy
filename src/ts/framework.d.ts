interface GameGui<P extends Player = Player, G extends Gamedatas<P> = Gamedatas<P>> {
    notifqueue: {
        setSynchronous(notification: string, duration: number): void;
    };
    bgaInternal: {
        flags: { [name: string]: boolean };
    };
}
