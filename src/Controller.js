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

    handleKeyDown(event) {
        //console.log(event.keyCode);
        switch (event.keyCode) {
            case 32: // space
                this.game.playerPasses();
                break;
            case 33:
                this.game.movePlayer(1, -1);
                break;
            case 34:
                this.game.movePlayer(1, 1);
                break;
            case 35:
                this.game.movePlayer(-1, 1);
                break;
            case 36:
                this.game.movePlayer(-1, -1);
                break;
            case 37:
                this.game.movePlayer(-1, 0);
                break;
            case 38:
                this.game.movePlayer(0, -1);
                break;
            case 39:
                this.game.movePlayer(1, 0);
                break;
            case 40:
                this.game.movePlayer(0, 1);
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