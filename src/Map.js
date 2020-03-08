import { TILES, TILE_GRASS_1, TILE_GRASS_2, TILE_WATER, sampleFromSeed, szudzikPair, TILE_GRASS_3 } from './Constants';
import _ from 'lodash';
import bresenhamGenerator from 'bresenham/generator';
import { Town } from './Site';

export class Map {
    constructor(game) {
        this.seed = _.random(1000);
        this.game = game
        this.sites = [
            new Town(-30, 0, 100, 60, this.seed, this)
        ];

        this.editedTiles = [];

    }

    getTile(x, y) {
        if (this.editedTiles[x] && this.editedTiles[x][y]) {
            return this.editedTiles[x][y];
        }
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

    setTile(x, y, tile) {
        if (!this.editedTiles.hasOwnProperty(x)) {
            this.editedTiles[x] = [];
        }
        this.editedTiles[x][y] = tile;
    }

    firstInterposingObstacleBetween(source, target) {
        let line = bresenhamGenerator(source.x, source.y, target.x, target.y);
        let point = line.next().value; // skip the first space, which is the space the shooter is standing in
        while (point) {
            point = line.next().value;
            if (point) {
                let tile = this.getTile(point.x, point.y);
                if (TILES[tile].blocksVision) {
                    if (point.x === target.x && point.y === target.y) {
                        return null;
                    }
                    return point;
                }
            }
        }
        return null;
    }

    lineOfSightExistsBetween(source, target) {
        return !this.firstInterposingObstacleBetween(source, target);
    }

}