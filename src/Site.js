import { TILE_DIRT_1, TILE_DIRT_2, TILE_WOOD_FLOOR, TILE_WOOD_WALL, TILE_WOOD_DOOR, TILE_POKER_TABLE } from './Constants';
import { Scoundrel } from './Character';

export class Site {
    constructor(top, left, width, height, seed, map) {
        this.top = top;
        this.left = left;
        this.width = width;
        this.height = height;
        this.seed = seed;
        this.map = map;
    }

    overlapsCell(x, y) {
        if (x < this.left || x > this.left + this.width - 1) {
            return false;
        }
        if (y < this.top || y > this.top + this.height - 1) {
            return false;
        }
        return true;
    }

    getTile(x, y) {
        return this.tiles[x][y];
    }
}

export class Town extends Site {
    constructor(top, left, width, height, seed, map) {
        super(top, left, width, height, seed, map);

        this.createGround();
        this.createSaloon(30, 30, 10, 10);
        this.createSaloon(10, 10, 10, 10);
    }

    createGround() {
        this.tiles = [];
        for (let x = 0; x < this.width; x++) {
            this.tiles[x] = [];
            for (let y = 0; y < this.height; y++) {
                this.tiles[x][y] = _.sample([TILE_DIRT_1, TILE_DIRT_1, TILE_DIRT_1, TILE_DIRT_2]);
            }
        }
    }

    createSaloon(top, left, width, height) {
        for (let x = left; x < left + width; x++) {
            for (let y = top; y < top + height; y++) {
                this.tiles[x][y] = TILE_WOOD_FLOOR;
            }
        }

        for (let x = left; x < left + width; x++) {
            this.tiles[x][top] = TILE_WOOD_WALL;
            this.tiles[x][top + height] = TILE_WOOD_WALL;
        }

        for (let y = top; y < top + height; y++) {
            this.tiles[left][y] = TILE_WOOD_WALL;
            this.tiles[left + width][y] = TILE_WOOD_WALL;
        }
        this.tiles[left + width][top + height] = TILE_WOOD_WALL;

        let poker_table_left = left + 5
        let poker_table_top = top + 5
        this.tiles[poker_table_left][poker_table_top] = TILE_POKER_TABLE;

        this.tiles[left + 6][top + height] = TILE_WOOD_DOOR;

        let npc = this.map.game.addCharacter(new Scoundrel(), this.left + poker_table_left, this.top + poker_table_top - 1);
        let npc2 = this.map.game.addCharacter(new Scoundrel(), this.left + poker_table_left - 1, this.top + poker_table_top);
        let npc3 = this.map.game.addCharacter(new Scoundrel(), this.left + poker_table_left, this.top + poker_table_top + 1);
        
        let poker = this.map.game.addPokerGame(this.left + poker_table_left, this.top + poker_table_top);
        npc.join(poker);
        npc2.join(poker);
        npc3.join(poker);
    }

}