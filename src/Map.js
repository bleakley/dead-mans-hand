import { TILE_DIRT_1, TILE_DIRT_2, TILE_GRASS_1, TILE_GRASS_2, TILE_WATER, sampleFromSeed, szudzikPair, TILE_GRASS_3 } from './Constants';
import _ from 'lodash';
import { Town } from './Site';

export class Map {
    constructor() {
        this.seed = _.random(1000);

        this.sites = [
            new Town(-50, -50, 100, 100, this.seed)
        ];

    }

    getTile(x, y) {
        let positionSeed = szudzikPair(this.seed, szudzikPair(x, y));

        if (x < 10 && y < 10) {
            return sampleFromSeed(positionSeed, [TILE_DIRT_1, TILE_DIRT_1, TILE_DIRT_1, TILE_DIRT_2]);
        }

        if (x > 40 && x < 50) {
            return TILE_WATER;
        }
        return sampleFromSeed(positionSeed, [TILE_GRASS_1, TILE_GRASS_1, TILE_GRASS_2, TILE_GRASS_3]);
    }

}