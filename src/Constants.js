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

export const TILES = {};
TILES[TILE_DIRT_1] = {
    name: 'dirt',
    symbols: ['.'],
    fore: 'black',
    back: 'burlywood',
};
TILES[TILE_DIRT_2] = {
    name: 'dirt',
    symbols: [''],
    fore: 'black',
    back: 'burlywood',
};
TILES[TILE_GRASS_1] = {
    name: 'grass',
    symbols: [`"`],
    fore: 'black',
    back: 'green',
};
TILES[TILE_GRASS_2] = {
    name: 'grass',
    symbols: [`'`],
    fore: 'black',
    back: 'green',
};
TILES[TILE_GRASS_3] = {
    name: 'grass',
    symbols: [``],
    fore: 'black',
    back: 'green',
};
TILES[TILE_WATER] = {
    name: 'water',
    symbols: ['~', '', '', ''],
    fore: 'white',
    back: 'blue',
};