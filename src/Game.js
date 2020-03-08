import { Map } from './Map'
import { PlayerCharacter, Scoundrel, LakotaWarrior, LakotaScout, Marshal } from './Character';
import { TILES } from './Constants';
import { PokerGame } from './PokerGame';

export class Game {
    constructor() {
        this.turn = 0;
        this.gameOver = false;
        this.characters = [];
        this.objects = [];
        this.pokerGames = [];
        this.projectiles = [];
        this.guardPosts = [];
        this.map = new Map(this);

        this.player = new PlayerCharacter();
        this.addCharacter(this.player, 0, 0);

        this.characters.forEach(c => {
            c.onGameStart();
        });
    }

    addCharacter(character, x, y) {
        if (this.getCharacters(x, y).length) {
            return;
        }
        this.characters.push(character);
        character.x = x;
        character.y = y;
        character.game = this;
        return character;
    }

    removeCharacter(character) {
        if (character.activePokerPlayerRole) {
            character.activePokerPlayerRole.game.removePlayer(character.activePokerPlayerRole);
        }
        _.remove(this.characters, character);
    }

    addObject(object, x, y) {
        this.objects.push(object);
        object.x = x;
        object.y = y;
        object.game = this;
        return object;
    }

    addPokerGame(x, y) {
        let pokerGame = new PokerGame(this, x, y);
        this.pokerGames.push(pokerGame);
        return pokerGame;
    }

    addProjectile(ammoType, isHit, source, target) {
        this.projectiles.push({ ammoType, isHit, source, target });
    }

    getProjectiles() {
        let copy = [...this.projectiles];
        this.projectiles = [];
        return copy;
    }

    getCharacters(x, y) {
        return this.characters.filter(c => c.x === x && c.y === y);
    }

    getObjects(x, y) {
        return this.objects.filter(c => c.x === x && c.y === y);
    }

    getPokerGame(x, y) {
        return this.pokerGames.find(c => c.x === x && c.y === y);
    }

    getCellContents(x, y) {
        return {
            terrain: this.map.getTile(x, y),
            characters: this.getCharacters(x, y),
            objects: this.getObjects(x, y)
        }
    }

    spaceIsPassable(x, y) {
        if (TILES[this.getCellContents(x, y).terrain].blocksMove) {
            return false;
        }
        if (this.getCharacters(x, y).length) {
            return false;
        }
        if (this.getObjects(x, y).length) {
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
            this.player.move(newX, newY);
            return true;
        } else if (this.getPokerGame(newX, newY)) {
            this.player.startTurn();
            this.player.join(this.getPokerGame(newX, newY));
            return true;
        } else if (this.getObjects(newX, newY).length) {

        }
        return false;
    }

    playerPasses() {
        this.player.startTurn();
        this.player.wait();
        return true;
    }

    repopulateMap() {
        let professionPopulations = {
            /*Undertaker: {
                min: 1,
                max: 1,
                current: 0,
                frequency: 100
            },
            Banker: {
                min: 1,
                max: 1,
                current: 0,
                frequency: 100
            },
            Shopkeeper: {
                min: 1,
                max: 1,
                current: 0,
                frequency: 100
            },*/
            'US Marshal': {
                min: 2,
                max: 2,
                current: 0,
                class: Marshal,
                frequency: 50,
                followers: []
            },
            /*Priest: {
                min: 1,
                max: 1,
                current: 0,
                frequency: 90
            },*/
            Scoundrel: {
                min: 5,
                max: 10,
                current: 0,
                class: Scoundrel,
                frequency: 35,
                followers: []
            },
            'Lakota Warrior': {
                min: 0,
                max: 1,
                current: 0,
                frequency: 5,
                class: LakotaWarrior,
                followers: [LakotaScout, LakotaScout]
            },
            'Lakota Scout': {
                min: 0,
                max: 4,
                current: 0,
                frequency: 10,
                class: LakotaScout,
                followers: [LakotaScout]
            }
        };

        this.characters.forEach(c => professionPopulations[c.profession] && professionPopulations[c.profession].current++);

        let spawn = name => {
            let encounter = professionPopulations[name];
            let x = _.sample([-25, 25]);
            let y = _.sample([-25, 25]);
            this.addCharacter(new encounter.class(), x, y);
            let followers = encounter.followers;
            if (followers.length >= 2) {
                this.addCharacter(new followers[1](), x + 2, y);
            }
            if (followers.length >= 1) {
                this.addCharacter(new followers[0](), x - 2, y);
            }
        }

        for (let profession of Object.keys(professionPopulations)) {
            let population = professionPopulations[profession];
            if (population.current < population.min) {
                spawn(profession);
                return;
            }
        }

        for (let profession of Object.keys(professionPopulations)) {
            let population = professionPopulations[profession];
            if (population.current < population.max && _.random(1, 100) <= population.frequency) {
                spawn(profession);
                return;
            }
        }
    }

    playTurn() {
        this.turn++;

        if (this.turn % 50 === 0) {
            this.repopulateMap();
        }

        this.pokerGames.forEach(g => {
            g.tick();
        });

        this.characters.forEach(c => {
            if (c.isNPC) {
                c.takeTurn();
            }
        });

    }

    isSpaceBlocked(x, y) {
        if (TILES[this.map.getTile(x, y)].blocksMove) {
            return true;
        }

        if (this.getCharacters(x, y).length) {
            return true;
        }

        return false;

    }

}