import React from 'react';
import { Card as CardType, Suit } from '@/game/types';

interface CardProps {
  card?: CardType;
  isHeld?: boolean;
  onToggleHold?: () => void;
  disabled?: boolean;
  showBack?: boolean;
  showStrategy?: boolean;
  shouldHold?: boolean;
  playerHeld?: boolean;
  highlightWinning?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  card, 
  isHeld = false, 
  onToggleHold, 
  disabled = false,
  showBack = false,
  showStrategy = false,
  shouldHold = false,
  playerHeld = false,
  highlightWinning = false
}) => {
  const getSuitSymbol = (suit: Suit): string => {
    switch (suit) {
      case Suit.HEARTS: return '♥';
      case Suit.DIAMONDS: return '♦';
      case Suit.CLUBS: return '♣';
      case Suit.SPADES: return '♠';
      default: return '';
    }
  };

  const getSuitColor = (suit: Suit): string => {
    return suit === Suit.HEARTS || suit === Suit.DIAMONDS ? 'red-suit' : 'black-suit';
  };

  if (showBack || !card) {
    return (
      <div className="card-container">
        <div className="card card-back">
          <div className="card-pattern"></div>
        </div>
        {isHeld && <div className="held-indicator">HELD</div>}
      </div>
    );
  }

  return (
    <div className="card-container">
      <button
        className={`card card-front ${isHeld ? 'held' : ''} ${disabled ? 'disabled' : ''} ${highlightWinning ? 'winning-highlight' : ''}`}
        onClick={onToggleHold}
        disabled={disabled}
        aria-label={`${card.rank} of ${card.suit}${isHeld ? ' (held)' : ''}`}
      >
        <div className="card-content">
          <div className={`card-corner top-left ${getSuitColor(card.suit)}`}>
            <div className="rank">{card.rank}</div>
            <div className="suit">{getSuitSymbol(card.suit)}</div>
          </div>
          <div className={`card-center ${getSuitColor(card.suit)}`}>
            <div className="suit-large">{getSuitSymbol(card.suit)}</div>
          </div>
        </div>
      </button>
      {isHeld && <div className="held-indicator">HELD</div>}
      
      {showStrategy && (
        <div className="strategy-indicator">
          {shouldHold === playerHeld ? (
            <div className="strategy-correct">✅ Correct</div>
          ) : shouldHold ? (
            <div className="strategy-should-hold">❌ Should HOLD</div>
          ) : (
            <div className="strategy-should-discard">❌ Should DISCARD</div>
          )}
        </div>
      )}
    </div>
  );
};