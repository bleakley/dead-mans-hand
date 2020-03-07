import { TILE_GRASS_1, TILE_GRASS_2, TILE_WATER, sampleFromSeed, szudzikPair, TILE_GRASS_3 } from './Constants';
import _ from 'lodash';
import { Town } from './Site';

export class Map {
    constructor(game) {
        this.seed = _.random(1000);
        this.game = game
        this.sites = [
            new Town(-30, 0, 100, 60, this.seed, this)
        ];

    }

    getTile(x, y) {
        let site = this.sites.find(s => s.overlapsCell(x, y));
        if (site) {
            return site.getTile(x - site.left, y - site.top);
        }

        let positionSeed = szudzikPair(this.seed, szudzikPair(x, y));

        if (x > 40 && x < 50) {
            return TILE_WATER;
        }
        return sampleFromSeed(positionSeed, [TILE_GRASS_1, TILE_GRASS_1, TILE_GRASS_2, TILE_GRASS_3]);
    }

}