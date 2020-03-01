export class Character {
    constructor() {
        this.name = 'Rodney';
        this.symbol = '@';

        this.cents = 200;
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