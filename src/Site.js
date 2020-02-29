import { TILE_DIRT_1, TILE_GRASS, TILE_WATER, TILE_DIRT_2 } from './Constants';

export class Site {
    constructor(top, left, width, height) {
        this.top = top;
        this.left = left;
        this.width = width;
        this.height = height;
    }

    getTile(x, y) {
        if (x < 10 && y < 10) {
            return TILE_DIRT;
        }

        if (x > 100 && x < 110) {
            return TILE_WATER;
        }
        return TILE_GRASS;
    }

}

export class Town extends Site {
    constructor(top, left, width, height) {
        super(top, left, width, height);
        this.top = top;
        this.left = left;
        this.width = width;
        this.height = height;

        this.createGround();
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

    //createSaloon()

}

export class Saloon extends Site {
    constructor(top, left, width, height) {
        super(top, left, width, height);
        this.top = top;
        this.left = left;
        this.width = width;
        this.height = height;
    }

    getTile(x, y) {
    }

}