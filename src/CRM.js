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

function getGameStateString(gameState) {
    let str = '';
    for (let prop in gameState) {
        str += gameState[prop].toString() + ',';
    }
    return str;
}

export class Strategy {
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
        console.log(this.sigma);
        console.log(Object.keys(this.sigma).length);    
    }

    setProbabilities(gameState, actionProbabilities) {
        this.sigma[getGameStateString(gameState)] = actionProbabilities;
    }

    chooseAction(gameState) {
        return chooseRandom(this.sigma[getGameStateString(gameState)])
    }

}

export class CRM {

    constructor () {
        this.sigma = []


    }



}