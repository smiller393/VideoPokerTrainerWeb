import { createInitialGameState, dealNewHand, toggleHold, drawCards, setBet } from '@/game/engine';

describe('Game Engine', () => {
  test('should create initial game state', () => {
    const state = createInitialGameState();
    
    expect(state.credits).toBe(1000);
    expect(state.bet).toBe(1);
    expect(state.gamePhase).toBe('initial');
    expect(state.hand).toHaveLength(0);
    expect(state.heldCards).toEqual([false, false, false, false, false]);
  });

  test('should deal new hand', () => {
    const initialState = createInitialGameState();
    const state = dealNewHand(initialState);
    
    expect(state.hand).toHaveLength(5);
    expect(state.credits).toBe(999); // 1000 - 1 bet
    expect(state.gamePhase).toBe('dealt');
    expect(state.heldCards).toEqual([false, false, false, false, false]);
  });

  test('should toggle hold cards', () => {
    const initialState = createInitialGameState();
    const dealtState = dealNewHand(initialState);
    const heldState = toggleHold(dealtState, 0);
    
    expect(heldState.heldCards[0]).toBe(true);
    expect(heldState.heldCards[1]).toBe(false);
    
    const unheldState = toggleHold(heldState, 0);
    expect(unheldState.heldCards[0]).toBe(false);
  });

  test('should not allow hold toggle when not in dealt phase', () => {
    const initialState = createInitialGameState();
    const heldState = toggleHold(initialState, 0);
    
    expect(heldState.heldCards).toEqual([false, false, false, false, false]);
  });

  test('should set bet amount', () => {
    const initialState = createInitialGameState();
    const state = setBet(initialState, 5);
    
    expect(state.bet).toBe(5);
  });

  test('should not allow bet change during dealt phase', () => {
    const initialState = createInitialGameState();
    const dealtState = dealNewHand(initialState);
    const betState = setBet(dealtState, 5);
    
    expect(betState.bet).toBe(1); // Should remain unchanged
  });

  test('should draw cards and evaluate hand', () => {
    const initialState = createInitialGameState();
    const dealtState = dealNewHand(initialState);
    const drawnState = drawCards(dealtState);
    
    expect(drawnState.gamePhase).toBe('drawn');
    expect(drawnState.lastResult).toBeDefined();
    expect(drawnState.optimalHolds).toBeUndefined(); // No longer computed by engine
  });
});