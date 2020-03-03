import { HEARTS, DIAMONDS, SPADES, CLUBS, valueToChar, suitToChar, formatMoney } from "./Constants";
import { analyzeHand, compareHands } from './PokerUtils';

export class PokerGame {
    constructor(rootGame, x, y) {

        this.rootGame = rootGame;
        this.x = x;
        this.y = y;

        this.round = 0;
        this.dealer = null;
        this.activePlayer = null;
        this.lastPlayerToBet = null;

        this.winningHand = { comboRank: -1 };

        this.smallBlind = 100;
        this.bigBlind = 200;

        this.unclaimedMoneyOnTable = 0;

        this.deck = new Deck();
        this.communityCards = [];
        this.discardPile = [];

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
            switch (this.round) {
                case 1:
                    return this.flop();
                case 2:
                    return this.turn();
                case 3:
                    return this.river();
                case 4:
                    return this.reveal();
                case 5:
                    return this.dividePot();
                case 6:
                    this.cleanUp();
                    this.dealer = this.getNextPlayer(this.dealer);
            }
        } else {
            this.activePlayer.play();
            this.activePlayer = this.getNextPlayer(this.activePlayer);
        }

    }

    cleanUp() {
        this.round = 0;
        this.activePlayer = null;
        this.lastPlayerToBet = null;

        this.winningHand = { comboRank: -1 };

        this.discardPile = this.discardPile.concat(this.communityCards);
        this.communityCards = [];

        this.players.forEach(player => {
            player.currentWinnings = 0;
            player.stake = 0;
            player.currentBet = 0;
            player.inCurrentHand = false;
            player.hasTakenActionSinceLastRaise = false;
            player.cardsRevealed = false;
            player.cardsMucked = false;
            player.discardCards();
        })
    }

    allPlayersHaveActed() {
        if (this.round < 5) {
            return this.players.filter(p => p.inCurrentHand && !p.isAllIn()).every(p => p.hasTakenActionSinceLastRaise);
        }
        return this.players.filter(p => p.inCurrentHand).every(p => p.cardsRevealed || p.cardsMucked);
    }

    start() {
        this.dealer.character.say('Deal and ante.');
        this.round = 1;
        
        this.deck.returnCards(this.discardPile);
        this.discardPile = [];
        this.deck.shuffle();

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
        this.players.map(p => p.hasTakenActionSinceLastRaise = false);
        let cards = [this.deck.draw(), this.deck.draw(), this.deck.draw()];
        this.communityCards.push(...cards);
        this.activePlayer = this.getNextPlayer(this.dealer);
        this.lastPlayerToBet = null;
        this.dealer.character.say(`${_.capitalize(cards.map(c => c.getSpokenName()).join(', '))} on the flop.`);
    }

    turn() {
        this.round = 3;
        this.players.map(p => p.hasTakenActionSinceLastRaise = false);
        let card = this.deck.draw();
        this.communityCards.push(card);
        this.activePlayer = this.getNextPlayer(this.dealer);
        this.lastPlayerToBet = null;
        this.dealer.character.say(`${_.capitalize(card.getSpokenName())} on the turn.`);
    }

    river() {
        this.round = 4;
        this.players.map(p => p.hasTakenActionSinceLastRaise = false);
        let card = this.deck.draw();
        this.communityCards.push(card);
        this.activePlayer = this.getNextPlayer(this.dealer);
        this.lastPlayerToBet = null;
        this.dealer.character.say(`${_.capitalize(card.getSpokenName())} on the river.`);
    }

    reveal() {
        this.round = 5;
        this.dealer.character.say('Show your cards!');
        this.activePlayer = this.getNextPlayer(this.dealer);
    }

    dividePot() {
        this.round = 6;
        let winners = this.players.filter(p => compareHands(this.winningHand, p.bestHand()) === 0);
        winners.map(p => p.character.say('I win!'));

        let undividedMoney = 0;
        this.players.forEach(p => {
            undividedMoney += p.currentBet;
            p.character.cents -= p.currentBet;
            p.stake = p.currentBet;
        });

        let pots = [];

        let unassignedPlayers = this.players.sort((a, b) => a.stake - b.stake);

        do {
            let smallestBetPlayers = unassignedPlayers.filter(p => p.stake === unassignedPlayers[0].stake);
            let eachPlayersContribution = smallestBetPlayers[0].stake;
            pots.push({ contestedBy: [...unassignedPlayers], amount: eachPlayersContribution * unassignedPlayers.length });
            unassignedPlayers = _.difference(unassignedPlayers, smallestBetPlayers).sort((a, b) => a.stake - b.stake);
            unassignedPlayers.map(p => p.stake -= eachPlayersContribution);
        } while (unassignedPlayers.length);

        pots.forEach(pot => {
            let bestHandInPot = { comboRank: -1 };
            pot.contestedBy.forEach(p => {
                let hand = p.bestHand();
                if (compareHands(hand, bestHandInPot) <= 0) {
                    bestHandInPot = hand;
                }
            });
            let potWinners = pot.contestedBy.filter(p => compareHands(bestHandInPot, p.bestHand()) === 0);
            potWinners.map(p => p.currentWinnings += Math.floor(pot.amount / potWinners.length));
        });

        console.log(pots);

        let moneyReturnedToPlayers = 0;
        this.players.forEach(p => {
            p.character.cents += p.currentWinnings;
            moneyReturnedToPlayers += p.currentWinnings;
            console.log(`${p.character.name} gets ${formatMoney(p.currentWinnings)} from the pot.`);
        });

        let excess = undividedMoney - moneyReturnedToPlayers;
        this.unclaimedMoneyOnTable += excess;
        console.log(`${formatMoney(excess)} is left on the table.`);

        // clean up at end of hand, start a new hand

    }

}

class Player {
    constructor(game, character) {
        this.game = game;
        this.character = character;

        this.currentWinnings = 0;
        this.stake = 0;

        this.currentBet = 0;
        this.hole = [];

        this.inCurrentHand = false;
        this.hasTakenActionSinceLastRaise = false;
        this.cardsRevealed = false;
        this.cardsMucked = false;
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
        return analyzeHand(this.hole, this.game.communityCards);
    }

    takeCard(card) {
        this.hole.push(card);
    }

    discardCards() {
        this.game.discardPile = this.game.discardPile.concat(this.hole);
        this.hole = [];
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
        if (this.game.round === 5 && !this.cardsRevealed && !this.cardsMucked) {
            return this.revealCards();
        }
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

    revealCards() {
        this.cardsRevealed = true;
        let hand = this.bestHand();
        this.character.say(`${_.capitalize(hand.match)}.`);
        if (compareHands(hand, this.game.winningHand) <= 0) {
            this.game.winningHand = hand;
        }
    }

    muckCards() {
        this.cardsMucked = true;
        this.character.say(`Nothin'.`);
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

    getSpokenName() {
        switch (this.value) {
            case 2:
                return 'two';
            case 3:
                return 'three';
            case 4:
                return 'four';
            case 5:
                return 'five';
            case 6:
                return 'six';
            case 7:
                return 'seven';
            case 8:
                return 'eight';
            case 9:
                return 'nine';
            case 10:
                return 'ten';
            case 11:
                return 'jack';
            case 12:
                return 'queen';
            case 13:
                return 'king';
            case 14:
                return 'ace';
        }
    }

    getColor() {
        if ([HEARTS, DIAMONDS].includes(this.suit)) {
            return 'red';
        }
        return 'black';
    }

}