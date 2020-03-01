import { MALE_NAMES, LAST_NAMES } from "./Constants";
import { PokerGame } from "./PokerGame";

export class Character {
    constructor(level, strength, quickness, cunning, guile, grit) {
        this.name = 'Stranger';
        this.symbol = '@';
        this.color = 'white';
        this.isPC = false;
        this.isNPC = true;

        this.cents = 0;
        this.level = level;

        this.strength = strength;
        this.quickness = quickness;
        this.cunning = cunning;
        this.guile = guile;
        this.grit = grit;

        this.health = this.getMaxHealth();
        this.vigilance = this.getMaxVigilance();
        this.subterfuge = this.getMaxSubterfuge();

        this.honor = 0;
        this.menace = 0;
        this.luck = 0;

        this.threat = 0;
        this.opinionOfPC = 0;

        this.utterance = '';
        this.activePokerGame = null;
    }

    getDisplayChar() {
        return {
            symbol: this.symbol,
            color: 'white'
        };
    }

    getMaxHealth() {
        return 10 + this.level + this.strength + this.grit;
    }

    getMaxVigilance() {
        return 5 + this.quickness + this.cunning;
    }

    getMaxSubterfuge() {
        return this.guile + this.quickness + this.cunning;
    }

    startTurn() {
        this.utterance = '';
    }

    takeTurn() {
        this.startTurn();
        this.wait();
    }

    join(pokerGame) {
        this.say(`I'm joining this game.`);
        let p = pokerGame.addPlayer(this);
        this.activePokerGame = pokerGame;
        pokerGame.getNextPlayer(p);
    }

    say(utterance) {
        this.utterance = utterance;
    }

    wait() {
        if (this.vigilance < this.getMaxVigilance()) {
            this.vigilance++;
        }
        this.say(_.sample(['', '', '', '', '*whistle*', '*cough*']));
    }

}

export class PlayerCharacter extends Character {
    constructor() {
        super(0, 0, 0, 0, 0, 0);
        this.name = 'Rodney';
        this.cents = 200;
        this.isPC = true;
        this.isNPC = false;
    }
}


export class Scoundrel extends Character {
    constructor() {
        super(
            _.sample([0, 0, 1, 2]), // Level
            _.sample([0, 1, 1, 2]), // Strength
            _.sample([0, 1, 2, 2]), // Quickness
            _.sample([0, 0, 0, 1]), // Cunning
            _.sample([0, 1, 2, 3]), // Guile
            _.sample([0, 0, 1, 2]), // Grit
        );
        this.name = `${_.sample(MALE_NAMES)} ${_.sample(LAST_NAMES)}`;
        this.symbol = '@';

        this.cents = _.random(10, 2000);

    }
}