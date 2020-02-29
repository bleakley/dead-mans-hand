import { GAME_WINDOW_WIDTH, GAME_WINDOW_HEIGHT, TILES } from './Constants';
import _ from 'lodash';

const halfWidth = Math.floor(GAME_WINDOW_WIDTH / 2);
const halfHeight = Math.floor(GAME_WINDOW_HEIGHT / 2);
const widthOdd = GAME_WINDOW_WIDTH % 2 !== 0;
const heightOdd = GAME_WINDOW_HEIGHT % 2 !== 0;

export class View {
    constructor(game, display) {
        this.game = game;
        this.display = display;

        this.mouseCoords = [0, 0];
    }

    updateMouseCoords(coords) {
        this.mouseCoords = coords;
    }

    getDisplayMouseCoords() {
        return {
            x: this.mouseCoords[0],
            y: this.mouseCoords[1]
        }
    }

    getMapMouseCoords() {
        return this.displayCoordsToMapCoords(this.getDisplayMouseCoords());
    }

    displayCoordsToMapCoords(coords) {
        return {
            x: coords.x + this.game.player.x - halfWidth,
            y: coords.y + this.game.player.y - halfHeight
        }
    }

    drawMap() {

        for (let x = -halfWidth; x < halfWidth + widthOdd ? 1 : 0; x++) {
            for (let y = -halfHeight; y < halfHeight + heightOdd ? 1 : 0; y++) {
                let displayX = x + halfWidth;
                let displayY = y + halfHeight;
                let { x: mapX, y: mapY } = this.displayCoordsToMapCoords({ x: displayX, y: displayY });

                let cellContents = this.game.getCellContents(mapX, mapY);
                let tile = TILES[cellContents.terrain];

                this.display.draw(displayX, displayY, _.sample(tile.symbols), tile.fore, tile.back);
                if (cellContents.characters.length) {
                    let character = cellContents.characters[0].getDisplayChar();
                    this.display.draw(displayX, displayY, character.symbol, character.color, tile.back);
                }
            }
        }
    }

    drawOverlay() {
        let mouseMap = this.getMapMouseCoords();
        let mouseDisplay = this.getDisplayMouseCoords();
        this.display.drawText(0, 0, `Turn: ${this.game.turn} Player: ${this.game.player.x},${this.game.player.y}`);
        this.display.drawText(0, 1, `(Mouse) Map: ${mouseMap.x},${mouseMap.y} Display: ${mouseDisplay.x},${mouseDisplay.y}`);
    }
}