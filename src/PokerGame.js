import { HEARTS, DIAMONDS, SPADES, CLUBS, valueToChar, suitToChar } from "./Constants";
import { evaluateAndFindCards } from 'poker-ranking';

export class PokerGame {
    constructor(rootGame, x, y) {

        this.rootGame = rootGame;
        this.x = x;
        this.y = y;

        this.round = 1;
        this.dealer = null;
        this.activePlayer = null;

        this.pot = 0;
        this.smallBlind = 100;
        this.bigBlind = 200;

        this.deck = new Deck();
        this.communityCards = [];

        this.players = [];
    }

    addPlayer(character) {
        this.players.push(new Player(this, character));
    }

    flop() {
        this.communityCards.push(this.deck.draw());
        this.communityCards.push(this.deck.draw());
        this.communityCards.push(this.deck.draw());
    }

    turn() {
        this.communityCards.push(this.deck.draw());
    }

    river() {
        this.communityCards.push(this.deck.draw());
    }

}

class Player {
    constructor(game, character) {
        this.game = game;
        this.character = character;

        this.bet = 0;
        this.hand = [];
    }

    bestHand() {
        return evaluateAndFindCards(this.hand.concat(this.game.communityCards));
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
        return `${valueToChar(this.value)}${suitToChar(this.suit)}`;
    }

    toRankingString() {
        return `${valueToChar(this.value)}${suitToRankingChar(this.suit)}`;
    }

    getColor() {
        if ([HEARTS, DIAMONDS].includes(this.suit)) {
            return 'red';
        }
        return 'black';
    }

}