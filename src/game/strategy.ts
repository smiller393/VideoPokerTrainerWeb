import { Card, Rank, StrategyAnalysis, HandType, HandResult } from './types';
import { evaluateHand } from './handEvaluator';

const HIGH_CARDS = [Rank.JACK, Rank.QUEEN, Rank.KING, Rank.ACE];
const ROYAL_CARDS = [Rank.TEN, Rank.JACK, Rank.QUEEN, Rank.KING, Rank.ACE];

interface StrategyPattern {
  name: string;
  priority: number;
  holds: boolean[];
  explanation: string;
}

export function analyzeOptimalStrategy(hand: Card[]): StrategyAnalysis {
  const currentResult = evaluateHand(hand);
  
  // Check all possible strategy patterns in priority order
  const patterns = [
    checkPayingHand(hand, currentResult),
    checkFourToRoyalFlush(hand),
    checkThreeOfAKind(hand),
    checkJacksOrBetter(hand, currentResult),
    checkStraight(hand, currentResult),
    checkFlush(hand, currentResult),
    checkFullHouse(hand, currentResult),
    checkFourToStraightFlush(hand),
    checkTwoPair(hand, currentResult),
    checkHighPair(hand),
    checkThreeToRoyalFlush(hand),
    checkFourToFlush(hand),
    checkLowPair(hand),
    checkFourToOutsideStraight(hand),
    checkTwoSuitedHighCards(hand),
    checkThreeToStraightFlush(hand),
    checkTwoUnsuitedHighCards(hand),
    checkSuitedTenWithHighCard(hand),
    checkOneHighCard(hand),
    checkDiscardAll(hand)
  ].filter(pattern => pattern !== null) as StrategyPattern[];

  // Return the highest priority pattern
  const bestPattern = patterns.reduce((best, current) => 
    current.priority > best.priority ? current : best
  );

  return {
    optimalHolds: bestPattern.holds,
    expectedValue: getExpectedValue(bestPattern.name),
    handType: currentResult.type,
    explanation: bestPattern.explanation
  };
}

function checkPayingHand(_hand: Card[], result: HandResult): StrategyPattern | null {
  // Only keep made hands that should be kept in their entirety
  if (result.type === HandType.STRAIGHT ||
      result.type === HandType.FLUSH ||
      result.type === HandType.FULL_HOUSE ||
      result.type === HandType.FOUR_OF_A_KIND ||
      result.type === HandType.STRAIGHT_FLUSH ||
      result.type === HandType.ROYAL_FLUSH) {
    return {
      name: 'paying_hand',
      priority: 1000,
      holds: [true, true, true, true, true],
      explanation: `Keep the entire ${result.description}`
    };
  }
  return null;
}

function checkFourToRoyalFlush(hand: Card[]): StrategyPattern | null {
  const suitGroups = groupBySuit(hand);
  
  for (const [suit, cards] of Object.entries(suitGroups)) {
    if (cards.length >= 4) {
      const ranks = cards.map(c => c.rank).sort((a, b) => getRankValue(a) - getRankValue(b));
      const royalRanks = [Rank.TEN, Rank.JACK, Rank.QUEEN, Rank.KING, Rank.ACE];
      
      // Check if we have 4 cards to a royal flush
      const royalCount = ranks.filter(rank => royalRanks.includes(rank)).length;
      if (royalCount === 4 && cards.length === 4) {
        const holds = hand.map(card => card.suit === suit && royalRanks.includes(card.rank));
        if (holds.filter(Boolean).length === 4) {
          return {
            name: 'four_to_royal',
            priority: 900,
            holds,
            explanation: 'Keep four cards to a royal flush'
          };
        }
      }
    }
  }
  return null;
}

function checkThreeOfAKind(hand: Card[]): StrategyPattern | null {
  const rankCounts = getRankCounts(hand);
  
  for (const [rank, count] of Object.entries(rankCounts)) {
    if (count === 3) {
      const holds = hand.map(card => card.rank === rank);
      return {
        name: 'three_of_a_kind',
        priority: 850,
        holds,
        explanation: `Keep three ${rank}s`
      };
    }
  }
  return null;
}

