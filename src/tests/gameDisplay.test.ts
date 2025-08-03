import { getPayoutForHand, JACKS_OR_BETTER_9_6 } from '@/game/payTables';
import { HandType } from '@/game/types';

describe('Game Display Logic', () => {
  test('should not pay for low pairs', () => {
    const payout = getPayoutForHand(HandType.PAIR, 1, JACKS_OR_BETTER_9_6);
    expect(payout).toBe(0);
  });

  test('should not pay for high card', () => {
    const payout = getPayoutForHand(HandType.HIGH_CARD, 1, JACKS_OR_BETTER_9_6);
    expect(payout).toBe(0);
  });

  test('should pay for jacks or better', () => {
    const payout = getPayoutForHand(HandType.JACKS_OR_BETTER, 1, JACKS_OR_BETTER_9_6);
    expect(payout).toBe(1);
  });

  test('should pay for two pair', () => {
    const payout = getPayoutForHand(HandType.TWO_PAIR, 1, JACKS_OR_BETTER_9_6);
    expect(payout).toBe(2);
  });

  test('should pay for three of a kind', () => {
    const payout = getPayoutForHand(HandType.THREE_OF_A_KIND, 1, JACKS_OR_BETTER_9_6);
    expect(payout).toBe(3);
  });

  test('should pay for straight', () => {
    const payout = getPayoutForHand(HandType.STRAIGHT, 1, JACKS_OR_BETTER_9_6);
    expect(payout).toBe(4);
  });

  test('should pay for flush', () => {
    const payout = getPayoutForHand(HandType.FLUSH, 1, JACKS_OR_BETTER_9_6);
    expect(payout).toBe(6);
  });

  test('should pay for full house', () => {
    const payout = getPayoutForHand(HandType.FULL_HOUSE, 1, JACKS_OR_BETTER_9_6);
    expect(payout).toBe(9);
  });

  test('should pay for four of a kind', () => {
    const payout = getPayoutForHand(HandType.FOUR_OF_A_KIND, 1, JACKS_OR_BETTER_9_6);
    expect(payout).toBe(25);
  });

  test('should pay for straight flush', () => {
    const payout = getPayoutForHand(HandType.STRAIGHT_FLUSH, 1, JACKS_OR_BETTER_9_6);
    expect(payout).toBe(50);
  });

  test('should pay for royal flush', () => {
    const payout = getPayoutForHand(HandType.ROYAL_FLUSH, 1, JACKS_OR_BETTER_9_6);
    expect(payout).toBe(250);
  });

  test('should scale payouts with bet amount', () => {
    const payout1 = getPayoutForHand(HandType.JACKS_OR_BETTER, 1, JACKS_OR_BETTER_9_6);
    const payout5 = getPayoutForHand(HandType.JACKS_OR_BETTER, 5, JACKS_OR_BETTER_9_6);
    expect(payout1).toBe(1);
    expect(payout5).toBe(5);
  });

  test('should give royal flush bonus for max bet', () => {
    const payout4 = getPayoutForHand(HandType.ROYAL_FLUSH, 4, JACKS_OR_BETTER_9_6);
    const payout5 = getPayoutForHand(HandType.ROYAL_FLUSH, 5, JACKS_OR_BETTER_9_6);
    expect(payout4).toBe(1000); // 250 * 4
    expect(payout5).toBe(4000); // Bonus payout
  });
});