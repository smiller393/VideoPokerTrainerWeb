import React from 'react';
import { EVAnalysis, HoldCombination } from '@/game/evCalculator';
import './EVGrid.css';

interface EVGridProps {
  analysis: EVAnalysis | null;
  originalHand: any[];
  bet: number;
}

export const EVGrid: React.FC<EVGridProps> = ({ analysis, originalHand, bet }) => {
  if (!analysis || !originalHand || originalHand.length !== 5) {
    return null;
  }

  const isPlayerChoice = (combo: HoldCombination): boolean => {
    if (!analysis.playerChoice) return false;
    return combo.holds.every((hold, index) => hold === analysis.playerChoice!.holds[index]);
  };

  const isOptimalChoice = (combo: HoldCombination): boolean => {
    return combo.holds.every((hold, index) => hold === analysis.optimalChoice.holds[index]);
  };

  return (
    <div className="ev-grid">
      <div className="ev-grid-header">
        <h3>Expected Value Analysis</h3>
        <p>All possible plays ranked by expected value (bet: {bet} credit{bet !== 1 ? 's' : ''})</p>
        {analysis.playerRank && (
          <p className="player-rank">
            Your play ranked #{analysis.playerRank} out of 32 possible plays
          </p>
        )}
      </div>

      <div className="ev-grid-table">
        <div className="ev-grid-headers">
          <div className="rank-header">Rank</div>
          <div className="hand-header">Hold</div>
          <div className="ev-header">Expected Value</div>
        </div>

        <div className="ev-grid-body">
          {analysis.combinations.slice(0, 10).map((combo, index) => {
            const rank = index + 1;
            const isPlayer = isPlayerChoice(combo);
            const isOptimal = isOptimalChoice(combo);
            
            return (
              <div 
                key={combo.holds.join('')} 
                className={`ev-grid-row ${isPlayer ? 'player-choice' : ''} ${isOptimal ? 'optimal-choice' : ''}`}
              >
                <div className="rank-cell">
                  #{rank}
                  {isPlayer && <span className="player-indicator">👤</span>}
                  {isOptimal && <span className="optimal-indicator">⭐</span>}
                </div>
                
                <div className="hand-cell">
                  <div className="mini-cards">
                    {originalHand.map((card, cardIndex) => (
                      <div 
                        key={cardIndex}
                        className={`mini-card ${combo.holds[cardIndex] ? 'held' : 'discarded'}`}
                      >
                        <span className="mini-card-text">
                          {card.rank}
                          <span className="mini-card-suit">
                            {card.suit === 'hearts' ? '♥' : 
                             card.suit === 'diamonds' ? '♦' : 
                             card.suit === 'clubs' ? '♣' : '♠'}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="ev-cell">
                  {combo.expectedValue.toFixed(3)}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};