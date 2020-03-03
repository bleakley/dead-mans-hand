export const GAME_WINDOW_WIDTH = 55;
export const GAME_WINDOW_HEIGHT = 45;
export const SIDEBAR_WIDTH = 28; // this is the min width needed to show 'Common: ' and then four tens with suits

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

export const formatMoney = function (cents) {
    if (cents === 0) {
        return '$0';
    }
    if (cents < 100) {
        return `${cents}\u00A2`;
    }
    if (cents % 100 === 0) {
        return `$${cents / 100}`;
    }
    return `$${Number.parseFloat(cents / 100).toFixed(2)}`;
}

export function valueToChar(value) {
    switch (value) {
        case 11:
            return 'J';
        case 12:
            return 'Q';
        case 13:
            return 'K';
        case 14:
            return 'A'
    }
    if (value >= 2 && value <= 10) {
        return value;
    }
    return '?';
}

let count = 0;
let next = () => count++;

export const HEARTS = next();
export const CLUBS = next();
export const DIAMONDS = next();
export const SPADES = next();

export function suitToChar(suit, forRanking) {
    switch (suit) {
        case SPADES:
            return forRanking ? 'S' : '\u2660';
        case HEARTS:
            return forRanking ? 'H' : '\u2665';
        case CLUBS:
            return forRanking ? 'C' : '\u2663';
        case DIAMONDS:
            return forRanking ? 'D' : '\u2666';
    }
    return '?';
}

export const RANGE_POINT_BLANK = next();
export const RANGE_CLOSE = next();
export const RANGE_MEDIUM = next();
export const RANGE_LONG = next();
export const RANGES = {};
RANGES[RANGE_POINT_BLANK] = {
    min: 0,
    max: 1,
    name: 'point blank'
};
RANGES[RANGE_CLOSE] = {
    min: 2,
    max: 6,
    name: 'close'
};
RANGES[RANGE_MEDIUM] = {
    min: 7,
    max: 20,
    name: 'medium'
};
RANGES[RANGE_LONG] = {
    min: 21,
    name: 'long'
};


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

export const MALE_NAMES = [
    'Abner',
    'Adam',
    'August',
    'Austin',
    'Bart',
    'Beau',
    'Billy',
    'Blaze',
    'Bo',
    'Boone',
    'Bowen',
    'Bowie',
    'Brawley',
    'Breaker',
    'Brent',
    'Bret',
    'Brock',
    'Brody',
    'Bronco',
    'Brooks',
    'Buck',
    'Buster',
    'Butch',
    'Cal',
    'Calhoun',
    'Carson',
    'Casey',
    'Cash',
    'Cassidy',
    'Chance',
    'Chandler',
    'Cheyenne',
    'Clay',
    'Clint',
    'Cody',
    'Colt',
    'Colton',
    'Cord',
    'Dallas',
    'Dash',
    'Deacon',
    'Decker',
    'Denver',
    'Destry',
    'Dexter',
    'Dice',
    'Dodge',
    'Duke',
    'Dusty',
    'Dylan',
    'Early',
    'Flint',
    'Gunner',
    'Gus',
    'Hank',
    'Hawk',
    'Heath',
    'Hitch',
    'Houston',
    'Huck',
    'Huckleberry',
    'Jace',
    'Jackson',
    'Jeb',
    'Jed',
    'Jem',
    'Jericho',
    'Jesse',
    'Josh',
    'Judd',
    'Judson',
    'Justice',
    'Kit',
    'Laird',
    'Landry',
    'Levi',
    'Luke',
    'Mack',
    'Maverick',
    'Mccoy',
    'Montana',
    'Nash',
    'Oakley',
    'Otis',
    'Phineas',
    'Pistol',
    'Quentin',
    'Rancher',
    'Ranger',
    'Reeve',
    'Remington',
    'Remy',
    'Reno',
    'Rio',
    'River',
    'Romer',
    'Roper',
    'Roscoe',
    'Rufus',
    'Ryder',
    'Rye',
    'Sawyer',
    'Shane',
    'Shiloh',
    'Silas',
    'Stetson',
    'Tex',
    'Thatcher',
    'Travis',
    'Tripp',
    'Ty',
    'Wade',
    'Walker',
    'West',
    'Westin',
    'Weston',
    'Wild',
    'Wilder',
    'Wyatt',
    'Wylie',
    'Yale',
    'Zalman',
    'Zane',
    'Zeb'
];

export const LAST_NAMES = [
    'Austin',
    'Boone',
    'Bowen',
    'Bowie',
    'Brody',
    'Brooks',
    'Buck',
    'Calhoun',
    'Carson',
    'Casey',
    'Cash',
    'Cassidy',
    'Clay',
    'Cody',
    'Colt',
    'Colton',
    'Cooper',
    'Deacon',
    'Decker',
    'Denver',
    'Dexter',
    'Flint',
    'Ford',
    'Houston',
    'Huckleberry',
    'Jackson',
    'Jones',
    'Laird',
    'Landry',
    'Levi',
    'Mccoy',
    'Miller',
    'Montana',
    'Nash',
    'Oakley',
    'Rancher',
    'Ranger',
    'Reeve',
    'Ryder',
    'Rye',
    'Sawyer',
    'Smith',
    'Stetson',
    'Tex',
    'Thatcher',
    'Walker',
    'West',
    'Westin',
    'Weston'
];