export class View {
    constructor(game, display) {
        this.game = game;
        this.display = display;
    }

    draw() {
        for (let x = -30; x < 30; x++) {
            for (let y = -20; y < 20; y++) {
                let mapX = this.game.player.x + x;
                let mapY = this.game.player.y + y;
                let displayX = x + 30;
                let displayY = y + 20;

                let colors = {
                    0: 'green',
                    1: 'brown'
                };
                let chars = {
                    0: '"',
                    1: '.'
                };
                
                let cellContents = this.game.getCellContents(mapX, mapY);

                this.display.draw(displayX, displayY, chars[cellContents.terrain]);
                if (cellContents.characters.length) {
                    this.display.draw(displayX, displayY, cellContents.characters[0].getDisplayChar().char);
                }
            }
        }
        this.display.drawText(0, 0, `Turn: ${this.game.turn} ${this.game.player.x},${this.game.player.y}`);
    }
}