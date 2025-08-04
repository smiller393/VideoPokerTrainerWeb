import { dealNewHand, drawCards, createInitialGameState } from '@/game/engine';
import { analyzeAllPlaysAsync, analyzePlayerChoiceOptimized, clearEVCache } from '@/game/evCalculatorOptimized';
import { getQuickOptimalPlay } from '@/game/quickStrategy';
import { PerformanceMonitor } from '@/utils/performance';
import { Rank, Suit } from '@/game/types';

const createTestCard = (rank: Rank, suit: Suit) => ({
  rank,
  suit,
  id: `${rank}_${suit}`
});

describe('Performance Tests', () => {
  beforeEach(() => {
    PerformanceMonitor.clearMeasurements();
    clearEVCache();
  });

  test('deal new hand should be fast (<20ms)', () => {
    const state = createInitialGameState();
    
    const { duration } = PerformanceMonitor.measure('test_deal', () => {
      dealNewHand(state);
    });

    expect(duration).toBeLessThan(20);
    console.log(`Deal time: ${duration.toFixed(2)}ms`);
  });

  test('draw cards should be fast (<100ms)', () => {
    let state = createInitialGameState();
    state = dealNewHand(state);
    
    // Select some cards to hold
    state.heldCards = [true, false, true, false, false];
    
    const { duration } = PerformanceMonitor.measure('test_draw', () => {
      drawCards(state);
    });

    expect(duration).toBeLessThan(100);
    console.log(`Draw time: ${duration.toFixed(2)}ms`);
  });

  test('quick strategy analysis should be fast (<10ms)', () => {
    const testHand = [
      createTestCard(Rank.ACE, Suit.HEARTS),
      createTestCard(Rank.KING, Suit.HEARTS),
      createTestCard(Rank.QUEEN, Suit.HEARTS),
      createTestCard(Rank.JACK, Suit.HEARTS),
      createTestCard(Rank.TWO, Suit.CLUBS)
    ];
    
    const { duration } = PerformanceMonitor.measure('test_quick_strategy', () => {
      getQuickOptimalPlay(testHand);
    });

    expect(duration).toBeLessThan(10);
    console.log(`Quick strategy analysis time: ${duration.toFixed(2)}ms`);
  });

  test('full EV analysis should complete in reasonable time (<2000ms)', async () => {
    const testHand = [
      createTestCard(Rank.ACE, Suit.HEARTS),
      createTestCard(Rank.KING, Suit.HEARTS),
      createTestCard(Rank.QUEEN, Suit.HEARTS),
      createTestCard(Rank.JACK, Suit.HEARTS),
      createTestCard(Rank.TWO, Suit.CLUBS)
    ];
    
    const start = performance.now();
    const analysis = await analyzeAllPlaysAsync(testHand, 1);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(2000);
    expect(analysis.isComplete).toBe(true);
    expect(analysis.combinations).toHaveLength(32);
    console.log(`Full EV analysis time: ${duration.toFixed(2)}ms`);
  });

  test('EV caching should improve subsequent calculations', () => {
    const testHand = [
      createTestCard(Rank.ACE, Suit.HEARTS),
      createTestCard(Rank.KING, Suit.HEARTS),
      createTestCard(Rank.QUEEN, Suit.HEARTS),
      createTestCard(Rank.JACK, Suit.HEARTS),
      createTestCard(Rank.TWO, Suit.CLUBS)
    ];
    
    // First calculation (should populate cache)
    const { duration: firstDuration } = PerformanceMonitor.measure('first_calculation', () => {
      analyzePlayerChoiceOptimized(testHand, [true, true, true, true, false], 1);
    });

    // Second calculation (should use cache)
    const { duration: secondDuration } = PerformanceMonitor.measure('second_calculation', () => {
      analyzePlayerChoiceOptimized(testHand, [true, true, true, true, false], 1);
    });

    expect(secondDuration).toBeLessThan(firstDuration);
    console.log(`First calculation: ${firstDuration.toFixed(2)}ms, Second: ${secondDuration.toFixed(2)}ms`);
  });

  test('should measure performance across multiple deals', () => {
    let state = createInitialGameState();
    const dealTimes: number[] = [];
    const drawTimes: number[] = [];

    // Perform 10 complete game cycles
    for (let i = 0; i < 10; i++) {
      // Deal
      const { duration: dealDuration } = PerformanceMonitor.measure(`deal_${i}`, () => {
        state = dealNewHand(state);
      });
      dealTimes.push(dealDuration);

      // Hold some cards
      state.heldCards = [i % 2 === 0, false, i % 3 === 0, false, i % 4 === 0];

      // Draw
      const { duration: drawDuration } = PerformanceMonitor.measure(`draw_${i}`, () => {
        state = drawCards(state);
      });
      drawTimes.push(drawDuration);

      // Reset for next deal
      state.gamePhase = 'initial';
    }

    const avgDealTime = dealTimes.reduce((a, b) => a + b, 0) / dealTimes.length;
    const avgDrawTime = drawTimes.reduce((a, b) => a + b, 0) / drawTimes.length;

    console.log(`Average deal time: ${avgDealTime.toFixed(2)}ms`);
    console.log(`Average draw time: ${avgDrawTime.toFixed(2)}ms`);

    expect(avgDealTime).toBeLessThan(20);
    expect(avgDrawTime).toBeLessThan(100);
  });

  test('should detect slow operations', () => {
    // This test verifies our performance monitoring is working
    PerformanceMonitor.measure('slow_operation', () => {
      // Simulate slow operation
      const start = Date.now();
      while (Date.now() - start < 60) {
        // Busy wait for 60ms
      }
    });

    const measurements = PerformanceMonitor.getAllMeasurements();
    const slowOp = measurements.find(m => m.operation === 'slow_operation');
    
    expect(slowOp).toBeDefined();
    expect(slowOp!.duration).toBeGreaterThan(50);
  });
});