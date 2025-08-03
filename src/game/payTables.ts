import { PayTable, HandType } from './types';

export const JACKS_OR_BETTER_9_6: PayTable = {
  [HandType.ROYAL_FLUSH]: [250, 500, 750, 1000, 4000],
  [HandType.STRAIGHT_FLUSH]: [50, 100, 150, 200, 250],
  [HandType.FOUR_OF_A_KIND]: [25, 50, 75, 100, 125],
  [HandType.FULL_HOUSE]: [9, 18, 27, 36, 45],
  [HandType.FLUSH]: [6, 12, 18, 24, 30],
  [HandType.STRAIGHT]: [4, 8, 12, 16, 20],
  [HandType.THREE_OF_A_KIND]: [3, 6, 9, 12, 15],
  [HandType.TWO_PAIR]: [2, 4, 6, 8, 10],
  [HandType.JACKS_OR_BETTER]: [1, 2, 3, 4, 5]
};

export function getPayoutForHand(handType: HandType, bet: number, payTable: PayTable = JACKS_OR_BETTER_9_6): number {
  const betIndex = Math.min(bet - 1, 4);
  const handPayouts = payTable[handType as keyof PayTable];
  return handPayouts?.[betIndex] || 0;
}

export function getReturnToPlayer(): number {
  return 99.54;
}