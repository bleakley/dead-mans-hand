export class Character {
    constructor() {
        this.name = 'Rodney';
        this.displayChar = '@';
    }

    getDisplayChar() {
        return {
            char: this.displayChar,
            color: 'white'
        };
    }

    takeTurn() {

    }
}