import { Card, HandType, HandResult, Rank } from './types';

const RANK_VALUES: Record<Rank, number> = {
  [Rank.TWO]: 2,
  [Rank.THREE]: 3,
  [Rank.FOUR]: 4,
  [Rank.FIVE]: 5,
  [Rank.SIX]: 6,
  [Rank.SEVEN]: 7,
  [Rank.EIGHT]: 8,
  [Rank.NINE]: 9,
  [Rank.TEN]: 10,
  [Rank.JACK]: 11,
  [Rank.QUEEN]: 12,
  [Rank.KING]: 13,
  [Rank.ACE]: 14
};

const FACE_CARDS = [Rank.JACK, Rank.QUEEN, Rank.KING, Rank.ACE];

export function evaluateHand(cards: Card[]): HandResult {
  if (cards.length !== 5) {
    throw new Error('Hand must contain exactly 5 cards');
  }

  const sortedCards = [...cards].sort((a, b) => RANK_VALUES[a.rank] - RANK_VALUES[b.rank]);
  
  const isFlush = checkFlush(sortedCards);
  const isStraight = checkStraight(sortedCards);
  const isRoyalFlush = isFlush && isStraight && sortedCards[0].rank === Rank.TEN;
  
  if (isRoyalFlush) {
    return {
      type: HandType.ROYAL_FLUSH,
      cards: sortedCards,
      rank: 10,
      description: 'Royal Flush'
    };
  }
  
  if (isFlush && isStraight) {
    return {
      type: HandType.STRAIGHT_FLUSH,
      cards: sortedCards,
      rank: 9,
      description: 'Straight Flush'
    };
  }
  
  const rankCounts = getRankCounts(sortedCards);
  const counts = Object.values(rankCounts).sort((a, b) => b - a);
  
  if (counts[0] === 4) {
    return {
      type: HandType.FOUR_OF_A_KIND,
      cards: sortedCards,
      rank: 8,
      description: 'Four of a Kind'
    };
  }
  
  if (counts[0] === 3 && counts[1] === 2) {
    return {
      type: HandType.FULL_HOUSE,
      cards: sortedCards,
      rank: 7,
      description: 'Full House'
    };
  }
  
  if (isFlush) {
    return {
      type: HandType.FLUSH,
      cards: sortedCards,
      rank: 6,
      description: 'Flush'
    };
  }
  
  if (isStraight) {
    return {
      type: HandType.STRAIGHT,
      cards: sortedCards,
      rank: 5,
      description: 'Straight'
    };
  }
  
  if (counts[0] === 3) {
    return {
      type: HandType.THREE_OF_A_KIND,
      cards: sortedCards,
      rank: 4,
      description: 'Three of a Kind'
    };
  }
  
  if (counts[0] === 2 && counts[1] === 2) {
    return {
      type: HandType.TWO_PAIR,
      cards: sortedCards,
      rank: 3,
      description: 'Two Pair'
    };
  }
  
  if (counts[0] === 2) {
    const pairRank = Object.keys(rankCounts).find(rank => rankCounts[rank as Rank] === 2) as Rank;
    if (FACE_CARDS.includes(pairRank)) {
      return {
        type: HandType.JACKS_OR_BETTER,
        cards: sortedCards,
        rank: 1,
        description: `Pair of ${pairRank}s`
      };
    }
    return {
      type: HandType.PAIR,
      cards: sortedCards,
      rank: 0,
      description: `Pair of ${pairRank}s`
    };
  }
  
  return {
    type: HandType.HIGH_CARD,
    cards: sortedCards,
    rank: 0,
    description: 'High Card'
  };
}

function checkFlush(cards: Card[]): boolean {
  return cards.every(card => card.suit === cards[0].suit);
}

function checkStraight(cards: Card[]): boolean {
  const values = cards.map(card => RANK_VALUES[card.rank]);
  
  if (values[0] === 2 && values[1] === 3 && values[2] === 4 && values[3] === 5 && values[4] === 14) {
    return true;
  }
  
  for (let i = 1; i < values.length; i++) {
    if (values[i] !== values[i - 1] + 1) {
      return false;
    }
  }
  return true;
}

function getRankCounts(cards: Card[]): Record<Rank, number> {
  const counts: Record<Rank, number> = {} as Record<Rank, number>;
  for (const card of cards) {
    counts[card.rank] = (counts[card.rank] || 0) + 1;
  }
  return counts;
}