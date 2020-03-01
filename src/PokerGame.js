import { HEARTS, DIAMONDS, SPADES, CLUBS, valueToChar, suitToChar, formatMoney } from "./Constants";
import { evaluateAndFindCards } from 'poker-ranking';

export class PokerGame {
    constructor(rootGame, x, y) {

        this.rootGame = rootGame;
        this.x = x;
        this.y = y;

        this.round = 0;
        this.dealer = null;
        this.activePlayer = null;
        this.lastPlayerToBet = null;

        this.smallBlind = 100;
        this.bigBlind = 200;

        this.deck = new Deck();
        this.communityCards = [];

        this.players = [];
    }

    getPot() {
        return this.players.reduce((p, c) => p + c.currentBet, 0);
    }

    getHighestBet() {
        return Math.max(...this.players.map(p => p.currentBet));
    }

    addPlayer(character) {
        let player = new Player(this, character);
        this.players.push(player);
        if (this.players.length === 1) {
            this.dealer = player;
        }
        return player;
    }

    getNextPlayer(previousPlayer) {
        const clockwiseOrder = ['0,-1', '1,-1', '1,0', '1,1', '0,1', '-1,1', '-1,0', '-1,-1'];

        let playersOrderedClockwise = this.players.sort((p1, p2) => {
            let i1 = clockwiseOrder.findIndex(p => p === `${p1.character.x - this.x},${p1.character.y - this.y}`);
            let i2 = clockwiseOrder.findIndex(p => p === `${p2.character.x - this.x},${p2.character.y - this.y}`);
            if (i1 === -1 || i2 === -1) {
                throw new Error('player is not at table');
            }
            return i1 - i2;
        });

        let position = playersOrderedClockwise.findIndex(p => p === previousPlayer);
        let nextPosition = position + 1;
        if (nextPosition >= playersOrderedClockwise.length) {
            nextPosition = 0;
        }

        return playersOrderedClockwise[nextPosition];
    }

    tick() {
        if (this.round === 0 && this.players.length >= 2) {
            return this.start();
        }

        if (this.allPlayersHaveActed()) {
            switch(this.round) {
                case 1:
                    return this.flop();
                case 2:
                    return this.turn();
                case 3:
                    return this.river();
                case 4:
                    return this.reveal();
            }
        } else {
            this.activePlayer.play();
            this.activePlayer = this.getNextPlayer(this.activePlayer);
        }

    }

    allPlayersHaveActed() {
        return this.players.filter(p => p.inCurrentHand && !p.isAllIn()).every(p => p.hasTakenActionSinceLastRaise);
    }

    start() {
        this.dealer.character.say('Deal and ante.');
        this.round = 1;
        this.players.forEach(player => {
            player.inCurrentHand = true;
            player.takeCard(this.deck.draw());
            player.takeCard(this.deck.draw());
        });
        let smallBlindPlayer = this.getNextPlayer(this.dealer);
        smallBlindPlayer.bet(this.smallBlind);
        let bigBlindPlayer = this.getNextPlayer(smallBlindPlayer);
        bigBlindPlayer.bet(this.bigBlind);
        this.activePlayer = this.getNextPlayer(bigBlindPlayer);
        this.lastPlayerToBet = null;
    }

    flop() {
        this.round = 2;
        this.dealer.character.say('The flop.');
        this.players.map(p => p.hasTakenActionSinceLastRaise = false);
        this.communityCards.push(this.deck.draw());
        this.communityCards.push(this.deck.draw());
        this.communityCards.push(this.deck.draw());
        this.activePlayer = this.getNextPlayer(this.dealer);
        this.lastPlayerToBet = null;
    }

    turn() {
        this.round = 3;
        this.dealer.character.say('The turn.');
        this.players.map(p => p.hasTakenActionSinceLastRaise = false);
        this.communityCards.push(this.deck.draw());
        this.activePlayer = this.getNextPlayer(this.dealer);
        this.lastPlayerToBet = null;
    }

    river() {
        this.round = 4;
        this.dealer.character.say('The river.');
        this.players.map(p => p.hasTakenActionSinceLastRaise = false);
        this.communityCards.push(this.deck.draw());
        this.activePlayer = this.getNextPlayer(this.dealer);
        this.lastPlayerToBet = null;
    }

    reveal() {
        this.round = 5;
        this.dealer.character.say('Show your cards!');
    }

}

class Player {
    constructor(game, character) {
        this.game = game;
        this.character = character;

        this.currentBet = 0;
        this.hole = [];

        this.inCurrentHand = false;
        this.hasTakenActionSinceLastRaise = false;
    }

    isDealer() {
        return this.game.dealer === this;
    }

    isActivePlayer() {
        return this.game.activePlayer === this;
    }

    isAllIn() {
        return this.inCurrentHand && this.character.cents === this.currentBet;
    }

    isMatchingHighestBet() {
        return this.inCurrentHand && this.currentBet >= this.game.getHighestBet();
    }

    bestHand() {
        return evaluateAndFindCards(this.hole.concat(this.game.communityCards));
    }

    takeCard(card) {
        this.hole.push(card);
    }

    bet(amount) {
        let maxBet = Math.min(this.character.cents - this.currentBet, amount);
        if (this.currentBet + maxBet > this.game.getHighestBet()) {
            this.game.players.map(p => p.hasTakenActionSinceLastRaise = false);
        }
        this.currentBet += maxBet;
        this.game.lastPlayerToBet = this;
        this.character.say(`I bet ${formatMoney(this.currentBet)}.`);
    }

    play() {
        if (this.isAllIn() || this.isMatchingHighestBet()) {
            this.check();
        } else {
            this.call();
        }
    }

    fold() {
        this.inCurrentHand = false;
        this.character.say(`I fold.`);
        this.hasTakenActionSinceLastRaise = true;
    }

    check() {
        this.character.say(`Check.`);
        this.hasTakenActionSinceLastRaise = true;
    }

    call() {
        this.bet(this.game.getHighestBet() - this.currentBet);
        this.hasTakenActionSinceLastRaise = true;
    }

    raise() {

    }
}

class Deck {
    constructor() {
        this.cards = [];
        [HEARTS, DIAMONDS, SPADES, CLUBS].forEach(suit => {
            for (let value = 2; value < 15; value++) {
                this.cards.push(new Card(value, suit));
            }
        });
        this.shuffle();
    }

    shuffle() {
        this.cards = _.shuffle(this.cards);
    }

    draw() {
        return this.cards.pop();
    }

    count() {
        return this.cards.length;
    }

    returnCards(cards) {
        this.cards = this.cards.concat(cards);
    }
}

class Card {
    constructor(value, suit) {
        this.value = value;
        this.suit = suit;
    }

    toString() {
        return `${valueToChar(this.value)}${suitToChar(this.suit, false)}`;
    }

    toRankingString() {
        return `${valueToChar(this.value)}${suitToChar(this.suit, true)}`;
    }

    getColor() {
        if ([HEARTS, DIAMONDS].includes(this.suit)) {
            return 'red';
        }
        return 'black';
    }

}