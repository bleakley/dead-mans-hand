import { TILE_DIRT_1, TILE_DIRT_2, TILE_WOOD_FLOOR, TILE_WOOD_WALL, TILE_WOOD_DOOR, TILE_POKER_TABLE, TILE_BENCH, TILE_CROSS, TILE_VAULT_DOOR } from './Constants';
import { Scoundrel, Priest, ShopKeep, Banker, Marshal, Undertaker } from './Character';
import { ShopItem } from './Object';
import { BoxOfBullets, BoxOfBuckshot, Shotgun } from './Item';

export class Site {
    constructor(top, left, width, height, seed, map) {
        this.top = top;
        this.left = left;
        this.width = width;
        this.height = height;
        this.seed = seed;
        this.map = map;
    }

    overlapsCell(x, y) {
        if (x < this.left || x > this.left + this.width - 1) {
            return false;
        }
        if (y < this.top || y > this.top + this.height - 1) {
            return false;
        }
        return true;
    }

    getTile(x, y) {
        return this.tiles[x][y];
    }
}

export class Town extends Site {
    constructor(top, left, width, height, seed, map) {
        super(top, left, width, height, seed, map);

        let parcels = [];
        let parcelWidth = 16;
        let padding = 4;
        let roadWidth = 6;
        let parcelTopNorth = height / 2 + roadWidth / 2;
        let parcelTopSouth = height / 2 - roadWidth / 2 - parcelWidth;
        for (let parcelLeft = padding; parcelLeft + parcelWidth < width - padding; parcelLeft += parcelWidth) {
            parcels.push({ top: parcelTopNorth, left: parcelLeft, width: parcelWidth, height: parcelWidth, orientation: 'S' })
            parcels.push({ top: parcelTopSouth, left: parcelLeft, width: parcelWidth, height: parcelWidth, orientation: 'N' })
        }
        this.createGround();

        let parcel = _.sample(parcels);
        _.remove(parcels, parcel);
        this.createSaloon(parcel.top, parcel.left, 10, 10, parcel.orientation);

        parcel = _.sample(parcels);
        _.remove(parcels, parcel);
        this.createSaloon(parcel.top, parcel.left, 10, 10, parcel.orientation);

        parcel = _.sample(parcels);
        _.remove(parcels, parcel);
        this.createChurch(parcel.top, parcel.left, 8, 12, parcel.orientation);

        parcel = _.sample(parcels);
        _.remove(parcels, parcel);
        this.createShop(parcel.top, parcel.left, 8, 8, parcel.orientation);

        parcel = _.sample(parcels);
        _.remove(parcels, parcel);
        this.createBank(parcel.top, parcel.left, 8, 8, parcel.orientation);

        parcel = _.sample(parcels);
        _.remove(parcels, parcel);
        this.createGraveyard(parcel.top, parcel.left, 12, 12, parcel.orientation);
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

    createRoom(top, left, width, height) {
        for (let x = left; x < left + width; x++) {
            for (let y = top; y < top + height; y++) {
                this.tiles[x][y] = TILE_WOOD_FLOOR;
            }
        }

        for (let x = left; x < left + width; x++) {
            this.tiles[x][top] = TILE_WOOD_WALL;
            this.tiles[x][top + height] = TILE_WOOD_WALL;
        }

        for (let y = top; y < top + height; y++) {
            this.tiles[left][y] = TILE_WOOD_WALL;
            this.tiles[left + width][y] = TILE_WOOD_WALL;
        }
        this.tiles[left + width][top + height] = TILE_WOOD_WALL;
    }

    createSaloon(top, left, width, height, orientation) {

        this.createRoom(top, left, width, height);

        let poker_table_left = left + 5
        let poker_table_top = top + 5
        this.tiles[poker_table_left][poker_table_top] = TILE_POKER_TABLE;

        if (orientation === 'N') {
            this.tiles[left + 6][top + height] = TILE_WOOD_DOOR;
        } else {
            this.tiles[left + 6][top] = TILE_WOOD_DOOR;
        }

        let poker = this.map.game.addPokerGame(this.left + poker_table_left, this.top + poker_table_top);

        for (let coordinates of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            if (_.sample([true, false])) {
                let npc = this.map.game.addCharacter(new Scoundrel(), this.left + poker_table_left + coordinates[0], this.top + poker_table_top + coordinates[1]);
                npc.join(poker);
            }
        }
    }

    createChurch(top, left, width, height, orientation) {

        this.createRoom(top, left, width, height);

        if (orientation === 'N') {
            this.tiles[left + width / 2][top + height] = TILE_WOOD_DOOR;
            this.tiles[left + width / 2][top + 1] = TILE_CROSS;
            // Create pews
            for (let x = left + 1; x < left + width; x++) {
                for (let y = top + 3; y < top + height; y += 2) {
                    if (x != left + width / 2) {
                        this.tiles[x][y] = TILE_BENCH;
                    }
                }
            }
        } else {
            this.tiles[left + width / 2][top] = TILE_WOOD_DOOR;
            this.tiles[left + width / 2][top + height - 1] = TILE_CROSS;
            // Create pews
            for (let x = left + 1; x < left + width; x++) {
                for (let y = top + 1; y < top + height - 2; y += 2) {
                    if (x != left + width / 2) {
                        this.tiles[x][y] = TILE_BENCH;
                    }
                }
            }
        }

        let priestY = orientation === 'N' ? top + 2 : top + height - 2;

        let npc = this.map.game.addCharacter(new Priest(), this.left + left + width / 2, this.top + priestY);
    }

    createShop(top, left, width, height, orientation) {

        this.createRoom(top, left, width, height);

        if (orientation === 'N') {
            this.tiles[left + width / 2][top + height] = TILE_WOOD_DOOR;
        } else {
            this.tiles[left + width / 2][top] = TILE_WOOD_DOOR;
        }

        let shopKeepY = orientation === 'N' ? top + 1 : top + height - 1;

        let shopKeep = this.map.game.addCharacter(new ShopKeep(this.top + top, this.left + left, width, height), this.left + left + width / 2, this.top + shopKeepY);
        this.map.game.addObject(new ShopItem(new BoxOfBullets(), 150, shopKeep), this.left + left + 1, this.top + top + 1);
        this.map.game.addObject(new ShopItem(new BoxOfBuckshot(), 150, shopKeep), this.left + left + 2, this.top + top + 1);
        this.map.game.addObject(new ShopItem(new Shotgun(), 3000, shopKeep), this.left + left + 6, this.top + top + 1);

    }

    createGraveyard(top, left, width, height, orientation) {

        let undertaker = this.map.game.addCharacter(new Undertaker(this.top + top, this.left + left, width, height), this.left + left + width / 2, this.top + top + height / 2);

    }

    createBank(top, left, width, height, orientation) {

        let lobbyHeight = 4;
        let vaultHeight = height - lobbyHeight;

        let vaultTop = orientation === 'N' ? top : top + lobbyHeight;
        let lobbyTop = orientation === 'N' ? top + lobbyHeight : top;

        this.createRoom(lobbyTop, left, width, lobbyHeight);
        this.createRoom(vaultTop, left, width, vaultHeight);

        if (orientation === 'N') {
            this.tiles[left + width / 2][top + height] = TILE_WOOD_DOOR;
            this.tiles[left + width / 2][lobbyTop] = TILE_VAULT_DOOR;
        } else {
            this.tiles[left + width / 2][top] = TILE_WOOD_DOOR;
            this.tiles[left + width / 2][vaultTop] = TILE_VAULT_DOOR;
        }

        let bankerY = orientation === 'N' ? lobbyTop + 1 : vaultTop - 1;

        let banker = this.map.game.addCharacter(new Banker(this.top + vaultTop, this.left + left, width, vaultHeight), this.left + left + width / 2, this.top + bankerY);
        
        let marshalY = orientation === 'N' ? top + height + 1 : top - 1;

        this.map.game.addCharacter(new Marshal(), this.left + left + width / 2 + 2, this.top + marshalY);
        this.map.game.addCharacter(new Marshal(), this.left + left + width / 2 - 2, this.top + marshalY);

        this.map.game.guardPosts.push({
            x: this.left + left + width / 2 + 2,
            y: this.top + marshalY
        });

        this.map.game.guardPosts.push({
            x: this.left + left + width / 2 - 2,
            y: this.top + marshalY
        });
    }

}