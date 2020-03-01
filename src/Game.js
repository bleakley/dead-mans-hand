import { Map } from './Map'
import { Character } from './Character';
import { TILES } from './Constants';

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

    spaceIsPassable(x, y) {
        if (TILES[this.getCellContents(x, y).terrain].blocksMove) {
            return false;
        }
        if (this.getCharacters(x, y).length) {
            return false;
        }
        return true;
    }

    movePlayer(dx, dy) {
        let newX = this.player.x + dx;
        let newY = this.player.y + dy;

        if (this.spaceIsPassable(newX, newY)) {
            this.player.x = newX;
            this.player.y = newY;
            this.playTurn();
        }

    }

    playTurn() {
        this.turn++;
    }

}