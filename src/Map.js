import { TILE_DIRT, TILE_GRASS, TILE_WATER } from './Constants';

export class Map {
    constructor() {

    }

    getTile(x, y) {
        if (x < 10 && y < 10) {
            return TILE_DIRT;
        }

        if (x > 15 && y > 15) {
            return TILE_WATER;
        }
        return TILE_GRASS;
    }

}