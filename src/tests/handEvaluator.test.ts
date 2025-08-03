import { evaluateHand } from '@/game/handEvaluator';
import { Card, Suit, Rank, HandType } from '@/game/types';

const createCard = (rank: Rank, suit: Suit): Card => ({
  rank,
  suit,
  id: `${rank}_${suit}`
});

describe('Hand Evaluator', () => {
  test('should identify royal flush', () => {
    const hand = [
      createCard(Rank.TEN, Suit.HEARTS),
      createCard(Rank.JACK, Suit.HEARTS),
      createCard(Rank.QUEEN, Suit.HEARTS),
      createCard(Rank.KING, Suit.HEARTS),
      createCard(Rank.ACE, Suit.HEARTS)
    ];
    
    const result = evaluateHand(hand);
    expect(result.type).toBe(HandType.ROYAL_FLUSH);
    expect(result.description).toBe('Royal Flush');
  });

  test('should identify straight flush', () => {
    const hand = [
      createCard(Rank.FIVE, Suit.CLUBS),
      createCard(Rank.SIX, Suit.CLUBS),
      createCard(Rank.SEVEN, Suit.CLUBS),
      createCard(Rank.EIGHT, Suit.CLUBS),
      createCard(Rank.NINE, Suit.CLUBS)
    ];
    
    const result = evaluateHand(hand);
    expect(result.type).toBe(HandType.STRAIGHT_FLUSH);
  });

  test('should identify four of a kind', () => {
    const hand = [
      createCard(Rank.ACE, Suit.HEARTS),
      createCard(Rank.ACE, Suit.DIAMONDS),
      createCard(Rank.ACE, Suit.CLUBS),
      createCard(Rank.ACE, Suit.SPADES),
      createCard(Rank.KING, Suit.HEARTS)
    ];
    
    const result = evaluateHand(hand);
    expect(result.type).toBe(HandType.FOUR_OF_A_KIND);
  });

  test('should identify full house', () => {
    const hand = [
      createCard(Rank.KING, Suit.HEARTS),
      createCard(Rank.KING, Suit.DIAMONDS),
      createCard(Rank.KING, Suit.CLUBS),
      createCard(Rank.ACE, Suit.HEARTS),
      createCard(Rank.ACE, Suit.SPADES)
    ];
    
    const result = evaluateHand(hand);
    expect(result.type).toBe(HandType.FULL_HOUSE);
  });

  test('should identify flush', () => {
    const hand = [
      createCard(Rank.TWO, Suit.HEARTS),
      createCard(Rank.FIVE, Suit.HEARTS),
      createCard(Rank.SEVEN, Suit.HEARTS),
      createCard(Rank.JACK, Suit.HEARTS),
      createCard(Rank.ACE, Suit.HEARTS)
    ];
    
    const result = evaluateHand(hand);
    expect(result.type).toBe(HandType.FLUSH);
  });

  test('should identify straight', () => {
    const hand = [
      createCard(Rank.FIVE, Suit.HEARTS),
      createCard(Rank.SIX, Suit.DIAMONDS),
      createCard(Rank.SEVEN, Suit.CLUBS),
      createCard(Rank.EIGHT, Suit.SPADES),
      createCard(Rank.NINE, Suit.HEARTS)
    ];
    
    const result = evaluateHand(hand);
    expect(result.type).toBe(HandType.STRAIGHT);
  });

  test('should identify jacks or better', () => {
    const hand = [
      createCard(Rank.JACK, Suit.HEARTS),
      createCard(Rank.JACK, Suit.DIAMONDS),
      createCard(Rank.FIVE, Suit.CLUBS),
      createCard(Rank.EIGHT, Suit.SPADES),
      createCard(Rank.NINE, Suit.HEARTS)
    ];
    
    const result = evaluateHand(hand);
    expect(result.type).toBe(HandType.JACKS_OR_BETTER);
  });

  test('should identify low pair as non-paying', () => {
    const hand = [
      createCard(Rank.NINE, Suit.HEARTS),
      createCard(Rank.NINE, Suit.DIAMONDS),
      createCard(Rank.FIVE, Suit.CLUBS),
      createCard(Rank.EIGHT, Suit.SPADES),
      createCard(Rank.KING, Suit.HEARTS)
    ];
    
    const result = evaluateHand(hand);
    expect(result.type).toBe(HandType.PAIR);
  });
});