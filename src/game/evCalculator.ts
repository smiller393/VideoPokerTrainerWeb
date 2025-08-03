// Expected Value Calculator for Video Poker
// Calculates exact EV for all possible hold combinations

import { Card, Rank, Suit, HandType } from './types';
import { evaluateHand } from './handEvaluator';
import { getPayoutForHand, JACKS_OR_BETTER_9_6 } from './payTables';

export interface HoldCombination {
  holds: boolean[];
  keptCards: Card[];
  discardCount: number;
  expectedValue: number;
  description: string;
  handType?: HandType;
  payback: number; // Expected payback in credits for this bet
}

export interface EVAnalysis {
  combinations: HoldCombination[];
  playerChoice?: HoldCombination;
  optimalChoice: HoldCombination;
  playerRank?: number; // Where the player's choice ranks (1 = best, 32 = worst)
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

// Generate all possible combinations of n items taken k at a time
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

  // Include first item
  for (const combo of combinations(items.slice(1), k - 1)) {
    yield [items[0], ...combo];
  }

  // Exclude first item
  for (const combo of combinations(items.slice(1), k)) {
    yield combo;
  }
}

// Calculate expected value for a specific hold combination
function calculateEVForHold(hand: Card[], holds: boolean[], bet: number): number {
  const keptCards = hand.filter((_, index) => holds[index]);
  const discardCount = 5 - keptCards.length;
  
  if (discardCount === 0) {
    // No cards to draw, hand is complete
    const result = evaluateHand(hand);
    return getPayoutForHand(result.type, bet, JACKS_OR_BETTER_9_6);
  }

  const availableCards = getAvailableCards(hand);
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

// Get a human-readable description for a hold combination
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

  if (keptCards.length === 1) {
    return `Keep ${keptCards[0].rank}`;
  }

  if (keptCards.length === 2) {
    // Check if it's a pair
    if (keptCards[0].rank === keptCards[1].rank) {
      return `Keep pair of ${keptCards[0].rank}s`;
    }
    // Check if both are high cards
    const highCards = [Rank.JACK, Rank.QUEEN, Rank.KING, Rank.ACE];
    if (highCards.includes(keptCards[0].rank) && highCards.includes(keptCards[1].rank)) {
      if (keptCards[0].suit === keptCards[1].suit) {
        return `Keep ${keptCards[0].rank} ${keptCards[1].rank} suited`;
      } else {
        return `Keep ${keptCards[0].rank} ${keptCards[1].rank}`;
      }
    }
    return `Keep ${keptCards.map(c => c.rank).join(' ')}`;
  }

  // For 3+ cards, just list them
  return `Keep ${keptCards.map(c => c.rank).join(' ')}`;
}

// Generate all 32 possible hold combinations
function generateAllHoldCombinations(): boolean[][] {
  const combinations: boolean[][] = [];
  
  // Generate all binary combinations from 00000 to 11111
  for (let i = 0; i < 32; i++) {
    const holds: boolean[] = [];
    for (let j = 0; j < 5; j++) {
      holds.push((i & (1 << j)) !== 0);
    }
    combinations.push(holds);
  }
  
  return combinations;
}

// Main function to analyze all possible plays for a hand
export function analyzeAllPlays(hand: Card[], bet: number = 1): EVAnalysis {
  const allCombinations = generateAllHoldCombinations();
  const results: HoldCombination[] = [];

  // Calculate EV for each combination
  for (const holds of allCombinations) {
    const keptCards = hand.filter((_, index) => holds[index]);
    const expectedValue = calculateEVForHold(hand, holds, bet);
    const description = getHoldDescription(hand, holds);
    const payback = expectedValue; // In credits

    // If no discards, get the actual hand type
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
      handType,
      payback
    });
  }

  // Sort by expected value (highest first)
  results.sort((a, b) => b.expectedValue - a.expectedValue);

  const optimalChoice = results[0];

  return {
    combinations: results,
    optimalChoice,
    playerChoice: undefined, // Will be set when comparing player's choice
    playerRank: undefined
  };
}

// Analyze player's choice against all possibilities
export function analyzePlayerChoice(hand: Card[], playerHolds: boolean[], bet: number = 1): EVAnalysis {
  const analysis = analyzeAllPlays(hand, bet);
  
  // Find the player's choice in the results
  const playerChoice = analysis.combinations.find(combo => 
    combo.holds.every((hold, index) => hold === playerHolds[index])
  );

  if (playerChoice) {
    // Find the rank of the player's choice
    const playerRank = analysis.combinations.indexOf(playerChoice) + 1;
    
    return {
      ...analysis,
      playerChoice,
      playerRank
    };
  }

  return analysis;
}