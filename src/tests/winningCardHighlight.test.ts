import { Card, Suit, Rank, HandType } from '@/game/types';
import { evaluateHand } from '@/game/handEvaluator';

const createCard = (rank: Rank, suit: Suit): Card => ({
  rank,
  suit,
  id: `${rank}_${suit}`
});

// Helper function to simulate the getWinningCards logic from GameBoard
const getWinningCards = (hand: Card[], handType: HandType): boolean[] => {
  const winningCards = [false, false, false, false, false];
  
  // Get rank counts for pair/trips/quads detection
  const rankCounts = new Map<string, number[]>();
  hand.forEach((card, index) => {
    if (!rankCounts.has(card.rank)) {
      rankCounts.set(card.rank, []);
    }
    rankCounts.get(card.rank)!.push(index);
  });

  switch (handType) {
    case HandType.JACKS_OR_BETTER:
      // Find the pair of Jacks or better
      for (const [rank, indices] of rankCounts.entries()) {
        if (indices.length === 2) {
          const highCardRanks = [Rank.JACK, Rank.QUEEN, Rank.KING, Rank.ACE];
          if (highCardRanks.includes(rank as Rank)) {
            indices.forEach(index => winningCards[index] = true);
            break;
          }
        }
      }
      break;

    case HandType.TWO_PAIR:
      // Find both pairs
      for (const [, indices] of rankCounts.entries()) {
        if (indices.length === 2) {
          indices.forEach(index => winningCards[index] = true);
        }
      }
      break;

    case HandType.THREE_OF_A_KIND:
      // Find the three of a kind
      for (const [, indices] of rankCounts.entries()) {
        if (indices.length === 3) {
          indices.forEach(index => winningCards[index] = true);
          break;
        }
      }
      break;

    case HandType.FOUR_OF_A_KIND:
      // Find the four of a kind
      for (const [, indices] of rankCounts.entries()) {
        if (indices.length === 4) {
          indices.forEach(index => winningCards[index] = true);
          break;
        }
      }
      break;

    case HandType.FULL_HOUSE:
      // Find the three of a kind and pair
      for (const [, indices] of rankCounts.entries()) {
        if (indices.length === 3 || indices.length === 2) {
          indices.forEach(index => winningCards[index] = true);
        }
      }
      break;

    // For straights, flushes, straight flushes, and royal flushes, all cards are needed
    case HandType.STRAIGHT:
    case HandType.FLUSH:
    case HandType.STRAIGHT_FLUSH:
    case HandType.ROYAL_FLUSH:
      winningCards.fill(true);
      break;

    default:
      // No winning cards for other hand types
      break;
  }
  
  return winningCards;
};

