import { GameState } from './types';
import { createDeck, shuffleDeck, dealHand, replaceCards } from './deck';
import { evaluateHand } from './handEvaluator';
import { getPayoutForHand, JACKS_OR_BETTER_9_6 } from './payTables';
import { PerformanceMonitor } from '@/utils/performance';

export function createInitialGameState(): GameState {
  return {
    deck: shuffleDeck(createDeck()),
    hand: [],
    heldCards: [false, false, false, false, false],
    credits: 1000,
    bet: 1,
    gamePhase: 'initial' as const
  };
}

export function dealNewHand(state: GameState): GameState {
  return PerformanceMonitor.measure('dealNewHand', () => {
    if (state.credits < state.bet) {
      throw new Error('Insufficient credits');
    }

    const shuffledDeck = shuffleDeck(createDeck());
    const { hand, remainingDeck } = dealHand(shuffledDeck);
    
    return {
      ...state,
      deck: remainingDeck,
      hand,
      heldCards: [false, false, false, false, false],
      credits: state.credits - state.bet,
      gamePhase: 'dealt' as const,
      lastResult: undefined,
      optimalHolds: undefined,
      mistakeMade: false,
      evAnalysis: undefined
    };
  }).result;
}

export function toggleHold(state: GameState, cardIndex: number): GameState {
  if (state.gamePhase !== 'dealt') {
    return state;
  }

  const newHeldCards = [...state.heldCards];
  newHeldCards[cardIndex] = !newHeldCards[cardIndex];

  return {
    ...state,
    heldCards: newHeldCards
  };
}

export function drawCards(state: GameState): GameState {
  return PerformanceMonitor.measure('drawCards', () => {
    if (state.gamePhase !== 'dealt') {
      return state;
    }

    // First, process the card draw immediately for quick feedback
    const { newHand, remainingDeck } = replaceCards(state.hand, state.heldCards, state.deck);
    const result = evaluateHand(newHand);
    const payout = getPayoutForHand(result.type, state.bet, JACKS_OR_BETTER_9_6);

    // No immediate strategy feedback - will be determined by EV analysis in UI

    return {
      ...state,
      deck: remainingDeck,
      hand: newHand,
      credits: state.credits + payout,
      gamePhase: 'drawn' as const,
      lastResult: result,
      optimalHolds: undefined,
      mistakeMade: false,
      evAnalysis: undefined // Will be populated by background analysis
    };
  }).result;
}

export function setBet(state: GameState, bet: number): GameState {
  if (bet < 1 || bet > 5 || state.gamePhase === 'dealt') {
    return state;
  }

  return {
    ...state,
    bet: Math.min(bet, Math.floor(state.credits / bet) * bet)
  };
}

export function resetGame(state: GameState): GameState {
  return {
    ...state,
    gamePhase: 'initial' as const,
    hand: [],
    heldCards: [false, false, false, false, false],
    lastResult: undefined,
    optimalHolds: undefined,
    mistakeMade: false,
    evAnalysis: undefined
  };
}

// Removed arraysEqual function as it's no longer used