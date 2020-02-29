import * as ROT from 'rot-js';
import { Game } from './Game';
import { View } from './View';
import { Controller } from './Controller';

let display = new ROT.Display();
document.body.appendChild(display.getContainer());
let game = new Game();
let view = new View(game, display);
let controller = new Controller(game, view);
window.addEventListener('keydown', controller);
view.draw();