describe('Winning Card Highlighting', () => {
  describe('Jacks or Better', () => {
    test('should highlight only the pair of Jacks', () => {
      const hand = [
        createCard(Rank.JACK, Suit.HEARTS),
        createCard(Rank.JACK, Suit.DIAMONDS),
        createCard(Rank.FIVE, Suit.CLUBS),
        createCard(Rank.EIGHT, Suit.SPADES),
        createCard(Rank.NINE, Suit.HEARTS)
      ];
      
      const handResult = evaluateHand(hand);
      const winningCards = getWinningCards(hand, handResult.type);
      
      expect(handResult.type).toBe(HandType.JACKS_OR_BETTER);
      expect(winningCards).toEqual([true, true, false, false, false]);
    });

    test('should highlight only the pair of Queens', () => {
      const hand = [
        createCard(Rank.QUEEN, Suit.HEARTS),
        createCard(Rank.THREE, Suit.DIAMONDS),
        createCard(Rank.QUEEN, Suit.CLUBS),
        createCard(Rank.EIGHT, Suit.SPADES),
        createCard(Rank.NINE, Suit.HEARTS)
      ];
      
      const handResult = evaluateHand(hand);
      const winningCards = getWinningCards(hand, handResult.type);
      
      expect(handResult.type).toBe(HandType.JACKS_OR_BETTER);
      expect(winningCards).toEqual([true, false, true, false, false]);
    });

    test('should highlight only the pair of Kings', () => {
      const hand = [
        createCard(Rank.TWO, Suit.HEARTS),
        createCard(Rank.KING, Suit.DIAMONDS),
        createCard(Rank.FIVE, Suit.CLUBS),
        createCard(Rank.KING, Suit.SPADES),
        createCard(Rank.NINE, Suit.HEARTS)
      ];
      
      const handResult = evaluateHand(hand);
      const winningCards = getWinningCards(hand, handResult.type);
      
      expect(handResult.type).toBe(HandType.JACKS_OR_BETTER);
      expect(winningCards).toEqual([false, true, false, true, false]);
    });

    test('should highlight only the pair of Aces', () => {
      const hand = [
        createCard(Rank.ACE, Suit.HEARTS),
        createCard(Rank.ACE, Suit.DIAMONDS),
        createCard(Rank.FIVE, Suit.CLUBS),
        createCard(Rank.EIGHT, Suit.SPADES),
        createCard(Rank.NINE, Suit.HEARTS)
      ];
      
      const handResult = evaluateHand(hand);
      const winningCards = getWinningCards(hand, handResult.type);
      
      expect(handResult.type).toBe(HandType.JACKS_OR_BETTER);
      expect(winningCards).toEqual([true, true, false, false, false]);
    });
  });

  describe('Two Pair', () => {
    test('should highlight both pairs only', () => {
      const hand = [
        createCard(Rank.KING, Suit.HEARTS),
        createCard(Rank.KING, Suit.DIAMONDS),
        createCard(Rank.FIVE, Suit.CLUBS),
        createCard(Rank.FIVE, Suit.SPADES),
        createCard(Rank.NINE, Suit.HEARTS)
      ];
      
      const handResult = evaluateHand(hand);
      const winningCards = getWinningCards(hand, handResult.type);
      
      expect(handResult.type).toBe(HandType.TWO_PAIR);
      expect(winningCards).toEqual([true, true, true, true, false]);
    });

    test('should highlight both pairs when scattered', () => {
      const hand = [
        createCard(Rank.EIGHT, Suit.HEARTS),
        createCard(Rank.QUEEN, Suit.DIAMONDS),
        createCard(Rank.EIGHT, Suit.CLUBS),
        createCard(Rank.TWO, Suit.SPADES),
        createCard(Rank.QUEEN, Suit.HEARTS)
      ];
      
      const handResult = evaluateHand(hand);
      const winningCards = getWinningCards(hand, handResult.type);
      
      expect(handResult.type).toBe(HandType.TWO_PAIR);
      expect(winningCards).toEqual([true, true, true, false, true]);
    });
  });

  describe('Three of a Kind', () => {
    test('should highlight only the three of a kind', () => {
      const hand = [
        createCard(Rank.EIGHT, Suit.HEARTS),
        createCard(Rank.EIGHT, Suit.DIAMONDS),
        createCard(Rank.EIGHT, Suit.CLUBS),
        createCard(Rank.KING, Suit.SPADES),
        createCard(Rank.FIVE, Suit.HEARTS)
      ];
      
      const handResult = evaluateHand(hand);
      const winningCards = getWinningCards(hand, handResult.type);
      
      expect(handResult.type).toBe(HandType.THREE_OF_A_KIND);
      expect(winningCards).toEqual([true, true, true, false, false]);
    });

    test('should highlight three of a kind when scattered', () => {
      const hand = [
        createCard(Rank.JACK, Suit.HEARTS),
        createCard(Rank.TWO, Suit.DIAMONDS),
        createCard(Rank.JACK, Suit.CLUBS),
        createCard(Rank.KING, Suit.SPADES),
        createCard(Rank.JACK, Suit.SPADES)
      ];
      
      const handResult = evaluateHand(hand);
      const winningCards = getWinningCards(hand, handResult.type);
      
      expect(handResult.type).toBe(HandType.THREE_OF_A_KIND);
      expect(winningCards).toEqual([true, false, true, false, true]);
    });
  });

  describe('Four of a Kind', () => {
    test('should highlight only the four of a kind', () => {
      const hand = [
        createCard(Rank.NINE, Suit.HEARTS),
        createCard(Rank.NINE, Suit.DIAMONDS),
        createCard(Rank.NINE, Suit.CLUBS),
        createCard(Rank.NINE, Suit.SPADES),
        createCard(Rank.KING, Suit.HEARTS)
      ];
      
      const handResult = evaluateHand(hand);
      const winningCards = getWinningCards(hand, handResult.type);
      
      expect(handResult.type).toBe(HandType.FOUR_OF_A_KIND);
      expect(winningCards).toEqual([true, true, true, true, false]);
    });

    test('should highlight four of a kind when scattered', () => {
      const hand = [
        createCard(Rank.ACE, Suit.HEARTS),
        createCard(Rank.SEVEN, Suit.DIAMONDS),
        createCard(Rank.ACE, Suit.CLUBS),
        createCard(Rank.ACE, Suit.SPADES),
        createCard(Rank.ACE, Suit.DIAMONDS)
      ];
      
      const handResult = evaluateHand(hand);
      const winningCards = getWinningCards(hand, handResult.type);
      
      expect(handResult.type).toBe(HandType.FOUR_OF_A_KIND);
      expect(winningCards).toEqual([true, false, true, true, true]);
    });
  });

  describe('Full House', () => {
    test('should highlight all cards in full house', () => {
      const hand = [
        createCard(Rank.JACK, Suit.HEARTS),
        createCard(Rank.JACK, Suit.DIAMONDS),
        createCard(Rank.JACK, Suit.CLUBS),
        createCard(Rank.SEVEN, Suit.SPADES),
        createCard(Rank.SEVEN, Suit.HEARTS)
      ];
      
      const handResult = evaluateHand(hand);
      const winningCards = getWinningCards(hand, handResult.type);
      
      expect(handResult.type).toBe(HandType.FULL_HOUSE);
      expect(winningCards).toEqual([true, true, true, true, true]);
    });

    test('should highlight all cards in full house when scattered', () => {
      const hand = [
        createCard(Rank.TWO, Suit.HEARTS),
        createCard(Rank.FIVE, Suit.DIAMONDS),
        createCard(Rank.TWO, Suit.CLUBS),
        createCard(Rank.FIVE, Suit.SPADES),
        createCard(Rank.FIVE, Suit.HEARTS)
      ];
      
      const handResult = evaluateHand(hand);
      const winningCards = getWinningCards(hand, handResult.type);
      
      expect(handResult.type).toBe(HandType.FULL_HOUSE);
      expect(winningCards).toEqual([true, true, true, true, true]);
    });
  });

  describe('Flush', () => {
    test('should highlight all cards in flush', () => {
      const hand = [
        createCard(Rank.TWO, Suit.CLUBS),
        createCard(Rank.FIVE, Suit.CLUBS),
        createCard(Rank.EIGHT, Suit.CLUBS),
        createCard(Rank.JACK, Suit.CLUBS),
        createCard(Rank.ACE, Suit.CLUBS)
      ];
      
      const handResult = evaluateHand(hand);
      const winningCards = getWinningCards(hand, handResult.type);
      
      expect(handResult.type).toBe(HandType.FLUSH);
      expect(winningCards).toEqual([true, true, true, true, true]);
    });
  });

  describe('Straight', () => {
    test('should highlight all cards in straight', () => {
      const hand = [
        createCard(Rank.FOUR, Suit.HEARTS),
        createCard(Rank.FIVE, Suit.DIAMONDS),
        createCard(Rank.SIX, Suit.CLUBS),
        createCard(Rank.SEVEN, Suit.SPADES),
        createCard(Rank.EIGHT, Suit.HEARTS)
      ];
      
      const handResult = evaluateHand(hand);
      const winningCards = getWinningCards(hand, handResult.type);
      
      expect(handResult.type).toBe(HandType.STRAIGHT);
      expect(winningCards).toEqual([true, true, true, true, true]);
    });

    test('should highlight all cards in ace-low straight', () => {
      const hand = [
        createCard(Rank.ACE, Suit.HEARTS),
        createCard(Rank.TWO, Suit.DIAMONDS),
        createCard(Rank.THREE, Suit.CLUBS),
        createCard(Rank.FOUR, Suit.SPADES),
        createCard(Rank.FIVE, Suit.HEARTS)
      ];
      
      const handResult = evaluateHand(hand);
      const winningCards = getWinningCards(hand, handResult.type);
      
      expect(handResult.type).toBe(HandType.STRAIGHT);
      expect(winningCards).toEqual([true, true, true, true, true]);
    });
  });

  describe('Straight Flush', () => {
    test('should highlight all cards in straight flush', () => {
      const hand = [
        createCard(Rank.FIVE, Suit.DIAMONDS),
        createCard(Rank.SIX, Suit.DIAMONDS),
        createCard(Rank.SEVEN, Suit.DIAMONDS),
        createCard(Rank.EIGHT, Suit.DIAMONDS),
        createCard(Rank.NINE, Suit.DIAMONDS)
      ];
      
      const handResult = evaluateHand(hand);
      const winningCards = getWinningCards(hand, handResult.type);
      
      expect(handResult.type).toBe(HandType.STRAIGHT_FLUSH);
      expect(winningCards).toEqual([true, true, true, true, true]);
    });
  });

  describe('Royal Flush', () => {
    test('should highlight all cards in royal flush', () => {
      const hand = [
        createCard(Rank.TEN, Suit.HEARTS),
        createCard(Rank.JACK, Suit.HEARTS),
        createCard(Rank.QUEEN, Suit.HEARTS),
        createCard(Rank.KING, Suit.HEARTS),
        createCard(Rank.ACE, Suit.HEARTS)
      ];
      
      const handResult = evaluateHand(hand);
      const winningCards = getWinningCards(hand, handResult.type);
      
      expect(handResult.type).toBe(HandType.ROYAL_FLUSH);
      expect(winningCards).toEqual([true, true, true, true, true]);
    });
  });

  describe('Non-winning hands', () => {
    test('should not highlight any cards for high card', () => {
      const hand = [
        createCard(Rank.TWO, Suit.HEARTS),
        createCard(Rank.FOUR, Suit.DIAMONDS),
        createCard(Rank.SIX, Suit.CLUBS),
        createCard(Rank.EIGHT, Suit.SPADES),
        createCard(Rank.TEN, Suit.HEARTS)
      ];
      
      const handResult = evaluateHand(hand);
      const winningCards = getWinningCards(hand, handResult.type);
      
      expect(handResult.type).toBe(HandType.HIGH_CARD);
      expect(winningCards).toEqual([false, false, false, false, false]);
    });

    test('should not highlight any cards for low pairs', () => {
      const hand = [
        createCard(Rank.SEVEN, Suit.HEARTS),
        createCard(Rank.SEVEN, Suit.DIAMONDS),
        createCard(Rank.THREE, Suit.CLUBS),
        createCard(Rank.NINE, Suit.SPADES),
        createCard(Rank.KING, Suit.HEARTS)
      ];
      
      const handResult = evaluateHand(hand);
      const winningCards = getWinningCards(hand, handResult.type);
      
      expect(handResult.type).toBe(HandType.PAIR);
      expect(winningCards).toEqual([false, false, false, false, false]);
    });
  });
});