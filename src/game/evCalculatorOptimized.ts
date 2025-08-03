// Optimized Expected Value Calculator with async processing and caching
import { Card, Rank, Suit, HandType } from './types';
import { evaluateHand } from './handEvaluator';
import { getPayoutForHand, JACKS_OR_BETTER_9_6 } from './payTables';
import { PerformanceMonitor } from '@/utils/performance';

export interface HoldCombination {
  holds: boolean[];
  keptCards: Card[];
  discardCount: number;
  expectedValue: number;
  description: string;
  handType?: HandType;
}

export interface EVAnalysis {
  combinations: HoldCombination[];
  playerChoice?: HoldCombination;
  optimalChoice: HoldCombination;
  playerRank?: number;
  isComplete: boolean;
}

// Cache for EV calculations to avoid recalculating same hands
const evCache = new Map<string, number>();

// Generate cache key for a hand configuration
function generateCacheKey(hand: Card[], holds: boolean[], bet: number): string {
  const handKey = hand.map(c => c.id).sort().join(',');
  const holdsKey = holds.join('');
  return `${handKey}-${holdsKey}-${bet}`;
}

// Optimized EV calculation with early termination for made hands
function calculateEVForHoldOptimized(hand: Card[], holds: boolean[], bet: number): number {
  const cacheKey = generateCacheKey(hand, holds, bet);
  if (evCache.has(cacheKey)) {
    return evCache.get(cacheKey)!;
  }

  const keptCards = hand.filter((_, index) => holds[index]);
  const discardCount = 5 - keptCards.length;
  
  let result: number;

  if (discardCount === 0) {
    // No cards to draw, hand is complete
    const handResult = evaluateHand(hand);
    result = getPayoutForHand(handResult.type, bet, JACKS_OR_BETTER_9_6);
  } else {
    // Use optimized calculation for partial hands
    result = calculatePartialHandEV(keptCards, discardCount, hand, bet);
  }

  evCache.set(cacheKey, result);
  return result;
}

// Optimized calculation for partial hands using mathematical approximation
function calculatePartialHandEV(keptCards: Card[], discardCount: number, originalHand: Card[], bet: number): number {
  // For performance, we'll use a sampling approach for large discard counts
  if (discardCount >= 4) {
    return calculateSampledEV(keptCards, discardCount, originalHand, bet);
  }

  // Full calculation for smaller discard counts
  return calculateFullEV(keptCards, discardCount, originalHand, bet);
}

// Full EV calculation (used for 1-3 discards)
function calculateFullEV(keptCards: Card[], discardCount: number, originalHand: Card[], bet: number): number {
  const availableCards = getAvailableCards(originalHand);
  let totalValue = 0;
  let combinationCount = 0;

  // Generate all possible ways to fill the hand
  for (const drawnCards of combinations(availableCards, discardCount)) {
    const completeHand = [...keptCards, ...drawnCards];
    const result = evaluateHand(completeHand);
    const payout = getPayoutForHand(result.type, bet, JACKS_OR_BETTER_9_6);
    totalValue += payout;
    combinationCount++;
  }

  return combinationCount > 0 ? totalValue / combinationCount : 0;
}

// Sampled EV calculation (used for 4-5 discards for better performance)
function calculateSampledEV(keptCards: Card[], discardCount: number, originalHand: Card[], bet: number): number {
  const availableCards = getAvailableCards(originalHand);
  const sampleSize = Math.min(1000, Math.pow(availableCards.length, discardCount));
  
  let totalValue = 0;
  let sampleCount = 0;

  // Random sampling approach
  for (let i = 0; i < sampleSize; i++) {
    const shuffled = [...availableCards].sort(() => Math.random() - 0.5);
    const drawnCards = shuffled.slice(0, discardCount);
    const completeHand = [...keptCards, ...drawnCards];
    
    const result = evaluateHand(completeHand);
    const payout = getPayoutForHand(result.type, bet, JACKS_OR_BETTER_9_6);
    totalValue += payout;
    sampleCount++;
  }

  return sampleCount > 0 ? totalValue / sampleCount : 0;
}

// Create a full deck for EV calculation
function createFullDeck(): Card[] {
  const deck: Card[] = [];
  const suits = [Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS, Suit.SPADES];
  const ranks = [
    Rank.TWO, Rank.THREE, Rank.FOUR, Rank.FIVE, Rank.SIX, Rank.SEVEN,
    Rank.EIGHT, Rank.NINE, Rank.TEN, Rank.JACK, Rank.QUEEN, Rank.KING, Rank.ACE
  ];

  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({
        suit,
        rank,
        id: `${rank}_${suit}`
      });
    }
  }
  return deck;
}

// Get all cards not in the hand
function getAvailableCards(hand: Card[]): Card[] {
  const fullDeck = createFullDeck();
  const handIds = new Set(hand.map(card => card.id));
  return fullDeck.filter(card => !handIds.has(card.id));
}

