export class Character {
    constructor() {
        this.name = 'Rodney';
        this.symbol = '@';
    }

    getDisplayChar() {
        return {
            symbol: this.symbol,
            color: 'white'
        };
    }

    takeTurn() {

    }
}