function checkJacksOrBetter(_hand: Card[], result: HandResult): StrategyPattern | null {
  if (result.type === HandType.JACKS_OR_BETTER) {
    // Find the pair and only keep those cards
    const rankCounts = getRankCounts(_hand);
    for (const [rank, count] of Object.entries(rankCounts)) {
      if (count === 2 && HIGH_CARDS.includes(rank as Rank)) {
        const holds = _hand.map(card => card.rank === rank);
        return {
          name: 'jacks_or_better',
          priority: 500,
          holds,
          explanation: `Keep pair of ${rank}s`
        };
      }
    }
  }
  return null;
}

function checkStraight(_hand: Card[], result: HandResult): StrategyPattern | null {
  if (result.type === HandType.STRAIGHT) {
    return {
      name: 'straight',
      priority: 800,
      holds: [true, true, true, true, true],
      explanation: 'Keep the straight'
    };
  }
  return null;
}

function checkFlush(_hand: Card[], result: HandResult): StrategyPattern | null {
  if (result.type === HandType.FLUSH) {
    return {
      name: 'flush',
      priority: 800,
      holds: [true, true, true, true, true],
      explanation: 'Keep the flush'
    };
  }
  return null;
}

function checkFullHouse(_hand: Card[], result: HandResult): StrategyPattern | null {
  if (result.type === HandType.FULL_HOUSE) {
    return {
      name: 'full_house',
      priority: 800,
      holds: [true, true, true, true, true],
      explanation: 'Keep the full house'
    };
  }
  return null;
}

function checkFourToStraightFlush(hand: Card[]): StrategyPattern | null {
  const suitGroups = groupBySuit(hand);
  
  for (const [suit, cards] of Object.entries(suitGroups)) {
    if (cards.length >= 4) {
      const ranks = cards.map(c => getRankValue(c.rank)).sort((a, b) => a - b);
      
      // Check for consecutive ranks
      for (let i = 0; i <= ranks.length - 4; i++) {
        let consecutive = 1;
        for (let j = i + 1; j < ranks.length; j++) {
          if (ranks[j] === ranks[j-1] + 1) {
            consecutive++;
            if (consecutive === 4) {
              const targetRanks = ranks.slice(j-3, j+1);
              const holds = hand.map(card => 
                card.suit === suit && targetRanks.includes(getRankValue(card.rank))
              );
              return {
                name: 'four_to_straight_flush',
                priority: 700,
                holds,
                explanation: 'Keep four cards to a straight flush'
              };
            }
          } else {
            consecutive = 1;
          }
        }
      }
    }
  }
  return null;
}

function checkTwoPair(hand: Card[], result: HandResult): StrategyPattern | null {
  if (result.type === HandType.TWO_PAIR) {
    const rankCounts = getRankCounts(hand);
    const pairs = Object.entries(rankCounts).filter(([_, count]) => count === 2);
    
    if (pairs.length === 2) {
      const pairRanks = pairs.map(([rank, _]) => rank);
      const holds = hand.map(card => pairRanks.includes(card.rank));
      return {
        name: 'two_pair',
        priority: 600,
        holds,
        explanation: 'Keep both pairs'
      };
    }
  }
  return null;
}

function checkHighPair(hand: Card[]): StrategyPattern | null {
  const rankCounts = getRankCounts(hand);
  
  for (const [rank, count] of Object.entries(rankCounts)) {
    if (count === 2 && HIGH_CARDS.includes(rank as Rank)) {
      const holds = hand.map(card => card.rank === rank);
      return {
        name: 'high_pair',
        priority: 500,
        holds,
        explanation: `Keep pair of ${rank}s`
      };
    }
  }
  return null;
}

function checkThreeToRoyalFlush(hand: Card[]): StrategyPattern | null {
  const suitGroups = groupBySuit(hand);
  
  for (const [, cards] of Object.entries(suitGroups)) {
    if (cards.length >= 3) {
      const ranks = cards.map(c => c.rank);
      const royalCount = ranks.filter(rank => ROYAL_CARDS.includes(rank)).length;
      
      if (royalCount >= 3) {
        const royalCards = cards.filter(card => ROYAL_CARDS.includes(card.rank));
        if (royalCards.length >= 3) {
          // Keep the highest 3 royal cards
          const sortedRoyals = royalCards.sort((a, b) => getRankValue(b.rank) - getRankValue(a.rank));
          const keepCards = sortedRoyals.slice(0, 3);
          const holds = hand.map(card => keepCards.some(keep => keep.id === card.id));
          
          return {
            name: 'three_to_royal',
            priority: 550,
            holds,
            explanation: 'Keep three cards to a royal flush'
          };
        }
      }
    }
  }
  return null;
}

