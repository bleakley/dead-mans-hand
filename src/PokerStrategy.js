import { analyzeHand } from "./PokerUtils";
import { Strategy } from "./CRM"

let myStrategy = new Strategy();

function chooseRandom(options) {
    let sum = 0;
    for (let option of options) {
        sum += option.weight;
    }
    let value = Math.random()*sum;
    let cumulativeValue = 0;
    for (let option of options) {
        if (value > cumulativeValue && value < cumulativeValue + option.weight) {
            return option.action;
        }
        cumulativeValue += option.weight;
    }
}

class BucketStrategy {
    constructor(raiseProbability, callProbability, cheatProbability, betProbability) {
        this.raiseProbability = raiseProbability;
        this.callProbability = callProbability;
        this.betProbability = betProbability;
        this.cheatProbability = cheatProbability;
    }

    play(pokerPlayerRole) {
        if (pokerPlayerRole.canCall()) {
            if (pokerPlayerRole.canBet()) {
                let raise = () => {pokerPlayerRole.raise(pokerPlayerRole.getMinValidRaise())};
                let call = () => {pokerPlayerRole.call()};
                let fold = () => {pokerPlayerRole.fold()};
                let cheat = () => {pokerPlayerRole.foldAndKeepBestCard()};
                let options = [{action: raise, weight: this.raiseProbability}, 
                                {action: call, weight: this.callProbability},
                                {action: cheat, weight: this.cheatProbability},
                                {action: fold, weight: 1 -  this.raiseProbability - this.callProbability - this.cheatProbability}]
                chooseRandom(options)()
            }
            else {
                let call = () => {pokerPlayerRole.call()}
                let fold = () => {pokerPlayerRole.fold()}
                let cheat = () => {pokerPlayerRole.foldAndKeepBestCard()};
                let options = [ {action: call, weight: this.callProbability},
                    {action: cheat, weight: this.cheatProbability},
                    {action: fold, weight: 1 -  this.raiseProbability - this.callProbability - this.cheatProbability}]
                chooseRandom(options)()
            }
        }
        else if (pokerPlayerRole.canCheck()) {
            if (pokerPlayerRole.canBet()) {
                let bet = () => {pokerPlayerRole.bet(pokerPlayerRole.getMinValidBet())};
                let check = () => {pokerPlayerRole.check()}
                let options = [{action: bet, weight: this.betProbability}, 
                                {action: check, weight: 1 - this.betProbability}]
                chooseRandom(options)()
            }
            else {
                pokerPlayerRole.check();
            }   
        }
        else {
            pokerPlayerRole.fold();
        }
    }
}

export class PokerStrategy {
    constructor(aggressiveness, cheatiness) {
        this.aggressiveness = aggressiveness;
        this.cheatiness = cheatiness;
    }

    play(pokerPlayerRole) {
        if (pokerPlayerRole.game.round === 5 && !pokerPlayerRole.cardsRevealed && !pokerPlayerRole.cardsMucked) {
            return pokerPlayerRole.revealCards();
        }
        console.log(this.getGameState(pokerPlayerRole))
        this.getBucketStrategy(pokerPlayerRole).play(pokerPlayerRole);
    }

    getGameState(pokerPlayerRole) {
        let gameState = {}
        let allowedActions = {}
        allowedActions.canCall = pokerPlayerRole.canCall();
        allowedActions.canBet = pokerPlayerRole.canBet();
        allowedActions.canCheck = pokerPlayerRole.canCheck();
        allowedActions.canRaise = pokerPlayerRole.canRaise();
        allowedActions.canFold = pokerPlayerRole.canFold();
        
        // Hand strength (0-2)
        gameState.handStrength = Math.min(pokerPlayerRole.bestHand().comboRank, 2);

        // Community hand strength (0-2), 2 in preflop
        let bestCommunityHand = analyzeHand([], pokerPlayerRole.game.communityCards);
        gameState.communityHandStrength = Math.min(bestCommunityHand.comboRank, 2)

        // Round (1-5)
        gameState.round = pokerPlayerRole.game.round;

        return {gameState: gameState, allowedActions: allowedActions}
    }

    getBucketStrategy(pokerPlayerRole) {
        // A pair
        if (pokerPlayerRole.hole[0].value == pokerPlayerRole.hole[1].value) {
            if (this.isFaceCard(pokerPlayerRole.hole[0])) {
                return new BucketStrategy(this.aggressiveness*0.5, 0.4, this.cheatiness*0.1, this.aggressiveness*0.5)
            }
            else {   
                return new BucketStrategy(this.aggressiveness*0.3, 0.4, this.cheatiness*0.1, this.aggressiveness*0.3)
            }
        }

        // One or more face cards
        else if (this.isFaceCard(pokerPlayerRole.hole[0]) || this.isFaceCard(pokerPlayerRole.hole[1])) {
            return new BucketStrategy(this.aggressiveness*0.2, 0.3, this.cheatiness*0.1, this.aggressiveness*0.2)
        }

        // Suited cards
        else if (pokerPlayerRole.hole[0].suit == pokerPlayerRole.hole[1].suit) {
            return new BucketStrategy(this.aggressiveness*0.1, 0.2, this.cheatiness*0.1, this.aggressiveness*0.1)
        }

        // Everything else
        else {
            return new BucketStrategy(this.aggressiveness*0.05, 0.1, this.cheatiness*0.1, this.aggressiveness*0.05)
        }
    }

    isFaceCard(card) {
        return card.value > 10;
    }
}