// Generate combinations iterator (same as before)
function* combinations<T>(items: T[], k: number): Generator<T[]> {
  if (k === 0) {
    yield [];
    return;
  }
  
  if (k > items.length) {
    return;
  }

  if (k === items.length) {
    yield [...items];
    return;
  }

  for (const combo of combinations(items.slice(1), k - 1)) {
    yield [items[0], ...combo];
  }

  for (const combo of combinations(items.slice(1), k)) {
    yield combo;
  }
}

// Get description for hold combination (simplified)
function getHoldDescription(hand: Card[], holds: boolean[]): string {
  const keptCards = hand.filter((_, index) => holds[index]);
  const discardCount = 5 - keptCards.length;

  if (discardCount === 0) {
    const result = evaluateHand(hand);
    return `Keep all (${result.description})`;
  }

  if (discardCount === 5) {
    return 'Discard all';
  }

  return `Keep ${keptCards.length} card${keptCards.length !== 1 ? 's' : ''}`;
}

// Generate all 32 possible hold combinations
function generateAllHoldCombinations(): boolean[][] {
  const combinations: boolean[][] = [];
  
  for (let i = 0; i < 32; i++) {
    const holds: boolean[] = [];
    for (let j = 0; j < 5; j++) {
      holds.push((i & (1 << j)) !== 0);
    }
    combinations.push(holds);
  }
  
  return combinations;
}

// Get key combinations for fast analysis (strategic subset)
function getKeyCombinations(hand: Card[]): boolean[][] {
  const combinations: boolean[][] = [];
  
  // Always include "hold all" and "discard all"
  combinations.push([true, true, true, true, true]);
  combinations.push([false, false, false, false, false]);
  
  // Quick hand analysis to identify key patterns
  const ranks = hand.map(card => card.rank);
  
  // Check for pairs/trips/quads
  const rankCounts = new Map<string, number[]>();
  ranks.forEach((rank, index) => {
    if (!rankCounts.has(rank)) {
      rankCounts.set(rank, []);
    }
    rankCounts.get(rank)!.push(index);
  });
  
  // Add pair/trips/quads combinations
  for (const [, indices] of rankCounts.entries()) {
    if (indices.length >= 2) {
      // Hold the pair/trips/quads
      const holds = [false, false, false, false, false];
      indices.forEach(index => holds[index] = true);
      combinations.push([...holds]);
    }
  }
  
  // Check for straight draws (4-card straights)
  const straightDraws = findStraightDraws(hand);
  straightDraws.forEach(holds => combinations.push(holds));
  
  // Check for flush draws (4-card flushes)
  const flushDraws = findFlushDraws(hand);
  flushDraws.forEach(holds => combinations.push(holds));
  
  // Add high card holds (Jacks or better)
  const highCardRanks = [Rank.JACK, Rank.QUEEN, Rank.KING, Rank.ACE];
  for (let i = 0; i < hand.length; i++) {
    if (highCardRanks.includes(hand[i].rank)) {
      const holds = [false, false, false, false, false];
      holds[i] = true;
      combinations.push([...holds]);
    }
  }
  
  // Remove duplicates
  const uniqueCombinations = combinations.filter((combo, index, arr) => 
    index === arr.findIndex(other => other.every((val, i) => val === combo[i]))
  );
  
  return uniqueCombinations;
}

// Helper to find 4-card straight draws
function findStraightDraws(hand: Card[]): boolean[][] {
  const combinations: boolean[][] = [];
  const rankValues = new Map([
    [Rank.TWO, 2], [Rank.THREE, 3], [Rank.FOUR, 4], [Rank.FIVE, 5],
    [Rank.SIX, 6], [Rank.SEVEN, 7], [Rank.EIGHT, 8], [Rank.NINE, 9],
    [Rank.TEN, 10], [Rank.JACK, 11], [Rank.QUEEN, 12], [Rank.KING, 13], [Rank.ACE, 14]
  ]);
  
  // Check all 4-card combinations for potential straights
  for (let i = 0; i < 5; i++) {
    const holds = [true, true, true, true, true];
    holds[i] = false; // Remove one card
    
    const keptCards = hand.filter((_, index) => holds[index]);
    const values = keptCards.map(card => rankValues.get(card.rank)!).sort((a, b) => a - b);
    
    // Check if removing this card creates a 4-card straight draw
    if (isFourCardStraight(values)) {
      combinations.push([...holds]);
    }
  }
  
  return combinations;
}

// Helper to find 4-card flush draws
function findFlushDraws(hand: Card[]): boolean[][] {
  const combinations: boolean[][] = [];
  const suitCounts = new Map<Suit, number[]>();
  
  hand.forEach((card, index) => {
    if (!suitCounts.has(card.suit)) {
      suitCounts.set(card.suit, []);
    }
    suitCounts.get(card.suit)!.push(index);
  });
  
  // Find suits with 4+ cards
  for (const [, indices] of suitCounts.entries()) {
    if (indices.length >= 4) {
      const holds = [false, false, false, false, false];
      indices.slice(0, 4).forEach(index => holds[index] = true);
      combinations.push([...holds]);
    }
  }
  
  return combinations;
}