function checkFourToFlush(hand: Card[]): StrategyPattern | null {
  const suitGroups = groupBySuit(hand);
  
  for (const [suit, cards] of Object.entries(suitGroups)) {
    if (cards.length === 4) {
      const holds = hand.map(card => card.suit === suit);
      return {
        name: 'four_to_flush',
        priority: 300,
        holds,
        explanation: 'Keep four cards to a flush'
      };
    }
  }
  return null;
}

function checkLowPair(hand: Card[]): StrategyPattern | null {
  const rankCounts = getRankCounts(hand);
  
  for (const [rank, count] of Object.entries(rankCounts)) {
    if (count === 2 && !HIGH_CARDS.includes(rank as Rank)) {
      const holds = hand.map(card => card.rank === rank);
      return {
        name: 'low_pair',
        priority: 250,
        holds,
        explanation: `Keep pair of ${rank}s`
      };
    }
  }
  return null;
}

function checkFourToOutsideStraight(hand: Card[]): StrategyPattern | null {
  const ranks = hand.map(card => getRankValue(card.rank)).sort((a, b) => a - b);
  const uniqueRanks = [...new Set(ranks)];
  
  if (uniqueRanks.length >= 4) {
    // Check for outside straight draws (both ends open)
    for (let i = 0; i <= uniqueRanks.length - 4; i++) {
      const sequence = uniqueRanks.slice(i, i + 4);
      if (sequence.every((rank, idx) => idx === 0 || rank === sequence[idx - 1] + 1)) {
        // Make sure it's an outside straight (not inside)
        const lowEnd = sequence[0] - 1;
        const highEnd = sequence[3] + 1;
        if (lowEnd >= 2 && highEnd <= 14) { // Valid outside straight
          const targetRanks = sequence;
          const holds = hand.map(card => targetRanks.includes(getRankValue(card.rank)));
          if (holds.filter(Boolean).length === 4) {
            return {
              name: 'four_to_outside_straight',
              priority: 200,
              holds,
              explanation: 'Keep four cards to an outside straight'
            };
          }
        }
      }
    }
  }
  return null;
}

function checkTwoSuitedHighCards(hand: Card[]): StrategyPattern | null {
  const suitGroups = groupBySuit(hand);
  
  for (const [, cards] of Object.entries(suitGroups)) {
    const highCards = cards.filter(card => HIGH_CARDS.includes(card.rank));
    if (highCards.length >= 2) {
      // Keep the highest 2 suited high cards
      const sortedHighs = highCards.sort((a, b) => getRankValue(b.rank) - getRankValue(a.rank));
      const keepCards = sortedHighs.slice(0, 2);
      const holds = hand.map(card => keepCards.some(keep => keep.id === card.id));
      
      return {
        name: 'two_suited_high',
        priority: 150,
        holds,
        explanation: 'Keep two suited high cards'
      };
    }
  }
  return null;
}

function checkThreeToStraightFlush(hand: Card[]): StrategyPattern | null {
  const suitGroups = groupBySuit(hand);
  
  for (const [suit, cards] of Object.entries(suitGroups)) {
    if (cards.length >= 3) {
      const ranks = cards.map(c => getRankValue(c.rank)).sort((a, b) => a - b);
      
      // Check for 3 consecutive cards
      for (let i = 0; i <= ranks.length - 3; i++) {
        if (ranks[i + 1] === ranks[i] + 1 && ranks[i + 2] === ranks[i] + 2) {
          const targetRanks = [ranks[i], ranks[i + 1], ranks[i + 2]];
          const holds = hand.map(card => 
            card.suit === suit && targetRanks.includes(getRankValue(card.rank))
          );
          return {
            name: 'three_to_straight_flush',
            priority: 250,
            holds,
            explanation: 'Keep three cards to a straight flush'
          };
        }
      }
    }
  }
  return null;
}

