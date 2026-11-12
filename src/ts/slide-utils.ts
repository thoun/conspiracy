import { dojo } from "./libs.js";

export function slideToObjectAndAttach(game: GameGui<ConspiracyPlayer, ConspiracyGamedatas>, object: HTMLElement, destinationId: string, posX?: number, posY?: number) {
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