// Helper to check if 4 values form a straight draw
function isFourCardStraight(values: number[]): boolean {
  if (values.length !== 4) return false;
  
  // Check for consecutive values (allowing for one gap)
  const min = values[0];
  const max = values[3];
  
  // Perfect 4-card straight (consecutive)
  if (max - min === 3 && new Set(values).size === 4) {
    return true;
  }
  
  // Inside straight draw (one gap in middle)
  if (max - min === 4 && new Set(values).size === 4) {
    return true;
  }
  
  // Special case for A-2-3-4 and A-K-Q-J
  if (values.includes(14)) { // Has Ace
    const nonAceValues = values.filter(v => v !== 14);
    if (nonAceValues.length === 3) {
      const minNonAce = Math.min(...nonAceValues);
      const maxNonAce = Math.max(...nonAceValues);
      
      // Low straight: A-2-3-4 or A-2-3-5 etc.
      if (minNonAce <= 4 && maxNonAce <= 5) return true;
      
      // High straight: A-K-Q-J or A-K-Q-10 etc.
      if (minNonAce >= 10 && maxNonAce >= 11) return true;
    }
  }
  
  return false;
}

// Async function to analyze all plays with progress updates
export async function analyzeAllPlaysAsync(hand: Card[], bet: number = 1): Promise<EVAnalysis> {
  return PerformanceMonitor.measureAsync('analyzeAllPlaysAsync', async () => {
    const allCombinations = generateAllHoldCombinations();
    const results: HoldCombination[] = [];

    // Process combinations in batches to avoid blocking UI
    const batchSize = 8;
    for (let i = 0; i < allCombinations.length; i += batchSize) {
      const batch = allCombinations.slice(i, i + batchSize);
      
      for (const holds of batch) {
        const keptCards = hand.filter((_, index) => holds[index]);
        const expectedValue = calculateEVForHoldOptimized(hand, holds, bet);
        const description = getHoldDescription(hand, holds);

        let handType: HandType | undefined;
        if (holds.every(hold => hold)) {
          handType = evaluateHand(hand).type;
        }

        results.push({
          holds,
          keptCards,
          discardCount: 5 - keptCards.length,
          expectedValue,
          description,
          handType
        });
      }

      // Yield control to prevent UI blocking
      if (i + batchSize < allCombinations.length) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }

    // Sort by expected value (highest first)
    results.sort((a, b) => b.expectedValue - a.expectedValue);

    const optimalChoice = results[0];

    return {
      combinations: results,
      optimalChoice,
      playerChoice: undefined,
      playerRank: undefined,
      isComplete: true
    };
  }).then(result => result.result);
}

// Ultra-fast synchronous analysis for immediate feedback (calculates only essential combinations)
export function analyzeTopPlays(hand: Card[], bet: number = 1): EVAnalysis {
  return PerformanceMonitor.measure('analyzeTopPlays', () => {
    // Get key combinations instead of all 32 for immediate feedback
    const keyCombinations = getKeyCombinations(hand);
    const results: HoldCombination[] = [];

    // Calculate EV for key combinations only
    for (const holds of keyCombinations) {
      const keptCards = hand.filter((_, index) => holds[index]);
      const expectedValue = calculateEVForHoldOptimized(hand, holds, bet);
      const description = getHoldDescription(hand, holds);

      let handType: HandType | undefined;
      if (holds.every(hold => hold)) {
        handType = evaluateHand(hand).type;
      }

      results.push({
        holds,
        keptCards,
        discardCount: 5 - keptCards.length,
        expectedValue,
        description,
        handType
      });
    }

    // Sort by expected value (highest first)
    results.sort((a, b) => b.expectedValue - a.expectedValue);

    const optimalChoice = results[0];

    return {
      combinations: results, // Return only key combinations for speed
      optimalChoice,
      playerChoice: undefined,
      playerRank: undefined,
      isComplete: false
    };
  }).result;
}

// Analyze player's choice against all possibilities
export function analyzePlayerChoiceOptimized(hand: Card[], playerHolds: boolean[], bet: number = 1): EVAnalysis {
  const analysis = analyzeTopPlays(hand, bet);
  
  // Find the player's choice by calculating its EV
  const playerEV = calculateEVForHoldOptimized(hand, playerHolds, bet);
  const playerKeptCards = hand.filter((_, index) => playerHolds[index]);
  const playerDescription = getHoldDescription(hand, playerHolds);

  const playerChoice: HoldCombination = {
    holds: playerHolds,
    keptCards: playerKeptCards,
    discardCount: 5 - playerKeptCards.length,
    expectedValue: playerEV,
    description: playerDescription
  };

  // Find rank by counting how many combinations have better EV
  let rank = 1;
  for (const combo of analysis.combinations) {
    if (combo.expectedValue > playerEV) {
      rank++;
    }
  }

  return {
    ...analysis,
    playerChoice,
    playerRank: rank,
    isComplete: false
  };
}

// Clear the EV cache (useful for testing)
export function clearEVCache(): void {
  evCache.clear();
}