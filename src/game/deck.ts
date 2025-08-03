import { Card, Suit, Rank } from './types';

export function createDeck(): Card[] {
  const deck: Card[] = [];
  const suits = Object.values(Suit);
  const ranks = Object.values(Rank);

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

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function dealHand(deck: Card[], count: number = 5): { hand: Card[], remainingDeck: Card[] } {
  const hand = deck.slice(0, count);
  const remainingDeck = deck.slice(count);
  return { hand, remainingDeck };
}

export function replaceCards(hand: Card[], heldCards: boolean[], deck: Card[]): { newHand: Card[], remainingDeck: Card[] } {
  const newHand = [...hand];
  let deckIndex = 0;
  
  for (let i = 0; i < heldCards.length; i++) {
    if (!heldCards[i]) {
      newHand[i] = deck[deckIndex];
      deckIndex++;
    }
  }
  
  return {
    newHand,
    remainingDeck: deck.slice(deckIndex)
  };
}