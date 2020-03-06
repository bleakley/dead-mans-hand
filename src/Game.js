import { Map } from './Map'
import { PlayerCharacter } from './Character';
import { TILES } from './Constants';
import { PokerGame } from './PokerGame';

export class Game {
    constructor() {
        this.turn = 0;
        this.characters = [];
        this.pokerGames = [];
        this.map = new Map(this);

        this.player = new PlayerCharacter();
        this.addCharacter(this.player, -2, 2);
    }

    addCharacter(character, x, y) {
        this.characters.push(character);
        character.x = x;
        character.y = y;
        character.game = this;
        return character;
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

        if (this.player.activePokerPlayerRole) {
            return false;
        }

        if (this.spaceIsPassable(newX, newY)) {
            this.player.startTurn();
            this.player.x = newX;
            this.player.y = newY;
            return true;
        } else if (this.getPokerGame(newX, newY)) {
            this.player.startTurn();
            this.player.join(this.getPokerGame(newX, newY));
            return true;
        }
        return false;
    }

    playerPasses() {
        this.player.startTurn();
        this.player.wait();
        return true;
    }

    playTurn() {
        this.turn++;

        this.pokerGames.forEach(g => {
            g.tick();
        });

        this.characters.forEach(c => {
            if (c.isNPC) {
                c.takeTurn();
            }
        });

    }

}