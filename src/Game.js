import { Map } from './Map'
import { PlayerCharacter, Scoundrel } from './Character';
import { TILES } from './Constants';
import { PokerGame } from './PokerGame';

export class Game {
    constructor() {
        this.map = new Map();
        this.turn = 0;
        this.characters = [];
        this.pokerGames = [];

        this.player = new PlayerCharacter();
        this.addCharacter(this.player, 15, 6);
        this.addCharacter(new Scoundrel, -5, -6);
        this.addPokerGame(-5, -5).flop();

    }

    addCharacter(character, x, y) {
        this.characters.push(character);
        character.x = x;
        character.y = y;
    }

    addPokerGame(x, y) {
        let pokerGame = new PokerGame(this, x, y);
        this.pokerGames.push(pokerGame);
        return pokerGame;
    }

    getCharacters(x, y) {
        return this.characters.filter(c => c.x === x && c.y === y);
    }

    getPokerGame(x, y) {
        return this.pokerGames.find(c => c.x === x && c.y === y);
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
        this.characters.forEach(c => {
            c.takeTurn();
        });
    }

}