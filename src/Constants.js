export const GAME_WINDOW_WIDTH = 55;
export const GAME_WINDOW_HEIGHT = 45;

export function fromSeed(seed, max = 1, min = 0) {

    let temp = (seed * 9301 + 49297) % 233280;
    var rnd = temp / 233280;

    return min + rnd * (max - min);
}

export function szudzikPair(a, b) {
    let A = a >= 0 ? 2 * a : -2 * a - 1;
    let B = b >= 0 ? 2 * b : -2 * b - 1;
    return A >= B ? A * A + A + B : A + B * B;
}

export function sampleFromSeed(seed, items) {
    return items[Math.floor(fromSeed(seed) * items.length)];
}

let count = 0;
let next = () => count++;

export const TILE_DIRT_1 = next();
export const TILE_DIRT_2 = next();
export const TILE_GRASS_1 = next();
export const TILE_GRASS_2 = next();
export const TILE_GRASS_3 = next();
export const TILE_WATER = next();
export const TILE_WOOD_FLOOR = next();
export const TILE_WOOD_WALL = next();
export const TILE_WOOD_DOOR = next();
export const TILE_POKER_TABLE = next();

export const TILES = {};
TILES[TILE_DIRT_1] = {
    name: 'dirt',
    symbols: ['.'],
    fore: 'black',
    back: 'burlywood',
    blocksMove: false,
    blocksVision: false
};
TILES[TILE_DIRT_2] = {
    name: 'dirt',
    symbols: [''],
    fore: 'black',
    back: 'burlywood',
    blocksMove: false,
    blocksVision: false
};
TILES[TILE_GRASS_1] = {
    name: 'grass',
    symbols: [`"`],
    fore: 'black',
    back: 'green',
    blocksMove: false,
    blocksVision: false
};
TILES[TILE_GRASS_2] = {
    name: 'grass',
    symbols: [`'`],
    fore: 'black',
    back: 'green',
    blocksMove: false,
    blocksVision: false
};
TILES[TILE_GRASS_3] = {
    name: 'grass',
    symbols: [``],
    fore: 'black',
    back: 'green',
    blocksMove: false,
    blocksVision: false
};
TILES[TILE_WATER] = {
    name: 'water',
    symbols: ['~', '', '', ''],
    fore: 'white',
    back: 'blue',
    blocksMove: true,
    blocksVision: false
};
TILES[TILE_WOOD_FLOOR] = {
    name: 'wood floor',
    symbols: ['='],
    fore: 'white',
    back: 'darkgoldenrod',
    blocksMove: false,
    blocksVision: false
};
TILES[TILE_WOOD_WALL] = {
    name: 'wood wall',
    symbols: ['#'],
    fore: 'darkgoldenrod',
    back: 'brown',
    blocksMove: true,
    blocksVision: true
};
TILES[TILE_WOOD_DOOR] = {
    name: 'wood door',
    symbols: [';'],
    fore: 'black',
    back: 'darkgoldenrod',
    blocksMove: false,
    blocksVision: true
};
TILES[TILE_POKER_TABLE] = {
    name: 'poker table',
    symbols: ['O'],
    fore: 'black',
    back: 'brown',
    blocksMove: true,
    blocksVision: false
};