function checkTwoUnsuitedHighCards(hand: Card[]): StrategyPattern | null {
  const highCards = hand.filter(card => HIGH_CARDS.includes(card.rank));
  
  if (highCards.length >= 2) {
    // Prefer Ace-King, Ace-Queen, Ace-Jack, King-Queen, King-Jack, Queen-Jack
    const aceKing = highCards.filter(card => [Rank.ACE, Rank.KING].includes(card.rank));
    if (aceKing.length === 2) {
      const holds = hand.map(card => aceKing.some(high => high.id === card.id));
      return {
        name: 'two_unsuited_high',
        priority: 80,
        holds,
        explanation: 'Keep Ace and King'
      };
    }
    
    // Keep highest 2 unsuited high cards
    const sortedHighs = highCards.sort((a, b) => getRankValue(b.rank) - getRankValue(a.rank));
    const keepCards = sortedHighs.slice(0, 2);
    const holds = hand.map(card => keepCards.some(keep => keep.id === card.id));
    
    return {
      name: 'two_unsuited_high',
      priority: 70,
      holds,
      explanation: 'Keep two high cards'
    };
  }
  return null;
}

function checkSuitedTenWithHighCard(hand: Card[]): StrategyPattern | null {
  const suitGroups = groupBySuit(hand);
  
  for (const [, cards] of Object.entries(suitGroups)) {
    const tens = cards.filter(card => card.rank === Rank.TEN);
    const highs = cards.filter(card => [Rank.JACK, Rank.QUEEN, Rank.KING].includes(card.rank));
    
    if (tens.length === 1 && highs.length >= 1) {
      const keepCards = [tens[0], highs[0]];
      const holds = hand.map(card => keepCards.some(keep => keep.id === card.id));
      return {
        name: 'suited_ten_high',
        priority: 60,
        holds,
        explanation: `Keep suited 10 and ${highs[0].rank}`
      };
    }
  }
  return null;
}

function checkOneHighCard(hand: Card[]): StrategyPattern | null {
  const highCards = hand.filter(card => HIGH_CARDS.includes(card.rank));
  
  if (highCards.length >= 1) {
    // Prefer Ace > King > Queen > Jack
    const ace = highCards.find(card => card.rank === Rank.ACE);
    const king = highCards.find(card => card.rank === Rank.KING);
    const queen = highCards.find(card => card.rank === Rank.QUEEN);
    const jack = highCards.find(card => card.rank === Rank.JACK);
    
    const keepCard = ace || king || queen || jack;
    if (keepCard) {
      const holds = hand.map(card => card.id === keepCard.id);
      return {
        name: 'one_high_card',
        priority: 50,
        holds,
        explanation: `Keep ${keepCard.rank}`
      };
    }
  }
  return null;
}

function checkDiscardAll(_hand: Card[]): StrategyPattern {
  return {
    name: 'discard_all',
    priority: 0,
    holds: [false, false, false, false, false],
    explanation: 'Discard all cards'
  };
}

// Helper functions
function groupBySuit(hand: Card[]): Record<string, Card[]> {
  return hand.reduce((groups, card) => {
    const suit = card.suit;
    if (!groups[suit]) groups[suit] = [];
    groups[suit].push(card);
    return groups;
  }, {} as Record<string, Card[]>);
}

function getRankCounts(hand: Card[]): Record<string, number> {
  return hand.reduce((counts, card) => {
    counts[card.rank] = (counts[card.rank] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);
}

function getRankValue(rank: Rank): number {
  const values: Record<Rank, number> = {
    [Rank.TWO]: 2, [Rank.THREE]: 3, [Rank.FOUR]: 4, [Rank.FIVE]: 5,
    [Rank.SIX]: 6, [Rank.SEVEN]: 7, [Rank.EIGHT]: 8, [Rank.NINE]: 9,
    [Rank.TEN]: 10, [Rank.JACK]: 11, [Rank.QUEEN]: 12, [Rank.KING]: 13, [Rank.ACE]: 14
  };
  return values[rank];
}

function getExpectedValue(strategyName: string): number {
  // Approximate expected values for different strategy patterns
  const expectedValues: Record<string, number> = {
    'paying_hand': 5.0,
    'four_to_royal': 19.15,
    'three_of_a_kind': 3.0,
    'straight': 4.0,
    'flush': 6.0,
    'full_house': 9.0,
    'four_to_straight_flush': 8.5,
    'two_pair': 2.0,
    'high_pair': 1.0,
    'three_to_royal': 1.11,
    'four_to_flush': 1.06,
    'low_pair': 0.82,
    'four_to_outside_straight': 0.85,
    'two_suited_high': 0.59,
    'three_to_straight_flush': 0.55,
    'two_unsuited_high': 0.45,
    'suited_ten_high': 0.43,
    'one_high_card': 0.32,
    'discard_all': 0.21
  };
  
  return expectedValues[strategyName] || 0;
}