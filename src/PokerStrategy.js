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
        if (Array.isArray(gameState[prop])) {
            gameState[prop].sort()
        }
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


export class BasicPokerStrategy extends PokerStrategy {
    constructor (aggressiveness, cheatiness) {
        super();
        this.aggressiveness = aggressiveness;
        this.cheatiness = cheatiness;

        let gameState = {}

        // Pre-flop
        gameState.handStrength = 0;
        gameState.round = 1;
        for (gameState.communityHandStrength of [0, 1, 2]) {
            gameState.actions = ['call', 'raise', 'fold', 'fold-and-keep'];
            let probabilities = [];
            probabilities['call'] = 0.2*(1 - this.aggressiveness);
            probabilities['raise'] = 0.2*this.aggressiveness;
            probabilities['fold'] = 0.8*(1 - this.cheatiness);
            probabilities['fold-and-keep'] = 0.8*this.cheatiness;
            this.setProbabilities(gameState, probabilities);

            gameState.actions = ['bet', 'check'];
            probabilities = [];
            probabilities['bet'] = 0.1*this.aggressiveness;
            probabilities['check'] = 0.9 + 0.1*(1 - this.aggressiveness);
            this.setProbabilities(gameState, probabilities);
        }

        gameState.handStrength = 1;
        gameState.round = 1;
        for (gameState.communityHandStrength of [0, 1, 2]) {
            gameState.actions = ['call', 'raise', 'fold', 'fold-and-keep'];
            let probabilities = [];
            probabilities['call'] = 0.8*(1 - this.aggressiveness);
            probabilities['raise'] = 0.8*this.aggressiveness;
            probabilities['fold'] = 0.2*(1 - this.cheatiness);
            probabilities['fold-and-keep'] = 0.2*this.cheatiness;
            this.setProbabilities(gameState, probabilities);

            gameState.actions = ['bet', 'check'];
            probabilities = [];
            probabilities['bet'] = 1.0*this.aggressiveness;
            probabilities['check'] = 1.0*(1 - this.aggressiveness);
            this.setProbabilities(gameState, probabilities);
        }

        gameState.handStrength = 2;
        gameState.round = 1;
        for (gameState.communityHandStrength of [0, 1, 2]) {
            gameState.actions = ['call', 'raise', 'fold', 'fold-and-keep'];
            let probabilities = [];
            probabilities['call'] = 0.8 + 0.1*(1 - this.aggressiveness);
            probabilities['raise'] = 0.1*this.aggressiveness;
            probabilities['fold'] = 0.1*(1 - this.cheatiness);
            probabilities['fold-and-keep'] = 0.1*this.cheatiness;
            this.setProbabilities(gameState, probabilities);

            gameState.actions = ['bet', 'check'];
            probabilities = [];
            probabilities['bet'] = 0.2*this.aggressiveness;
            probabilities['check'] = 0.8 + 0.2*(1 - this.aggressiveness);
            this.setProbabilities(gameState, probabilities);
        }

        // Turn, river, flop
        for (gameState.round = 2; gameState.round < 5; gameState.round++) {
            gameState.handStrength = 0;
            for (gameState.communityHandStrength of [0, 1, 2]) {
                gameState.actions = ['call', 'raise', 'fold', 'fold-and-keep'];
                let probabilities = [];
                probabilities['call'] = 0.1*(1 - this.aggressiveness);
                probabilities['raise'] = 0.1*this.aggressiveness;
                probabilities['fold'] = 0.9*(1 - this.cheatiness);
                probabilities['fold-and-keep'] = 0.9*this.cheatiness;
                this.setProbabilities(gameState, probabilities);

                gameState.actions = ['bet', 'check'];
                probabilities = [];
                probabilities['bet'] = 0.1*this.aggressiveness;
                probabilities['check'] = 0.9 + 0.1*(1 - this.aggressiveness);
                this.setProbabilities(gameState, probabilities);
            }

            gameState.handStrength = 1;
            for (gameState.communityHandStrength of [0, 1, 2]) {
                gameState.actions = ['call', 'raise', 'fold', 'fold-and-keep'];
                let probabilities = [];
                probabilities['call'] = 0.5*(1 - this.aggressiveness);
                probabilities['raise'] = 0.5*this.aggressiveness;
                probabilities['fold'] = 0.5*(1 - this.cheatiness);
                probabilities['fold-and-keep'] = 0.5*this.cheatiness;
                this.setProbabilities(gameState, probabilities);

                gameState.actions = ['bet', 'check'];
                probabilities = [];
                probabilities['bet'] = 0.5 + 0.5*this.aggressiveness;
                probabilities['check'] = 0.5*(1 - this.aggressiveness);
                this.setProbabilities(gameState, probabilities);
            }

            gameState.handStrength = 2;
            for (gameState.communityHandStrength of [0, 1, 2]) {
                gameState.actions = ['call', 'raise', 'fold', 'fold-and-keep'];
                let probabilities = [];
                probabilities['call'] = 0.8*(1 - this.aggressiveness);
                probabilities['raise'] = 0.8*this.aggressiveness;
                probabilities['fold'] = 0.1*(1 - this.cheatiness);
                probabilities['fold-and-keep'] = 0.1*this.cheatiness;
                this.setProbabilities(gameState, probabilities);

                gameState.actions = ['bet', 'check'];
                probabilities = [];
                probabilities['bet'] = 0.8*this.aggressiveness;
                probabilities['check'] = 0.2 + 0.8*(1 - this.aggressiveness);
                this.setProbabilities(gameState, probabilities);
            }
        }
    }
    
}