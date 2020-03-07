import { GAME_WINDOW_WIDTH, GAME_WINDOW_HEIGHT, SIDEBAR_WIDTH, TILES, RANGE_POINT_BLANK, RANGE_CLOSE, RANGE_MEDIUM, RANGE_LONG, formatMoney } from './Constants';
import _ from 'lodash';

import bresenham from 'bresenham';

const halfWidth = Math.floor(GAME_WINDOW_WIDTH / 2);
const halfHeight = Math.floor(GAME_WINDOW_HEIGHT / 2);
const widthOdd = GAME_WINDOW_WIDTH % 2 !== 0;
const heightOdd = GAME_WINDOW_HEIGHT % 2 !== 0;

const formatCards = function (cards, hidden = false) {
    return cards.map(card => `%c{${hidden ? 'black' : card.getColor()}}%b{white}${hidden ? '??' : card.toString()}%c{white}%b{black}`).join(' ') + `%c{}`;
}

export class View {
    constructor(game, display) {
        this.game = game;
        this.display = display;

        this.mouseCoords = [0, 0];
        this.cursorCoords = [0, 0];
        this.showCursor = false;

        this.showInventory = false;
        this.inventoryCursor = 0;

        this.showPokerView = false;
        this.tempBetValue = 0;
    }

    clearControls() {
        this.showCursor = false;
        this.showInventory = false;
        this.showPokerView = false;
    }

    toggleInventory() {
        this.showInventory = !this.showInventory;
        if (this.showInventory) {
            this.showPokerView = false;
        }
    }

    togglePokerView() {
        this.showPokerView = !this.showPokerView;
        if (!this.game.player.activePokerPlayerRole) {
            this.showPokerView = false;
        }
        if (this.showPokerView) {
            this.showInventory = false;
        }
    }

    moveCursor(dx, dy) {
        this.cursorCoords = [this.cursorCoords[0] + dx, this.cursorCoords[1] + dy];
    }

    moveInventoryCursor(dy) {
        this.inventoryCursor += dy;
        if (this.inventoryCursor >= this.game.player.inventory.length) {
            this.inventoryCursor = 0;
        }

        if (this.inventoryCursor < 0) {
            this.inventoryCursor = this.game.player.inventory.length - 1;
        }
    }

    cycleTargets() {
        if (this.showCursor) {
            let possibleTargets = this.game.characters.filter(c => c.isNPC).sort((a, b) => a.distanceBetween(this.game.player) - b.distanceBetween(this.game.player));
            let cursorCoordsOnMap = this.getMapCursorCoords();
            let currentTargetedCharacters = this.game.getCharacters(cursorCoordsOnMap.x, cursorCoordsOnMap.y);
            if (currentTargetedCharacters.length) {
                let nextTarget = possibleTargets[possibleTargets.indexOf(currentTargetedCharacters[0]) + 1];
                if (!nextTarget) {
                    nextTarget = possibleTargets[0];
                }
                this.cursorCoords = this.coordsToArray(this.mapCoordsToDisplayCoords({ x: nextTarget.x, y: nextTarget.y }));
            } else if (possibleTargets.length) {
                this.cursorCoords = this.coordsToArray(this.mapCoordsToDisplayCoords({ x: possibleTargets[0].x, y: possibleTargets[0].y }));
            }
        } else {
            let possibleTargets = this.game.characters.filter(c => c.isNPC).sort((a, b) => a.distanceBetween(this.game.player) - b.distanceBetween(this.game.player));
            if (possibleTargets) {
                this.cursorCoords = this.coordsToArray(this.mapCoordsToDisplayCoords({ x: possibleTargets[0].x, y: possibleTargets[0].y }));
            }
        }

        this.showCursor = true;
    }

    updateMouseCoords(coords) {
        let diff = coords[0] !== this.mouseCoords[0] || coords[1] !== this.mouseCoords[1];
        if (diff) {
            this.mouseCoords = coords;
            this.cursorCoords = coords;
        }
        return diff;
    }

