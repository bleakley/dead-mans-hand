import { Map } from './Map'
import { Character } from './Character';

export class Game {
    constructor() {
        this.map = new Map();
        this.player = new Character();
        this.turn = 0;

        this.characters = [];

        this.addCharacter(this.player, 15, 15);

    }

    addCharacter(character, x, y) {
        this.characters.push(character);
        character.x = x;
        character.y = y;
    }

    getCharacters(x, y) {
        return this.characters.filter(c => c.x === x && c.y === y);
    }

    getCellContents(x, y) {
        return {
            terrain: this.map.getTile(x, y),
            characters: this.getCharacters(x, y)
        }
    }

    movePlayer(dx, dy) {
        this.player.x += dx;
        this.player.y += dy;
        this.playTurn();
    }

    playTurn() {
        this.turn++;
    }

}