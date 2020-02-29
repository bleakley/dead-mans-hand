export const GAME_WINDOW_WIDTH = 55;
export const GAME_WINDOW_HEIGHT = 45;

export const TILE_DIRT = 0;
export const TILE_GRASS = 1;
export const TILE_WATER = 2;

export const TILES = {};
TILES[TILE_DIRT] = {
    name: 'dirt',
    symbols: ['.'],
    fore: 'black',
    back: 'brown',
};
TILES[TILE_GRASS] = {
    name: 'grass',
    symbols: [`"`],
    fore: 'black',
    back: 'green',
};
TILES[TILE_WATER] = {
    name: 'water',
    symbols: ['~', '', '', ''],
    fore: 'white',
    back: 'blue',
};