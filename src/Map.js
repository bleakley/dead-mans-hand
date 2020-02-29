const TILE_GRASS = 0;
const TILE_DIRT = 1;

export class Map {
    constructor() {
        
    }

    getTile(x, y) {
        if (x < 10 && y < 10) {
            return TILE_DIRT;
        }
        return TILE_GRASS;
    }

}