let ACTIONS = [];
ACTIONS.push(['call', 'raise', 'fold', 'fold-and-keep']);
ACTIONS.push(['call', 'fold', 'fold-and-keep']);
ACTIONS.push(['fold', 'fold-and-keep']);
ACTIONS.push(['bet', 'check']);

export class CRM {

    constructor () {
        this.sigma = []


        for(let handStrength = 0; handStrength < 3; handStrength++) {
            for(let communityHandStrength = 0; communityHandStrength < 3; communityHandStrength++) {
                for(let round = 1; round < 5; round++) {
                    if (round > 1 || communityHandStrength == 2) {
                        for (let actions of ACTIONS) {
                            let str = handStrength.toString() + ',' + communityHandStrength.toString() + ',' + round.toString() + ',' + actions.toString();
                            this.sigma[str] = []
                            for (let action of actions) {
                                this.sigma[str][action] = 1./actions.length;
                            } 
                        }
                    }
                }
            }

        }
        console.log(this.sigma);
        console.log(Object.keys(this.sigma).length);    
    }



}