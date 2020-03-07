import { TILE_DIRT_1, TILE_DIRT_2, TILE_WOOD_FLOOR, TILE_WOOD_WALL, TILE_WOOD_DOOR, TILE_POKER_TABLE, TILE_BENCH, TILE_CROSS } from './Constants';
import { Scoundrel, Priest, ShopKeep } from './Character';
import { ShopItem } from './Object';
import { CanOfBeans } from './Item';

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
        this.createChurch(35, 10, 8, 12)
        this.createShop(10, 30, 8, 8);
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
        
        let poker = this.map.game.addPokerGame(this.left + poker_table_left, this.top + poker_table_top);
        
        for (let coordinates of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            if (_.sample([true, false])) {
                let npc = this.map.game.addCharacter(new Scoundrel(), this.left + poker_table_left + coordinates[0], this.top + poker_table_top + coordinates[1]);
                npc.join(poker);
            }
        }
    }

    createChurch(top, left, width, height) {
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

        this.tiles[left + width/2][top + height] = TILE_WOOD_DOOR;
        this.tiles[left + width/2][top + 1] = TILE_CROSS;

        // Create pews
        for (let x = left + 1; x < left + width; x++) {
            for (let y = top + 3; y < top + height; y += 2) {
                if (x != left + width/2) {
                    this.tiles[x][y] = TILE_BENCH;
                }
            }
        }

        
        let npc = this.map.game.addCharacter(new Priest(), this.left + left + width/2, this.top + top + 2);
    }

    createShop(top, left, width, height) {
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

        this.tiles[left + width/2][top + height] = TILE_WOOD_DOOR;


        let shopKeep = this.map.game.addCharacter(new ShopKeep(this.top + top, this.left + left, width, height), this.left + left + width/2, this.top + top + 1);
        this.map.game.addObject(new ShopItem(new CanOfBeans(), 50, shopKeep), this.left + left + 1, this.top + top + 1);

    }


}