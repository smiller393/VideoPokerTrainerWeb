export enum Suit {
  HEARTS = 'hearts',
  DIAMONDS = 'diamonds',
  CLUBS = 'clubs',
  SPADES = 'spades'
}

export enum Rank {
  TWO = '2',
  THREE = '3',
  FOUR = '4',
  FIVE = '5',
  SIX = '6',
  SEVEN = '7',
  EIGHT = '8',
  NINE = '9',
  TEN = '10',
  JACK = 'J',
  QUEEN = 'Q',
  KING = 'K',
  ACE = 'A'
}

export interface Card {
  suit: Suit;
  rank: Rank;
  id: string;
}

export enum HandType {
  HIGH_CARD = 'high_card',
  PAIR = 'pair',
  TWO_PAIR = 'two_pair',
  THREE_OF_A_KIND = 'three_of_a_kind',
  STRAIGHT = 'straight',
  FLUSH = 'flush',
  FULL_HOUSE = 'full_house',
  FOUR_OF_A_KIND = 'four_of_a_kind',
  STRAIGHT_FLUSH = 'straight_flush',
  ROYAL_FLUSH = 'royal_flush',
  JACKS_OR_BETTER = 'jacks_or_better'
}

export interface HandResult {
  type: HandType;
  cards: Card[];
  rank: number;
  description: string;
}

export interface PayTable {
  [HandType.ROYAL_FLUSH]: number[];
  [HandType.STRAIGHT_FLUSH]: number[];
  [HandType.FOUR_OF_A_KIND]: number[];
  [HandType.FULL_HOUSE]: number[];
  [HandType.FLUSH]: number[];
  [HandType.STRAIGHT]: number[];
  [HandType.THREE_OF_A_KIND]: number[];
  [HandType.TWO_PAIR]: number[];
  [HandType.JACKS_OR_BETTER]: number[];
}

export interface GameState {
  deck: Card[];
  hand: Card[];
  heldCards: boolean[];
  credits: number;
  bet: number;
  gamePhase: 'initial' | 'dealt' | 'drawn' | 'evaluated';
  lastResult?: HandResult;
  optimalHolds?: boolean[];
  mistakeMade?: boolean;
  evAnalysis?: any; // Will import EVAnalysis from evCalculator
  isLoading?: boolean;
  loadingMessage?: string;
}

export interface StrategyAnalysis {
  optimalHolds: boolean[];
  expectedValue: number;
  handType: HandType;
  explanation: string;
}