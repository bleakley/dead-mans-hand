import { analyzeHand } from "./PokerUtils";

let ACTIONS = [];
ACTIONS.push(['call', 'raise', 'fold', 'fold-and-keep']);
ACTIONS.push(['call', 'fold', 'fold-and-keep']);
ACTIONS.push(['fold', 'fold-and-keep']);
ACTIONS.push(['bet', 'check']);

function chooseRandom(options) {
    let sum = 0;
    for (let option in options) {
        sum += options[option];
    }
    let value = Math.random()*sum;
    let cumulativeValue = 0;
    for (let option in options) {
        if (value > cumulativeValue && value < cumulativeValue + options[option]) {
            return option;
        }
        cumulativeValue += options[option];
    }
    throw "No option chosen"; 
}

function getGameState(pokerPlayerRole) {
    let gameState = {actions: []}
    if (pokerPlayerRole.canCall()) {
        gameState.actions.push('call');
    }
    if (pokerPlayerRole.canBet()) {
        gameState.actions.push('bet');
    }
    if (pokerPlayerRole.canCheck()) {
        gameState.actions.push('check');
    }
    if (pokerPlayerRole.canRaise()) {
        gameState.actions.push('raise');
    }
    if (pokerPlayerRole.canFold()) {
        gameState.actions.push('fold');
        gameState.actions.push('fold-and-keep');
    }
    
    // Hand strength (0-2)
    gameState.handStrength = Math.min(pokerPlayerRole.bestHand().comboRank, 2);

    // Community hand strength (0-2), 2 in preflop
    let bestCommunityHand = analyzeHand([], pokerPlayerRole.game.communityCards);
    gameState.communityHandStrength = Math.min(bestCommunityHand.comboRank, 2)

    // Round (1-5)
    gameState.round = pokerPlayerRole.game.round;

    return gameState;
}

function getGameStateString(gameState) {
    let str = '';
    let props = Object.keys(gameState).sort()
    for (let prop of props) {
        str += gameState[prop].toString() + ',';
    }
    return str;
}

function performAction(pokerPlayerRole, action) {
    switch (action) {
        case 'bet':
            pokerPlayerRole.bet(pokerPlayerRole.getMinValidBet());
            break;
        case 'check':
            pokerPlayerRole.check();
            break;
        case 'raise':
            pokerPlayerRole.raise(pokerPlayerRole.getMinValidRaise());
            break;
        case 'fold':
            pokerPlayerRole.fold();
            break;
        case 'fold-and-keep':
            pokerPlayerRole.foldAndKeepBestCard();
            break;
        case 'call':
            pokerPlayerRole.call();
            break;
        default:
            throw "Unknown action " + action;
    }
}

export class PokerStrategy {
    constructor () {
        this.sigma = [];
        let gameState = {};
        for(gameState.handStrength = 0; gameState.handStrength < 3; gameState.handStrength++) {
            for(gameState.communityHandStrength = 0; gameState.communityHandStrength < 3; gameState.communityHandStrength++) {
                for(gameState.round = 1; gameState.round < 5; gameState.round++) {
                    if (gameState.round > 1 || gameState.communityHandStrength == 2) {
                        for (gameState.actions of ACTIONS) {
                            let actionProbabilities = {}
                            for (let action of gameState.actions) {
                                actionProbabilities[action] = 1./gameState.actions.length;
                            }
                            this.setProbabilities(gameState, actionProbabilities);                         
                        }
                    }
                }
            }
        }
    }

    setProbabilities(gameState, actionProbabilities) {
        this.sigma[getGameStateString(gameState)] = actionProbabilities;
    }

    chooseAction(gameState) {
        return chooseRandom(this.sigma[getGameStateString(gameState)])
    }

    play(pokerPlayerRole) {
        if (pokerPlayerRole.game.round === 5 && !pokerPlayerRole.cardsRevealed && !pokerPlayerRole.cardsMucked) {
            return pokerPlayerRole.revealCards();
        }
        let gameState = getGameState(pokerPlayerRole);
        let action = null;
        if (Object.keys(gameState.actions).length == 1) {
            action = gameState.actions[0];
        }
        else {
            action = this.chooseAction(gameState);
        }
        performAction(pokerPlayerRole, action);
    }

}
