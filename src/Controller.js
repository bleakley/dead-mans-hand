export class Controller {
    constructor(game, view) {
        this.game = game;
        this.view = view;
    }

    handleEvent(event) {
        switch (event.type) {
            case 'mousemove':
                return this.handleMouseMove(event);
            case 'click':
                return this.handleMouseClick(event);
            case 'keydown':
                return this.handleKeyDown(event);
        }
    }

    movePlayerOrCursor(dx, dy) {
        if (this.view.showInventory && dx === 0) {
            this.view.moveInventoryCursor(dy);
        } else if (this.view.showCursor) {
            this.view.moveCursor(dx, dy);
        } else {
            this.game.movePlayer(dx, dy);
        }
    }

    handleKeyDown(event) {
        console.log(event.keyCode);
        switch (event.keyCode) {
            case 32: // space
                this.game.playerPasses();
                break;
            case 33:
                this.movePlayerOrCursor(1, -1);
                break;
            case 34:
                this.movePlayerOrCursor(1, 1);
                break;
            case 35:
                this.movePlayerOrCursor(-1, 1);
                break;
            case 36:
                this.movePlayerOrCursor(-1, -1);
                break;
            case 37:
                this.movePlayerOrCursor(-1, 0);
                break;
            case 38:
                this.movePlayerOrCursor(0, -1);
                break;
            case 39:
                this.movePlayerOrCursor(1, 0);
                break;
            case 40:
                this.movePlayerOrCursor(0, 1);
                break;
            case 27: // esc
                this.view.clearControls();
                break;
            case 9: // tab
                event.preventDefault();
                this.view.cycleTargets();
                break;
            case 73: // i
                this.view.toggleInventory();
                break;
            case 70: // f
                //this.game.playerFolds();
                break;
            case 67: // c
                //this.game.playerChecks();
                break;
            case 82: // r
                //this.game.playerRaises();
                break;

        }
        this.view.drawMap();
        this.view.drawOverlay();
    }

    handleMouseMove(event) {
        let coords = this.view.display.eventToPosition(event);
        let updated = this.view.updateMouseCoords(coords);
        if (updated) {
            this.view.drawMap();
        }
    }

    handleMouseClick(event) {
        let coords = this.view.display.eventToPosition(event);
        //console.log('You clicked ' + coords);
    }

}