    getDisplayCursorCoords() {
        return {
            x: this.cursorCoords[0],
            y: this.cursorCoords[1]
        }
    }

    getMapCursorCoords() {
        return this.displayCoordsToMapCoords(this.getDisplayCursorCoords());
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

    coordsToArray(coords) {
        return [coords.x, coords.y];
    }

    drawCursor() {
        if (!this.showCursor) {
            return;
        }
        let { x: displayX, y: displayY } = this.getDisplayCursorCoords();
        this.display.draw(displayX, displayY, 'X', 'red', 'black');
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
                else if (cellContents.objects.length) {
                    let character = cellContents.objects[0].getDisplayChar();
                    this.display.draw(displayX, displayY, character.symbol, character.color, tile.back);
                }
            }
        }

        if (this.showInventory) {
            this.clearSidebar();
            this.drawInventory();
        } else if (this.showPokerView) {
            this.clearSidebar();
            this.drawPokerSidebar();
        } else {
            this.clearSidebar();
            this.drawSidebar();
        }
        this.drawUtterances();
        this.drawOverlay();
        this.drawCursor();
    }

    drawUtterances() {
        let mapCoords = this.showCursor ? this.getMapCursorCoords() : this.getMapMouseCoords();
        let characters = this.game.getCharacters(mapCoords.x, mapCoords.y);

        (characters.length ? characters : this.game.characters).forEach(character => {
            if (character.utterance) {
                let speechCoords = this.mapCoordsToDisplayCoords({ x: character.x, y: character.y });
                this.display.draw(speechCoords.x + 1, speechCoords.y - 1, '/', 'black', 'white');
                this.display.drawText(speechCoords.x, speechCoords.y - 2, '%c{black}%b{white}' + character.utterance);
            }
        });
    }

    clearSidebar() {
        for (let x = 0; x < SIDEBAR_WIDTH; x++) {
            for (let y = 0; y < GAME_WINDOW_HEIGHT; y++) {
                this.display.draw(GAME_WINDOW_WIDTH + x, y, ' ');
            }
        }
    }

    getKeyboardCommands() {
        let player = this.game.player;
        let commands = [];
        commands.push({
            key: 'TAB',
            description: 'select target'
        });
        commands.push({
            key: 'SPACE',
            description: 'wait'
        });

        if (this.showInventory) {
            commands.push({
                key: 'ESC',
                description: 'hide inventory'
            });
        } else if (this.showPokerView) {
            commands.push({
                key: 'ESC',
                description: 'hide poker'
            });
        } else if (this.showCursor) {
            commands.push({
                key: 'ESC',
                description: 'hide cursor'
            });
        }

        commands.push({
            key: 'I',
            description: this.showInventory ? 'hide inventory' : 'show inventory'
        });

        if (player.canReload()) {
            commands.push({
                key: 'R',
                description: 'reload ' + player.getCurrentWeapon().name
            });
        }

        if (this.showInventory) {
            let selectedItem = player.inventory[this.inventoryCursor];
            if (selectedItem && selectedItem.isWeapon) {
                if (selectedItem !== player.getCurrentWeapon()) {
                    commands.push({
                        key: 'E',
                        description: 'equip ' + selectedItem.name
                    });
                } else {
                    commands.push({
                        key: 'E',
                        description: 'unequip ' + selectedItem.name
                    });
                }

            }
        }

        let pokerRole = this.game.player.activePokerPlayerRole;
        if (pokerRole) {
            if (pokerRole) {
                commands.push({
                    key: 'Q',
                    description: `quit poker game`
                });
            }
            commands.push({
                key: 'P',
                description: this.showPokerView ? 'hide poker' : 'show poker'
            });
            if (pokerRole.isActivePlayer()) {
                let minBet = pokerRole.getMinValidBet();
                let maxBet = pokerRole.getMaxValidBet();
                this.tempBetValue = Math.max(minBet, this.tempBetValue);
                this.tempBetValue = Math.min(maxBet, this.tempBetValue);
                let canIncrease = this.tempBetValue < maxBet;
                let canDecrease = this.tempBetValue > minBet;
                if (pokerRole.canReveal()) {
                    commands.push({
                        key: 'S',
                        description: 'show cards'
                    });
                }
                if (pokerRole.canFold()) {
                    commands.push({
                        key: 'F',
                        description: 'fold'
                    });
                }
                if (pokerRole.canCheck()) {
                    commands.push({
                        key: 'C',
                        description: 'check'
                    });
                }
                if (pokerRole.canCall()) {
                    commands.push({
                        key: 'B',
                        description: `bet ${formatMoney(this.tempBetValue)}`
                    });
                    if (canIncrease && canDecrease) {
                        commands.push({
                            key: '+/-',
                            description: `increase/decrease bet`
                        });
                    } else if (canIncrease) {
                        commands.push({
                            key: '+',
                            description: `increase bet`
                        });
                    } else if (canDecrease) {
                        commands.push({
                            key: '-',
                            description: `decrease bet`
                        });
                    }
                }

            }
            if (pokerRole && pokerRole.isDealer() && pokerRole.game.waitingForDealerAction) {
                commands.push({
                    key: 'D',
                    description: `deal`
                });
            }
        }

        let target = this.getTarget();
        if (target && player.canAttack(target)) {
            commands.push({
                key: 'A',
                description: `attack with ${player.getCurrentWeapon().name}`
            });
        }

        let interactionCount = 0;
        let interactionCommands = []
        for (let interaction of player.getAllowedObjectInteractions()) {
            interactionCount += 1;
            interactionCommands.push({
                key: interactionCount.toString(),
                description: interaction.text
            });
        }
        commands = commands.concat(interactionCommands.reverse());

        return commands;
    }

    drawAvailableCommands() {
        let commands = this.getKeyboardCommands();
        commands.forEach((command, index) => {
            this.drawSidebarRow(GAME_WINDOW_HEIGHT - 1 - index, command.key + ':', command.description);
        });
    }

    drawSidebar() {
        let character = this.game.player;
        this.drawSidebarRow(0, character.name);

        this.drawSidebarRow(2, 'Health:', `${character.health}/${character.getMaxHealth()}`);
        this.drawSidebarRow(3, 'Vigilance:', `${character.vigilance}/${character.getMaxVigilance()}`);
        this.drawSidebarRow(4, 'Subterfuge:', `${character.isPC ? character.subterfuge : '?'}/${character.getMaxSubterfuge()}`);
        this.drawSidebarRow(5, 'Money:', formatMoney(character.cents));

        this.drawSidebarRow(7, 'Level ' + character.level, character.xp + ' xp');
        this.drawSidebarRow(8, 'Strength', character.strength);
        this.drawSidebarRow(9, 'Quickness', character.quickness);
        this.drawSidebarRow(10, 'Cunning', character.cunning);
        this.drawSidebarRow(11, 'Guile', character.guile);
        this.drawSidebarRow(12, 'Grit', character.grit);

        let weapon = character.getCurrentWeapon();
        this.drawWeaponSidebarRow(14, weapon);
        this.drawWeaponStatblock(15, weapon);

        this.drawAvailableCommands();
    }

    drawWeaponSidebarRow(y, weapon, highlighted = false) {
        let ammoString = weapon.isMelee ? '[\u221E]' : `[${weapon.currentAmmo}/${weapon.capacity}]`;
        this.drawSidebarRow(y, _.capitalize(weapon.name), ammoString, highlighted);
    }

    drawCardSidebarRow(y, label, cards, hidden, description = '') {
        this.display.drawText(GAME_WINDOW_WIDTH + 1, y, `${label} ${formatCards(cards, hidden)}${description}`);
    }

    drawSidebarRow(y, leftCol = '', rightCol = '', highlighted) {
        let padding = SIDEBAR_WIDTH - String(leftCol).length - String(rightCol).length - 2;
        this.display.drawText(GAME_WINDOW_WIDTH + 1, y, (highlighted ? '%c{white}' : '') + String(leftCol) + _.repeat(' ', padding) + String(rightCol));
    }

    drawWeaponStatblock(y, weapon) {
        let damage = this.game.player.getDamageWithWeapon(weapon);
        this.drawSidebarRow(y, weapon.description);
        this.drawSidebarRow(y + 1, 'Draw delay:', `${weapon.drawDelay}`);
        this.drawSidebarRow(y + 2, 'Damage:', damage.min === damage.max ? damage.min : `${damage.min}-${damage.max}`);
        this.drawSidebarRow(y + 3, 'Range:', weapon.isMelee ? 'Melee' : `[${[
            weapon.rangeModifiers[RANGE_POINT_BLANK],
            weapon.rangeModifiers[RANGE_CLOSE],
            weapon.rangeModifiers[RANGE_MEDIUM],
            weapon.rangeModifiers[RANGE_LONG]
        ].join('/')}]`);
    }

    drawInventory() {
        let character = this.game.player;
        this.drawSidebarRow(0, 'Inventory');

        this.drawSidebarRow(2, 'Wielding:');
        this.drawWeaponSidebarRow(3, character.getCurrentWeapon());

        this.drawSidebarRow(5, 'Money:', formatMoney(character.cents));
        this.drawSidebarRow(6, 'Bullets:', character.bullets);
        this.drawSidebarRow(7, 'Buckshot:', character.buckshot);
        this.drawSidebarRow(8, 'Arrows:', character.arrows);

        let selectedItem = character.inventory[this.inventoryCursor];
        if (selectedItem) {
            if (selectedItem.isWeapon) {
                this.drawWeaponSidebarRow(10, selectedItem, true);
                this.drawWeaponStatblock(11, selectedItem);
            } else {
                this.drawSidebarRow(10, _.capitalize(selectedItem.name), '', true);
                this.drawSidebarRow(11, selectedItem.description);
            }
        }

        let startListAt = 16;
        character.inventory.forEach((item, i) => {
            if (item.isWeapon) {
                this.drawWeaponSidebarRow(startListAt + i, item, item === selectedItem);
            } else {
                this.drawSidebarRow(startListAt + i, _.capitalize(item.name), '', item === selectedItem);
            }
        });

        this.drawAvailableCommands();
    }

    drawPokerPlayerStatblock(y, player) {
        let roleString = '';
        if (player.game.dealer === player) {
            roleString = ' (dealer)';
        }

        let cardsVisible = player.character.isPC || player.cardsRevealed;
        let cardsDescription = '';
        if (cardsVisible && player.hole.length >= 2) {
            cardsDescription = ` (${player.bestHand().match})`;
        }
        this.drawSidebarRow(y + 0, player.character.name + roleString);
        this.drawSidebarRow(y + 1, 'Cash:', formatMoney(player.character.cents));
        this.drawSidebarRow(y + 2, 'Current bet:', formatMoney(player.currentBet));
        this.drawCardSidebarRow(y + 3, `Cards:`, player.hole, !cardsVisible, cardsDescription);
    }

    drawPokerSidebar() {
        let character = this.game.player;
        let pokerGame = character.activePokerPlayerRole.game;
        this.drawSidebarRow(0, 'Poker Game');
        this.drawSidebarRow(2, `Blinds:`, `${formatMoney(pokerGame.smallBlind)}/${formatMoney(pokerGame.bigBlind)}`);
        this.drawSidebarRow(3, `Pot:`, `${formatMoney(pokerGame.getPot())}`);
        this.drawCardSidebarRow(4, `Common:`, pokerGame.communityCards);

        pokerGame.players.forEach((player, index) => {
            this.drawPokerPlayerStatblock(6 + (index * 5), player);
        });

        this.drawAvailableCommands();
    }

    drawOverlay() {
        let mouseMap = this.getMapMouseCoords();
        let mouseDisplay = this.getDisplayMouseCoords();
        this.display.drawText(0, 0, `Turn: ${this.game.turn} Player: ${this.game.player.x},${this.game.player.y}`);
        this.display.drawText(0, 1, `(Mouse) Map: ${mouseMap.x},${mouseMap.y} Display: ${mouseDisplay.x},${mouseDisplay.y}`);
        this.drawTooltip();
    }

    drawMuzzleFlash() {
        let somethingDrawn = false;
        this.game.projectiles.forEach(projectile => {
            if (projectile.ammoType === 'bullets' || projectile.ammoType === 'buckshot') {
                let points = bresenham(projectile.source.x, projectile.source.y, projectile.target.x, projectile.target.y);
                if (projectile.ammoType === 'bullets') {
                    points = points.slice(1, 2);
                } else if (projectile.ammoType === 'buckshot') {
                    points = points.slice(1, 3);
                }
                points.forEach(point => {
                    let { x: displayX, y: displayY } = this.mapCoordsToDisplayCoords(point);
                    this.display.draw(displayX, displayY, '*', 'orange', 'white');
                    somethingDrawn = true;
                });
            }
        });
        this.game.projectiles = [];
        return somethingDrawn;
    }

    getTarget() {
        let mapCoords = this.showCursor ? this.getMapCursorCoords() : this.getMapMouseCoords();
        let characters = this.game.getCharacters(mapCoords.x, mapCoords.y);
        if (characters.length) {
            return characters[0];
        }
        return null;
    }

    drawTooltip() {
        let mapCoords = this.showCursor ? this.getMapCursorCoords() : this.getMapMouseCoords();
        let displayCoords = this.showCursor ? this.getDisplayCursorCoords() : this.getDisplayMouseCoords();

        let characters = this.game.getCharacters(mapCoords.x, mapCoords.y);
        if (characters.length) {
            let character = characters[0];
            this.display.drawText(displayCoords.x + 2, displayCoords.y + 0, character.name);
            this.display.drawText(displayCoords.x + 2, displayCoords.y + 1, `Health: ${character.health}/${character.getMaxHealth()}`);
            this.display.drawText(displayCoords.x + 2, displayCoords.y + 2, `Vigilance: ${character.vigilance}/${character.getMaxVigilance()}`);
            this.display.drawText(displayCoords.x + 2, displayCoords.y + 3, `Subterfuge: ${character.isPC ? character.subterfuge : '?'}/${character.getMaxSubterfuge()}`);
            this.display.drawText(displayCoords.x + 2, displayCoords.y + 4, `Money: ${formatMoney(character.cents)}`);
            if (character.activePokerPlayerRole) {
                this.display.drawText(displayCoords.x + 2, displayCoords.y + 5, `Current bet: ${formatMoney(character.activePokerPlayerRole.currentBet)}`);
                let cardsVisible = character.isPC || character.activePokerPlayerRole.cardsRevealed;
                this.display.drawText(displayCoords.x + 2, displayCoords.y + 6, `Cards: ${formatCards(character.activePokerPlayerRole.hole, !cardsVisible)}`);
            }
        }

        let pokerGame = this.game.getPokerGame(mapCoords.x, mapCoords.y);
        if (pokerGame) {
            this.display.drawText(displayCoords.x + 2, displayCoords.y, 'Poker Game');
            this.display.drawText(displayCoords.x + 2, displayCoords.y + 1, `Blinds: ${formatMoney(pokerGame.smallBlind)}/${formatMoney(pokerGame.bigBlind)}`);
            this.display.drawText(displayCoords.x + 2, displayCoords.y + 2, `Pot: ${formatMoney(pokerGame.getPot())}`);
            this.display.drawText(displayCoords.x + 2, displayCoords.y + 3, `Common: ${formatCards(pokerGame.communityCards)}`);
            if (pokerGame.unclaimedMoneyOnTable) {
                //this.display.drawText(displayCoords.x + 2, displayCoords.y + 4, `Unclaimed money: ${formatMoney(pokerGame.unclaimedMoneyOnTable)}`);
            }
        }

    }
}