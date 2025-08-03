// Quick heuristic-based strategy for immediate feedback
// This provides fast optimal play suggestions without EV calculation
import { Card, Rank, Suit, HandType } from './types';
import { evaluateHand } from './handEvaluator';

export interface QuickStrategyResult {
  optimalHolds: boolean[];
  confidence: 'high' | 'medium' | 'low';
  reason: string;
}

// Fast pattern-based optimal strategy (< 5ms)
export function getQuickOptimalPlay(hand: Card[]): QuickStrategyResult {
  if (hand.length !== 5) {
    return {
      optimalHolds: [false, false, false, false, false],
      confidence: 'low',
      reason: 'Invalid hand'
    };
  }

  // Check for made hands first
  const currentHand = evaluateHand(hand);
  if (currentHand.type !== HandType.HIGH_CARD) {
    // Keep made hands (unless they can be improved)
    if (currentHand.type === HandType.JACKS_OR_BETTER ||
        currentHand.type === HandType.TWO_PAIR ||
        currentHand.type === HandType.THREE_OF_A_KIND ||
        currentHand.type === HandType.STRAIGHT ||
        currentHand.type === HandType.FLUSH ||
        currentHand.type === HandType.FULL_HOUSE ||
        currentHand.type === HandType.FOUR_OF_A_KIND ||
        currentHand.type === HandType.STRAIGHT_FLUSH ||
        currentHand.type === HandType.ROYAL_FLUSH) {
      return {
        optimalHolds: [true, true, true, true, true],
        confidence: 'high',
        reason: `Keep made hand: ${currentHand.description}`
      };
    }
  }

  // Analyze hand for draws and patterns
  
  // Check for pairs
  const pairAnalysis = findPairs(hand);
  if (pairAnalysis.pairs.length > 0) {
    // Prioritize Jacks or better pairs
    const jacksPair = pairAnalysis.pairs.find(pair => 
      [Rank.JACK, Rank.QUEEN, Rank.KING, Rank.ACE].includes(pair.rank)
    );
    
    if (jacksPair) {
      const holds = [false, false, false, false, false];
      jacksPair.indices.forEach(index => holds[index] = true);
      return {
        optimalHolds: holds,
        confidence: 'high',
        reason: 'Keep pair of Jacks or better'
      };
    }
    
    // Low pairs (2s through 10s)
    const lowPair = pairAnalysis.pairs[0];
    const holds = [false, false, false, false, false];
    lowPair.indices.forEach(index => holds[index] = true);
    return {
      optimalHolds: holds,
      confidence: 'medium',
      reason: 'Keep low pair'
    };
  }

  // Check for flush draws (4 cards same suit)
  const flushDraw = findFlushDraw(hand);
  if (flushDraw) {
    return {
      optimalHolds: flushDraw.holds,
      confidence: 'high',
      reason: 'Keep 4-card flush draw'
    };
  }

  // Check for straight draws
  const straightDraw = findStraightDraw(hand);
  if (straightDraw) {
    return {
      optimalHolds: straightDraw.holds,
      confidence: 'high',
      reason: straightDraw.reason
    };
  }

  // Check for high cards (Jacks or better)
  const highCards = findHighCards(hand);
  if (highCards.length > 0) {
    const holds = [false, false, false, false, false];
    highCards.forEach(index => holds[index] = true);
    return {
      optimalHolds: holds,
      confidence: 'medium',
      reason: highCards.length === 1 ? 'Keep high card' : 'Keep high cards'
    };
  }

  // If nothing else, discard all
  return {
    optimalHolds: [false, false, false, false, false],
    confidence: 'low',
    reason: 'Discard all (no promising draws)'
  };
}

interface PairInfo {
  rank: Rank;
  indices: number[];
}

interface PairAnalysis {
  pairs: PairInfo[];
  trips: PairInfo[];
  quads: PairInfo[];
}

function findPairs(hand: Card[]): PairAnalysis {
  const rankCounts = new Map<Rank, number[]>();
  
  hand.forEach((card, index) => {
    if (!rankCounts.has(card.rank)) {
      rankCounts.set(card.rank, []);
    }
    rankCounts.get(card.rank)!.push(index);
  });

  const pairs: PairInfo[] = [];
  const trips: PairInfo[] = [];
  const quads: PairInfo[] = [];

  for (const [rank, indices] of rankCounts.entries()) {
    if (indices.length === 2) {
      pairs.push({ rank, indices });
    } else if (indices.length === 3) {
      trips.push({ rank, indices });
    } else if (indices.length === 4) {
      quads.push({ rank, indices });
    }
  }

  return { pairs, trips, quads };
}

function findFlushDraw(hand: Card[]): { holds: boolean[] } | null {
  const suitCounts = new Map<Suit, number[]>();
  
  hand.forEach((card, index) => {
    if (!suitCounts.has(card.suit)) {
      suitCounts.set(card.suit, []);
    }
    suitCounts.get(card.suit)!.push(index);
  });

  for (const [, indices] of suitCounts.entries()) {
    if (indices.length === 4) {
      const holds = [false, false, false, false, false];
      indices.forEach(index => holds[index] = true);
      return { holds };
    }
  }

  return null;
}

function findStraightDraw(hand: Card[]): { holds: boolean[], reason: string } | null {
  const rankValues = new Map([
    [Rank.TWO, 2], [Rank.THREE, 3], [Rank.FOUR, 4], [Rank.FIVE, 5],
    [Rank.SIX, 6], [Rank.SEVEN, 7], [Rank.EIGHT, 8], [Rank.NINE, 9],
    [Rank.TEN, 10], [Rank.JACK, 11], [Rank.QUEEN, 12], [Rank.KING, 13], [Rank.ACE, 14]
  ]);

  // Check for open-ended straight draws (4 consecutive cards)
  const values = hand.map(card => rankValues.get(card.rank)!).sort((a, b) => a - b);
  const uniqueValues = [...new Set(values)];

  if (uniqueValues.length >= 4) {
    // Check all possible 4-card combinations for straight draws
    for (let i = 0; i <= hand.length - 4; i++) {
      const fourCardCombo = uniqueValues.slice(i, i + 4);
      if (fourCardCombo.length === 4 && fourCardCombo[3] - fourCardCombo[0] === 3) {
        // Found open-ended straight draw
        const targetRanks = fourCardCombo.map(val => {
          const entry = [...rankValues.entries()].find(([, value]) => value === val);
          return entry?.[0];
        }).filter(Boolean) as Rank[];

        const holds = hand.map(card => targetRanks.includes(card.rank));
        return { holds, reason: 'Keep open-ended straight draw' };
      }
    }
  }

  // Check for inside straight draws (royal draws get priority)
  const hasRoyalCards = hand.some(card => 
    [Rank.TEN, Rank.JACK, Rank.QUEEN, Rank.KING, Rank.ACE].includes(card.rank)
  );

  if (hasRoyalCards) {
    const royalRanks = [Rank.TEN, Rank.JACK, Rank.QUEEN, Rank.KING, Rank.ACE];
    const royalCards = hand.filter(card => royalRanks.includes(card.rank));
    
    if (royalCards.length >= 3) {
      const holds = hand.map(card => royalRanks.includes(card.rank));
      return { holds, reason: 'Keep royal draw' };
    }
  }

  return null;
}

function findHighCards(hand: Card[]): number[] {
  const highCardRanks = [Rank.JACK, Rank.QUEEN, Rank.KING, Rank.ACE];
  const highCardIndices: number[] = [];

  hand.forEach((card, index) => {
    if (highCardRanks.includes(card.rank)) {
      highCardIndices.push(index);
    }
  });

  return highCardIndices;
}