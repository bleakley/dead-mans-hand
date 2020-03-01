import { GAME_WINDOW_WIDTH, GAME_WINDOW_HEIGHT, TILES, formatMoney } from './Constants';
import _ from 'lodash';

const halfWidth = Math.floor(GAME_WINDOW_WIDTH / 2);
const halfHeight = Math.floor(GAME_WINDOW_HEIGHT / 2);
const widthOdd = GAME_WINDOW_WIDTH % 2 !== 0;
const heightOdd = GAME_WINDOW_HEIGHT % 2 !== 0;

const formatCards = function(cards, hidden=false) {
    return cards.map(card => `%c{${hidden ? 'black' : card.getColor()}}%b{white}${hidden ? '??' : card.toString()}%c{white}%b{black}`).join(' ');
}

export class View {
    constructor(game, display) {
        this.game = game;
        this.display = display;

        this.mouseCoords = [0, 0];
    }

    updateMouseCoords(coords) {
        let diff = coords[0] !== this.mouseCoords[0] || coords[1] !== this.mouseCoords[1];
        this.mouseCoords = coords;
        return diff;
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
        };
    }

    mapCoordsToDisplayCoords(coords) {
        return {
            x: coords.x - this.game.player.x + halfWidth,
            y: coords.y - this.game.player.y + halfHeight
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
        this.drawUtterances();
        this.drawOverlay();
    }

    drawUtterances() {
        let mouseMap = this.getMapMouseCoords();
        let characters = this.game.getCharacters(mouseMap.x, mouseMap.y);

        (characters.length ? characters : this.game.characters).forEach(character => {
            if (character.utterance) {
                let speechCoords = this.mapCoordsToDisplayCoords({x: character.x, y: character.y});
                this.display.draw(speechCoords.x + 1, speechCoords.y - 1, '/', 'black', 'white');
                this.display.drawText(speechCoords.x, speechCoords.y - 2, '%c{black}%b{white}' + character.utterance);
            }
        });
    }

    drawOverlay() {
        let mouseMap = this.getMapMouseCoords();
        let mouseDisplay = this.getDisplayMouseCoords();
        this.display.drawText(0, 0, `Turn: ${this.game.turn} Player: ${this.game.player.x},${this.game.player.y}`);
        this.display.drawText(0, 1, `(Mouse) Map: ${mouseMap.x},${mouseMap.y} Display: ${mouseDisplay.x},${mouseDisplay.y}`);
        this.drawTooltip();
    }

    drawTooltip() {
        let mouseMap = this.getMapMouseCoords();
        let mouseDisplay = this.getDisplayMouseCoords();

        let characters = this.game.getCharacters(mouseMap.x, mouseMap.y);
        if (characters.length) {
            let character = characters[0];
            this.display.drawText(mouseDisplay.x + 2, mouseDisplay.y + 0, character.name);
            this.display.drawText(mouseDisplay.x + 2, mouseDisplay.y + 1, `Health: ${character.health}/${character.getMaxHealth()}`);
            this.display.drawText(mouseDisplay.x + 2, mouseDisplay.y + 2, `Vigilance: ${character.vigilance}/${character.getMaxVigilance()}`);
            this.display.drawText(mouseDisplay.x + 2, mouseDisplay.y + 3, `Subterfuge: ${character.isPC ? character.subterfuge : '?'}/${character.getMaxSubterfuge()}`);
            this.display.drawText(mouseDisplay.x + 2, mouseDisplay.y + 4, `Money: ${formatMoney(character.cents)}`);
            if (character.activePokerPlayerRole) {
                this.display.drawText(mouseDisplay.x + 2, mouseDisplay.y + 5, `Current bet: ${formatMoney(character.activePokerPlayerRole.currentBet)}`);
                let cardsVisible = character.isPC || character.activePokerPlayerRole.cardsRevealed;
                this.display.drawText(mouseDisplay.x + 2, mouseDisplay.y + 6, `Hole cards: ${formatCards(character.activePokerPlayerRole.hole, !cardsVisible)}`);
            }
        }

        let pokerGame = this.game.getPokerGame(mouseMap.x, mouseMap.y);
        if (pokerGame) {
            this.display.drawText(mouseDisplay.x + 2, mouseDisplay.y, 'Poker Game');
            this.display.drawText(mouseDisplay.x + 2, mouseDisplay.y + 1, `Blinds: ${formatMoney(pokerGame.smallBlind)}/${formatMoney(pokerGame.bigBlind)}`);
            this.display.drawText(mouseDisplay.x + 2, mouseDisplay.y + 2, `Pot: ${formatMoney(pokerGame.getPot())}`);
            this.display.drawText(mouseDisplay.x + 2, mouseDisplay.y + 3, `Common: ${formatCards(pokerGame.communityCards)}`);
        }

    }
}