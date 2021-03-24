function slideToObjectAndAttach(game: Game, object: HTMLElement, destinationId: string) {
    const destination = document.getElementById(destinationId);
    if (destination.contains(object)) {
        return;
    }

    const animation = (game as any).slideToObject(object, destinationId);
    dojo.connect(animation, 'onEnd', dojo.hitch(this, () => {
        object.style.top = 'unset';
        object.style.left = 'unset';
        object.style.position = 'unset';
        object.style.zIndex = 'unset';
        destination.appendChild(object);
    }));
    animation.play();
}