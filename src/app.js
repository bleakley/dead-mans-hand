import * as ROT from 'rot-js';
import { Game } from './Game';
import { View } from './View';
import { Controller } from './Controller';
import { GAME_WINDOW_WIDTH, GAME_WINDOW_HEIGHT, SIDEBAR_WIDTH } from './Constants';

let display = new ROT.Display({ width: GAME_WINDOW_WIDTH + SIDEBAR_WIDTH, height: GAME_WINDOW_HEIGHT });
document.body.appendChild(display.getContainer());
let game = new Game();
let view = new View(game, display);
let controller = new Controller(game, view);
window.addEventListener('keydown', controller);
window.addEventListener('mousemove', controller);
window.addEventListener('click', controller);

let animationLoop = () => {
    view.drawMap();
    setTimeout(animationLoop, 900);
};

animationLoop();