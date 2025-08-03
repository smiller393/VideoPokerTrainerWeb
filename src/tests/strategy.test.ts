import { analyzeOptimalStrategy } from '@/game/strategy';
import { Card, Suit, Rank } from '@/game/types';

const createCard = (rank: Rank, suit: Suit): Card => ({
  rank,
  suit,
  id: `${rank}_${suit}`
});

describe('Strategy Engine', () => {
  test('should keep paying hands (Royal Flush)', () => {
    const hand = [
      createCard(Rank.TEN, Suit.HEARTS),
      createCard(Rank.JACK, Suit.HEARTS),
      createCard(Rank.QUEEN, Suit.HEARTS),
      createCard(Rank.KING, Suit.HEARTS),
      createCard(Rank.ACE, Suit.HEARTS)
    ];
    
    const analysis = analyzeOptimalStrategy(hand);
    expect(analysis.optimalHolds).toEqual([true, true, true, true, true]);
    expect(analysis.explanation).toContain('Keep the entire Royal Flush');
  });

  test('should keep paying hands (Jacks or Better)', () => {
    const hand = [
      createCard(Rank.JACK, Suit.HEARTS),
      createCard(Rank.JACK, Suit.DIAMONDS),
      createCard(Rank.FIVE, Suit.CLUBS),
      createCard(Rank.EIGHT, Suit.SPADES),
      createCard(Rank.NINE, Suit.HEARTS)
    ];
    
    const analysis = analyzeOptimalStrategy(hand);
    expect(analysis.optimalHolds).toEqual([true, true, false, false, false]);
    expect(analysis.explanation).toContain('Keep pair of Js');
  });

  test('should keep four cards to a royal flush over a low pair', () => {
    const hand = [
      createCard(Rank.TEN, Suit.HEARTS),
      createCard(Rank.JACK, Suit.HEARTS),
      createCard(Rank.QUEEN, Suit.HEARTS),
      createCard(Rank.KING, Suit.HEARTS),
      createCard(Rank.FIVE, Suit.CLUBS)
    ];
    
    const analysis = analyzeOptimalStrategy(hand);
    expect(analysis.optimalHolds).toEqual([true, true, true, true, false]);
    expect(analysis.explanation).toContain('Keep four cards to a royal flush');
  });

  test('should keep three of a kind', () => {
    const hand = [
      createCard(Rank.EIGHT, Suit.HEARTS),
      createCard(Rank.EIGHT, Suit.DIAMONDS),
      createCard(Rank.EIGHT, Suit.CLUBS),
      createCard(Rank.KING, Suit.SPADES),
      createCard(Rank.FIVE, Suit.HEARTS)
    ];
    
    const analysis = analyzeOptimalStrategy(hand);
    expect(analysis.optimalHolds).toEqual([true, true, true, false, false]);
    expect(analysis.explanation).toContain('Keep three 8s');
  });

  test('should keep two pair', () => {
    const hand = [
      createCard(Rank.KING, Suit.HEARTS),
      createCard(Rank.KING, Suit.DIAMONDS),
      createCard(Rank.FIVE, Suit.CLUBS),
      createCard(Rank.FIVE, Suit.SPADES),
      createCard(Rank.NINE, Suit.HEARTS)
    ];
    
    const analysis = analyzeOptimalStrategy(hand);
    expect(analysis.optimalHolds).toEqual([true, true, true, true, false]);
    expect(analysis.explanation).toContain('Keep both pairs');
  });

  test('should keep high pair only', () => {
    const hand = [
      createCard(Rank.KING, Suit.HEARTS),
      createCard(Rank.KING, Suit.DIAMONDS),
      createCard(Rank.FIVE, Suit.CLUBS),
      createCard(Rank.EIGHT, Suit.SPADES),
      createCard(Rank.NINE, Suit.HEARTS)
    ];
    
    const analysis = analyzeOptimalStrategy(hand);
    expect(analysis.optimalHolds).toEqual([true, true, false, false, false]);
    expect(analysis.explanation).toContain('Keep pair of Ks');
  });

  test('should keep four cards to a flush', () => {
    const hand = [
      createCard(Rank.TWO, Suit.HEARTS),
      createCard(Rank.FIVE, Suit.HEARTS),
      createCard(Rank.SEVEN, Suit.HEARTS),
      createCard(Rank.NINE, Suit.HEARTS),
      createCard(Rank.KING, Suit.CLUBS)
    ];
    
    const analysis = analyzeOptimalStrategy(hand);
    expect(analysis.optimalHolds).toEqual([true, true, true, true, false]);
    expect(analysis.explanation).toContain('Keep four cards to a flush');
  });

  test('should keep low pair when no better options', () => {
    const hand = [
      createCard(Rank.SEVEN, Suit.HEARTS),
      createCard(Rank.SEVEN, Suit.DIAMONDS),
      createCard(Rank.THREE, Suit.CLUBS),
      createCard(Rank.NINE, Suit.SPADES),
      createCard(Rank.KING, Suit.HEARTS)
    ];
    
    const analysis = analyzeOptimalStrategy(hand);
    expect(analysis.optimalHolds).toEqual([true, true, false, false, false]);
    expect(analysis.explanation).toContain('Keep pair of 7s');
  });

  test('should keep two suited high cards', () => {
    const hand = [
      createCard(Rank.KING, Suit.HEARTS),
      createCard(Rank.QUEEN, Suit.HEARTS),
      createCard(Rank.THREE, Suit.CLUBS),
      createCard(Rank.SEVEN, Suit.SPADES),
      createCard(Rank.NINE, Suit.DIAMONDS)
    ];
    
    const analysis = analyzeOptimalStrategy(hand);
    expect(analysis.optimalHolds).toEqual([true, true, false, false, false]);
    expect(analysis.explanation).toContain('Keep two suited high cards');
  });

  test('should keep one high card when nothing else', () => {
    const hand = [
      createCard(Rank.ACE, Suit.HEARTS),
      createCard(Rank.THREE, Suit.DIAMONDS),
      createCard(Rank.FIVE, Suit.CLUBS),
      createCard(Rank.SEVEN, Suit.SPADES),
      createCard(Rank.NINE, Suit.HEARTS)
    ];
    
    const analysis = analyzeOptimalStrategy(hand);
    expect(analysis.optimalHolds).toEqual([true, false, false, false, false]);
    expect(analysis.explanation).toContain('Keep A');
  });

  test('should discard all when no playable cards', () => {
    const hand = [
      createCard(Rank.TWO, Suit.HEARTS),
      createCard(Rank.FOUR, Suit.DIAMONDS),
      createCard(Rank.SIX, Suit.CLUBS),
      createCard(Rank.EIGHT, Suit.SPADES),
      createCard(Rank.TEN, Suit.HEARTS)
    ];
    
    const analysis = analyzeOptimalStrategy(hand);
    expect(analysis.optimalHolds).toEqual([false, false, false, false, false]);
    expect(analysis.explanation).toContain('Discard all cards');
  });

  test('should prioritize four to straight flush over pair', () => {
    const hand = [
      createCard(Rank.SEVEN, Suit.HEARTS),
      createCard(Rank.EIGHT, Suit.HEARTS),
      createCard(Rank.NINE, Suit.HEARTS),
      createCard(Rank.TEN, Suit.HEARTS),
      createCard(Rank.SEVEN, Suit.CLUBS)
    ];
    
    const analysis = analyzeOptimalStrategy(hand);
    expect(analysis.optimalHolds).toEqual([true, true, true, true, false]);
    expect(analysis.explanation).toContain('Keep four cards to a straight flush');
  });

  // === PAYING HANDS TESTS ===
  describe('Paying Hands', () => {
    test('should keep straight flush', () => {
      const hand = [
        createCard(Rank.FIVE, Suit.DIAMONDS),
        createCard(Rank.SIX, Suit.DIAMONDS),
        createCard(Rank.SEVEN, Suit.DIAMONDS),
        createCard(Rank.EIGHT, Suit.DIAMONDS),
        createCard(Rank.NINE, Suit.DIAMONDS)
      ];
      
      const analysis = analyzeOptimalStrategy(hand);
      expect(analysis.optimalHolds).toEqual([true, true, true, true, true]);
      expect(analysis.explanation).toContain('Keep the entire Straight Flush');
    });

    test('should keep four of a kind', () => {
      const hand = [
        createCard(Rank.NINE, Suit.HEARTS),
        createCard(Rank.NINE, Suit.DIAMONDS),
        createCard(Rank.NINE, Suit.CLUBS),
        createCard(Rank.NINE, Suit.SPADES),
        createCard(Rank.KING, Suit.HEARTS)
      ];
      
      const analysis = analyzeOptimalStrategy(hand);
      expect(analysis.optimalHolds).toEqual([true, true, true, true, true]);
      expect(analysis.explanation).toContain('Keep the entire Four of a Kind');
    });

    test('should keep full house', () => {
      const hand = [
        createCard(Rank.JACK, Suit.HEARTS),
        createCard(Rank.JACK, Suit.DIAMONDS),
        createCard(Rank.JACK, Suit.CLUBS),
        createCard(Rank.SEVEN, Suit.SPADES),
        createCard(Rank.SEVEN, Suit.HEARTS)
      ];
      
      const analysis = analyzeOptimalStrategy(hand);
      expect(analysis.optimalHolds).toEqual([true, true, true, true, true]);
      expect(analysis.explanation).toContain('Keep the entire Full House');
    });

    test('should keep flush', () => {
      const hand = [
        createCard(Rank.TWO, Suit.CLUBS),
        createCard(Rank.FIVE, Suit.CLUBS),
        createCard(Rank.EIGHT, Suit.CLUBS),
        createCard(Rank.JACK, Suit.CLUBS),
        createCard(Rank.ACE, Suit.CLUBS)
      ];
      
      const analysis = analyzeOptimalStrategy(hand);
      expect(analysis.optimalHolds).toEqual([true, true, true, true, true]);
      expect(analysis.explanation).toContain('Keep the entire Flush');
    });

    test('should keep straight', () => {
      const hand = [
        createCard(Rank.FOUR, Suit.HEARTS),
        createCard(Rank.FIVE, Suit.DIAMONDS),
        createCard(Rank.SIX, Suit.CLUBS),
        createCard(Rank.SEVEN, Suit.SPADES),
        createCard(Rank.EIGHT, Suit.HEARTS)
      ];
      
      const analysis = analyzeOptimalStrategy(hand);
      expect(analysis.optimalHolds).toEqual([true, true, true, true, true]);
      expect(analysis.explanation).toContain('Keep the entire Straight');
    });

    test('should keep ace-low straight', () => {
      const hand = [
        createCard(Rank.ACE, Suit.HEARTS),
        createCard(Rank.TWO, Suit.DIAMONDS),
        createCard(Rank.THREE, Suit.CLUBS),
        createCard(Rank.FOUR, Suit.SPADES),
        createCard(Rank.FIVE, Suit.HEARTS)
      ];
      
      const analysis = analyzeOptimalStrategy(hand);
      expect(analysis.optimalHolds).toEqual([true, true, true, true, true]);
      expect(analysis.explanation).toContain('Keep the entire Straight');
    });
  });

  // === FOUR TO ROYAL FLUSH TESTS ===
  describe('Four to Royal Flush', () => {
    test('should keep four to royal flush (missing 10)', () => {
      const hand = [
        createCard(Rank.JACK, Suit.SPADES),
        createCard(Rank.QUEEN, Suit.SPADES),
        createCard(Rank.KING, Suit.SPADES),
        createCard(Rank.ACE, Suit.SPADES),
        createCard(Rank.THREE, Suit.HEARTS)
      ];
      
      const analysis = analyzeOptimalStrategy(hand);
      expect(analysis.optimalHolds).toEqual([true, true, true, true, false]);
      expect(analysis.explanation).toContain('Keep four cards to a royal flush');
    });

    test('should keep four to royal flush (missing Jack)', () => {
      const hand = [
        createCard(Rank.TEN, Suit.DIAMONDS),
        createCard(Rank.QUEEN, Suit.DIAMONDS),
        createCard(Rank.KING, Suit.DIAMONDS),
        createCard(Rank.ACE, Suit.DIAMONDS),
        createCard(Rank.SEVEN, Suit.CLUBS)
      ];
      
      const analysis = analyzeOptimalStrategy(hand);
      expect(analysis.optimalHolds).toEqual([true, true, true, true, false]);
      expect(analysis.explanation).toContain('Keep four cards to a royal flush');
    });

    test('should prioritize four to royal over three of a kind', () => {
      const hand = [
        createCard(Rank.TEN, Suit.HEARTS),
        createCard(Rank.JACK, Suit.HEARTS),
        createCard(Rank.QUEEN, Suit.HEARTS),
        createCard(Rank.KING, Suit.HEARTS),
        createCard(Rank.TEN, Suit.CLUBS)
      ];
      
      const analysis = analyzeOptimalStrategy(hand);
      expect(analysis.optimalHolds).toEqual([true, true, true, true, false]);
      expect(analysis.explanation).toContain('Keep four cards to a royal flush');
    });
  });

  // === THREE OF A KIND TESTS ===
  describe('Three of a Kind', () => {
    test('should keep three aces', () => {
      const hand = [
        createCard(Rank.ACE, Suit.HEARTS),
        createCard(Rank.ACE, Suit.DIAMONDS),
        createCard(Rank.ACE, Suit.CLUBS),
        createCard(Rank.FIVE, Suit.SPADES),
        createCard(Rank.NINE, Suit.HEARTS)
      ];
      
      const analysis = analyzeOptimalStrategy(hand);
      expect(analysis.optimalHolds).toEqual([true, true, true, false, false]);
      expect(analysis.explanation).toContain('Keep three As');
    });

    test('should keep three twos', () => {
      const hand = [
        createCard(Rank.TWO, Suit.HEARTS),
        createCard(Rank.TWO, Suit.DIAMONDS),
        createCard(Rank.TWO, Suit.CLUBS),
        createCard(Rank.KING, Suit.SPADES),
        createCard(Rank.QUEEN, Suit.HEARTS)
      ];
      
      const analysis = analyzeOptimalStrategy(hand);
      expect(analysis.optimalHolds).toEqual([true, true, true, false, false]);
      expect(analysis.explanation).toContain('Keep three 2s');
    });
  });

  // === PAIR TESTS ===
  describe('Pairs', () => {
    test('should keep pair of queens', () => {
      const hand = [
        createCard(Rank.QUEEN, Suit.HEARTS),
        createCard(Rank.QUEEN, Suit.DIAMONDS),
        createCard(Rank.FOUR, Suit.CLUBS),
        createCard(Rank.EIGHT, Suit.SPADES),
        createCard(Rank.TEN, Suit.HEARTS)
      ];
      
      const analysis = analyzeOptimalStrategy(hand);
      expect(analysis.optimalHolds).toEqual([true, true, false, false, false]);
      expect(analysis.explanation).toContain('Keep pair of Qs');
    });

    test('should keep pair of aces', () => {
      const hand = [
        createCard(Rank.ACE, Suit.HEARTS),
        createCard(Rank.ACE, Suit.DIAMONDS),
        createCard(Rank.THREE, Suit.CLUBS),
        createCard(Rank.SEVEN, Suit.SPADES),
        createCard(Rank.NINE, Suit.HEARTS)
      ];
      
      const analysis = analyzeOptimalStrategy(hand);
      expect(analysis.optimalHolds).toEqual([true, true, false, false, false]);
      expect(analysis.explanation).toContain('Keep pair of As');
    });

    test('should keep low pair of threes', () => {
      const hand = [
        createCard(Rank.THREE, Suit.HEARTS),
        createCard(Rank.THREE, Suit.DIAMONDS),
        createCard(Rank.SEVEN, Suit.CLUBS),
        createCard(Rank.NINE, Suit.SPADES),
        createCard(Rank.KING, Suit.HEARTS)
      ];
      
      const analysis = analyzeOptimalStrategy(hand);
      expect(analysis.optimalHolds).toEqual([true, true, false, false, false]);
      expect(analysis.explanation).toContain('Keep pair of 3s');
    });

    test('should keep low pair of tens', () => {
      const hand = [
        createCard(Rank.TEN, Suit.HEARTS),
        createCard(Rank.TEN, Suit.DIAMONDS),
        createCard(Rank.FOUR, Suit.CLUBS),
        createCard(Rank.SIX, Suit.SPADES),
        createCard(Rank.EIGHT, Suit.HEARTS)
      ];
      
      const analysis = analyzeOptimalStrategy(hand);
      expect(analysis.optimalHolds).toEqual([true, true, false, false, false]);
      expect(analysis.explanation).toContain('Keep pair of 10s');
    });
  });

  // === DRAWING HANDS TESTS ===
  describe('Drawing Hands', () => {
    test('should keep four to flush over low pair', () => {
      const hand = [
        createCard(Rank.THREE, Suit.SPADES),
        createCard(Rank.SEVEN, Suit.SPADES),
        createCard(Rank.NINE, Suit.SPADES),
        createCard(Rank.JACK, Suit.SPADES),
        createCard(Rank.THREE, Suit.HEARTS)
      ];
      
      const analysis = analyzeOptimalStrategy(hand);
      expect(analysis.optimalHolds).toEqual([true, true, true, true, false]);
      expect(analysis.explanation).toContain('Keep four cards to a flush');
    });

    test('should keep four to outside straight', () => {
      const hand = [
        createCard(Rank.FIVE, Suit.HEARTS),
        createCard(Rank.SIX, Suit.DIAMONDS),
        createCard(Rank.SEVEN, Suit.CLUBS),
        createCard(Rank.EIGHT, Suit.SPADES),
        createCard(Rank.KING, Suit.HEARTS)
      ];
      
      const analysis = analyzeOptimalStrategy(hand);
      expect(analysis.optimalHolds).toEqual([true, true, true, true, false]);
      expect(analysis.explanation).toContain('Keep four cards to an outside straight');
    });

    test('should prefer low pair over four to inside straight', () => {
      const hand = [
        createCard(Rank.FIVE, Suit.HEARTS),
        createCard(Rank.FIVE, Suit.DIAMONDS),
        createCard(Rank.SEVEN, Suit.CLUBS),
        createCard(Rank.EIGHT, Suit.SPADES),
        createCard(Rank.NINE, Suit.HEARTS)
      ];
      
      const analysis = analyzeOptimalStrategy(hand);
      expect(analysis.optimalHolds).toEqual([true, true, false, false, false]);
      expect(analysis.explanation).toContain('Keep pair of 5s');
    });

    test('should keep three to royal flush', () => {
      const hand = [
        createCard(Rank.JACK, Suit.CLUBS),
        createCard(Rank.QUEEN, Suit.CLUBS),
        createCard(Rank.KING, Suit.CLUBS),
        createCard(Rank.FOUR, Suit.HEARTS),
        createCard(Rank.EIGHT, Suit.SPADES)
      ];
      
      const analysis = analyzeOptimalStrategy(hand);
      expect(analysis.optimalHolds).toEqual([true, true, true, false, false]);
      expect(analysis.explanation).toContain('Keep three cards to a royal flush');
    });

    test('should keep three to straight flush', () => {
      const hand = [
        createCard(Rank.FOUR, Suit.DIAMONDS),
        createCard(Rank.FIVE, Suit.DIAMONDS),
        createCard(Rank.SIX, Suit.DIAMONDS),
        createCard(Rank.JACK, Suit.HEARTS),
        createCard(Rank.KING, Suit.SPADES)
      ];
      
      const analysis = analyzeOptimalStrategy(hand);
      expect(analysis.optimalHolds).toEqual([true, true, true, false, false]);
      expect(analysis.explanation).toContain('Keep three cards to a straight flush');
    });
  });

  // === HIGH CARD TESTS ===
  describe('High Cards', () => {
    test('should keep ace-king suited', () => {
      const hand = [
        createCard(Rank.ACE, Suit.HEARTS),
        createCard(Rank.KING, Suit.HEARTS),
        createCard(Rank.FOUR, Suit.CLUBS),
        createCard(Rank.SEVEN, Suit.SPADES),
        createCard(Rank.NINE, Suit.DIAMONDS)
      ];
      
      const analysis = analyzeOptimalStrategy(hand);
      expect(analysis.optimalHolds).toEqual([true, true, false, false, false]);
      expect(analysis.explanation).toContain('Keep two suited high cards');
    });

    test('should keep ace-queen suited', () => {
      const hand = [
        createCard(Rank.ACE, Suit.SPADES),
        createCard(Rank.QUEEN, Suit.SPADES),
        createCard(Rank.THREE, Suit.CLUBS),
        createCard(Rank.SIX, Suit.HEARTS),
        createCard(Rank.EIGHT, Suit.DIAMONDS)
      ];
      
      const analysis = analyzeOptimalStrategy(hand);
      expect(analysis.optimalHolds).toEqual([true, true, false, false, false]);
      expect(analysis.explanation).toContain('Keep two suited high cards');
    });

    test('should keep king-queen suited', () => {
      const hand = [
        createCard(Rank.KING, Suit.DIAMONDS),
        createCard(Rank.QUEEN, Suit.DIAMONDS),
        createCard(Rank.TWO, Suit.CLUBS),
        createCard(Rank.FIVE, Suit.HEARTS),
        createCard(Rank.NINE, Suit.SPADES)
      ];
      
      const analysis = analyzeOptimalStrategy(hand);
      expect(analysis.optimalHolds).toEqual([true, true, false, false, false]);
      expect(analysis.explanation).toContain('Keep two suited high cards');
    });

    test('should keep ace-king unsuited', () => {
      const hand = [
        createCard(Rank.ACE, Suit.HEARTS),
        createCard(Rank.KING, Suit.DIAMONDS),
        createCard(Rank.FOUR, Suit.CLUBS),
        createCard(Rank.SEVEN, Suit.SPADES),
        createCard(Rank.NINE, Suit.HEARTS)
      ];
      
      const analysis = analyzeOptimalStrategy(hand);
      expect(analysis.optimalHolds).toEqual([true, true, false, false, false]);
      expect(analysis.explanation).toContain('Keep Ace and King');
    });

    test('should keep suited ten-jack', () => {
      const hand = [
        createCard(Rank.TEN, Suit.CLUBS),
        createCard(Rank.JACK, Suit.CLUBS),
        createCard(Rank.THREE, Suit.HEARTS),
        createCard(Rank.SIX, Suit.SPADES),
        createCard(Rank.EIGHT, Suit.DIAMONDS)
      ];
      
      const analysis = analyzeOptimalStrategy(hand);
      expect(analysis.optimalHolds).toEqual([true, true, false, false, false]);
      expect(analysis.explanation).toContain('Keep suited 10 and J');
    });

    test('should keep suited ten-queen', () => {
      const hand = [
        createCard(Rank.TEN, Suit.HEARTS),
        createCard(Rank.QUEEN, Suit.HEARTS),
        createCard(Rank.FOUR, Suit.CLUBS),
        createCard(Rank.SEVEN, Suit.SPADES),
        createCard(Rank.NINE, Suit.DIAMONDS)
      ];
      
      const analysis = analyzeOptimalStrategy(hand);
      expect(analysis.optimalHolds).toEqual([true, true, false, false, false]);
      expect(analysis.explanation).toContain('Keep suited 10 and Q');
    });

    test('should keep suited ten-king', () => {
      const hand = [
        createCard(Rank.TEN, Suit.SPADES),
        createCard(Rank.KING, Suit.SPADES),
        createCard(Rank.TWO, Suit.HEARTS),
        createCard(Rank.FIVE, Suit.CLUBS),
        createCard(Rank.EIGHT, Suit.DIAMONDS)
      ];
      
      const analysis = analyzeOptimalStrategy(hand);
      expect(analysis.optimalHolds).toEqual([true, true, false, false, false]);
      expect(analysis.explanation).toContain('Keep suited 10 and K');
    });

    test('should prefer ace over king when single high card', () => {
      const hand = [
        createCard(Rank.ACE, Suit.HEARTS),
        createCard(Rank.KING, Suit.DIAMONDS),
        createCard(Rank.FOUR, Suit.CLUBS),
        createCard(Rank.SEVEN, Suit.SPADES),
        createCard(Rank.NINE, Suit.HEARTS)
      ];
      
      const analysis = analyzeOptimalStrategy(hand);
      expect(analysis.optimalHolds).toEqual([true, true, false, false, false]);
      expect(analysis.explanation).toContain('Keep Ace and King');
    });

    test('should keep single ace when no pairs', () => {
      const hand = [
        createCard(Rank.ACE, Suit.HEARTS),
        createCard(Rank.FOUR, Suit.DIAMONDS),
        createCard(Rank.SIX, Suit.CLUBS),
        createCard(Rank.EIGHT, Suit.SPADES),
        createCard(Rank.TEN, Suit.HEARTS)
      ];
      
      const analysis = analyzeOptimalStrategy(hand);
      expect(analysis.optimalHolds).toEqual([true, false, false, false, false]);
      expect(analysis.explanation).toContain('Keep A');
    });

    test('should keep single king when no ace', () => {
      const hand = [
        createCard(Rank.KING, Suit.HEARTS),
        createCard(Rank.FOUR, Suit.DIAMONDS),
        createCard(Rank.SIX, Suit.CLUBS),
        createCard(Rank.EIGHT, Suit.SPADES),
        createCard(Rank.NINE, Suit.HEARTS)
      ];
      
      const analysis = analyzeOptimalStrategy(hand);
      expect(analysis.optimalHolds).toEqual([true, false, false, false, false]);
      expect(analysis.explanation).toContain('Keep K');
    });

    test('should keep single queen when no ace or king', () => {
      const hand = [
        createCard(Rank.QUEEN, Suit.HEARTS),
        createCard(Rank.FOUR, Suit.DIAMONDS),
        createCard(Rank.SIX, Suit.CLUBS),
        createCard(Rank.EIGHT, Suit.SPADES),
        createCard(Rank.NINE, Suit.HEARTS)
      ];
      
      const analysis = analyzeOptimalStrategy(hand);
      expect(analysis.optimalHolds).toEqual([true, false, false, false, false]);
      expect(analysis.explanation).toContain('Keep Q');
    });

    test('should keep single jack when no other high cards', () => {
      const hand = [
        createCard(Rank.JACK, Suit.HEARTS),
        createCard(Rank.FOUR, Suit.DIAMONDS),
        createCard(Rank.SIX, Suit.CLUBS),
        createCard(Rank.EIGHT, Suit.SPADES),
        createCard(Rank.NINE, Suit.HEARTS)
      ];
      
      const analysis = analyzeOptimalStrategy(hand);
      expect(analysis.optimalHolds).toEqual([true, false, false, false, false]);
      expect(analysis.explanation).toContain('Keep J');
    });
  });

  // === EDGE CASES AND PRIORITY TESTS ===
  describe('Edge Cases and Priorities', () => {
    test('should prioritize three to royal flush over pair of jacks', () => {
      const hand = [
        createCard(Rank.JACK, Suit.HEARTS),
        createCard(Rank.JACK, Suit.DIAMONDS),
        createCard(Rank.QUEEN, Suit.HEARTS),
        createCard(Rank.KING, Suit.HEARTS),
        createCard(Rank.ACE, Suit.HEARTS)
      ];
      
      const analysis = analyzeOptimalStrategy(hand);
      // This hand has FOUR to a royal flush which beats everything else
      expect(analysis.optimalHolds).toEqual([true, false, true, true, true]);
      expect(analysis.explanation).toContain('Keep four cards to a royal flush');
    });

    test('should prioritize four to royal over made flush', () => {
      const hand = [
        createCard(Rank.TEN, Suit.SPADES),
        createCard(Rank.JACK, Suit.SPADES),
        createCard(Rank.QUEEN, Suit.SPADES),
        createCard(Rank.KING, Suit.SPADES),
        createCard(Rank.TWO, Suit.SPADES)
      ];
      
      const analysis = analyzeOptimalStrategy(hand);
      // This is actually a made flush, which should be kept
      expect(analysis.optimalHolds).toEqual([true, true, true, true, true]);
      expect(analysis.explanation).toContain('Keep the entire Flush');
    });

    test('should prioritize pair of eights when no straight possible', () => {
      const hand = [
        createCard(Rank.FIVE, Suit.HEARTS),
        createCard(Rank.SIX, Suit.DIAMONDS),
        createCard(Rank.SEVEN, Suit.CLUBS),
        createCard(Rank.EIGHT, Suit.SPADES),
        createCard(Rank.EIGHT, Suit.HEARTS)
      ];
      
      const analysis = analyzeOptimalStrategy(hand);
      // This hand has a pair of 8s, not a straight (since there are two 8s)
      expect(analysis.optimalHolds).toEqual([false, false, false, true, true]);
      expect(analysis.explanation).toContain('Keep pair of 8s');
    });

    test('should prioritize two pair over high pair', () => {
      const hand = [
        createCard(Rank.ACE, Suit.HEARTS),
        createCard(Rank.ACE, Suit.DIAMONDS),
        createCard(Rank.THREE, Suit.CLUBS),
        createCard(Rank.THREE, Suit.SPADES),
        createCard(Rank.KING, Suit.HEARTS)
      ];
      
      const analysis = analyzeOptimalStrategy(hand);
      expect(analysis.optimalHolds).toEqual([true, true, true, true, false]);
      expect(analysis.explanation).toContain('Keep both pairs');
    });

    test('should prioritize low pair over single high card', () => {
      const hand = [
        createCard(Rank.FOUR, Suit.HEARTS),
        createCard(Rank.FOUR, Suit.DIAMONDS),
        createCard(Rank.SEVEN, Suit.CLUBS),
        createCard(Rank.NINE, Suit.SPADES),
        createCard(Rank.ACE, Suit.HEARTS)
      ];
      
      const analysis = analyzeOptimalStrategy(hand);
      expect(analysis.optimalHolds).toEqual([true, true, false, false, false]);
      expect(analysis.explanation).toContain('Keep pair of 4s');
    });

    test('should prioritize suited high cards over unsuited', () => {
      const hand = [
        createCard(Rank.JACK, Suit.HEARTS),
        createCard(Rank.QUEEN, Suit.HEARTS),
        createCard(Rank.KING, Suit.DIAMONDS),
        createCard(Rank.FOUR, Suit.CLUBS),
        createCard(Rank.SEVEN, Suit.SPADES)
      ];
      
      const analysis = analyzeOptimalStrategy(hand);
      expect(analysis.optimalHolds).toEqual([true, true, false, false, false]);
      expect(analysis.explanation).toContain('Keep two suited high cards');
    });

    test('should prioritize made straight over three to straight flush', () => {
      const hand = [
        createCard(Rank.NINE, Suit.HEARTS),
        createCard(Rank.TEN, Suit.HEARTS),
        createCard(Rank.JACK, Suit.HEARTS),
        createCard(Rank.QUEEN, Suit.CLUBS),
        createCard(Rank.KING, Suit.SPADES)
      ];
      
      const analysis = analyzeOptimalStrategy(hand);
      // This is a made straight which should be kept over any draws
      expect(analysis.optimalHolds).toEqual([true, true, true, true, true]);
      expect(analysis.explanation).toContain('Keep the entire Straight');
    });
  });

  // === SPECIAL COMBINATIONS ===
  describe('Special Combinations', () => {
    test('should handle broadway cards correctly', () => {
      const hand = [
        createCard(Rank.TEN, Suit.HEARTS),
        createCard(Rank.JACK, Suit.DIAMONDS),
        createCard(Rank.QUEEN, Suit.CLUBS),
        createCard(Rank.KING, Suit.SPADES),
        createCard(Rank.ACE, Suit.HEARTS)
      ];
      
      const analysis = analyzeOptimalStrategy(hand);
      expect(analysis.optimalHolds).toEqual([true, true, true, true, true]);
      expect(analysis.explanation).toContain('Keep the entire Straight');
    });

    test('should handle wheel straight correctly', () => {
      const hand = [
        createCard(Rank.ACE, Suit.HEARTS),
        createCard(Rank.TWO, Suit.DIAMONDS),
        createCard(Rank.THREE, Suit.CLUBS),
        createCard(Rank.FOUR, Suit.SPADES),
        createCard(Rank.FIVE, Suit.HEARTS)
      ];
      
      const analysis = analyzeOptimalStrategy(hand);
      expect(analysis.optimalHolds).toEqual([true, true, true, true, true]);
      expect(analysis.explanation).toContain('Keep the entire Straight');
    });

    test('should prefer three to royal over three to straight flush', () => {
      const hand = [
        createCard(Rank.JACK, Suit.HEARTS),
        createCard(Rank.QUEEN, Suit.HEARTS),
        createCard(Rank.KING, Suit.HEARTS),
        createCard(Rank.FOUR, Suit.CLUBS),
        createCard(Rank.SEVEN, Suit.SPADES)
      ];
      
      const analysis = analyzeOptimalStrategy(hand);
      expect(analysis.optimalHolds).toEqual([true, true, true, false, false]);
      expect(analysis.explanation).toContain('Keep three cards to a royal flush');
    });
  });

});