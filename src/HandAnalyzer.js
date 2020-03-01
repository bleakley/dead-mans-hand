import { evaluateAndFindCards } from 'poker-ranking';
import _ from 'lodash';

const rankingStringToRank = (rankingString) => {
    if (rankingString.startsWith('10')) {
        return 10;
    }
    if (rankingString.startsWith('J')) {
        return 11;
    }
    if (rankingString.startsWith('Q')) {
        return 12;
    }
    if (rankingString.startsWith('K')) {
        return 13;
    }
    if (rankingString.startsWith('A')) {
        return 14;
    }
    return parseInt(rankingString[0]);
};

const rankingStringSort = (a, b) => rankingStringToRank(b) - rankingStringToRank(a);

const matchNameToHandRank = (matchName) => {
    let map = {
        '5ofakind': 10,
        'royalflush': 9,
        'straightflush': 8,
        '4ofakind': 7,
        'fullhouse': 6,
        'flush': 5,
        'straight': 4,
        '3ofakind': 3,
        '2pair': 2,
        'pair': 1,
        'nothing': 0
    };
    return map[matchName];
}

export function analyzeHand(hole, common) {
    let all = hole.concat(common).map(card => card.toRankingString());
    let hand = evaluateAndFindCards(all);
    let others = _.difference(all, hand.cards).sort(rankingStringSort).slice(0, 5 - hand.cards.length);
    return {
        match: hand.match,
        cardsInCombo: hand.cards.map(rankingStringToRank),
        bestCardsOutOfCombo: others.map(rankingStringToRank),
        comboRank: matchNameToHandRank(hand.match)
    }
}

export function compareSetOfSortedCards(a, b) {
    let comboA = [...a];
    let comboB = [...b];
    while (comboA[0] === comboB[0] && comboA.length && comboB.length) {
        comboA.shift();
        comboB.shift();
    }
    if (comboA.length && comboB.length) {
        return Math.sign(comboB[0] - comboA[0]);
    }
    return 0;
}

export function compareHands(a, b) {
    if (a.comboRank !== b.comboRank) {
        return Math.sign(b.comboRank - a.comboRank);
    }

    let comboComparison = compareSetOfSortedCards(a.cardsInCombo, b.cardsInCombo);
    if (comboComparison) {
        return comboComparison;
    }

    return compareSetOfSortedCards(a.bestCardsOutOfCombo, b.bestCardsOutOfCombo);
}