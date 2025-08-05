import React, { useState } from 'react';
import { EVAnalysis, HoldCombination } from '@/game/evCalculator';
import './EVGrid.css';

interface EVGridProps {
  analysis: EVAnalysis | null;
  originalHand: any[];
  bet: number;
}

const simulateHandPreview = (combo: HoldCombination, originalHand: any[]) => {
  // This is a simplified preview - in reality you'd want to show potential outcomes
  const heldCards = originalHand.filter((_, index) => combo.holds[index]);
  const discardCount = 5 - heldCards.length;
  return {
    heldCards,
    discardCount,
    description: discardCount === 0 ? 'Hold all cards' : 
                 discardCount === 5 ? 'Discard all cards' :
                 `Hold ${heldCards.length}, draw ${discardCount}`
  };
};

export const EVGrid: React.FC<EVGridProps> = ({ analysis, originalHand, bet }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

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
    <div className={`ev-grid ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="ev-grid-header" onClick={() => setIsCollapsed(!isCollapsed)}>
        <div className="ev-grid-title">
          <h3>Expected Value Analysis</h3>
          <button className="collapse-toggle" aria-label={isCollapsed ? 'Expand' : 'Collapse'}>
            {isCollapsed ? '▼' : '▲'}
          </button>
        </div>
        {!isCollapsed && (
          <>
            <p>All possible plays ranked by expected value (bet: {bet} credit{bet !== 1 ? 's' : ''})</p>
            {analysis.playerRank && (
              <p className="player-rank">
                Your play ranked #{analysis.playerRank} out of 32 possible plays
              </p>
            )}
          </>
        )}
      </div>

      {!isCollapsed && (
        <div className="ev-grid-table">
          <div className="ev-grid-headers">
            <div className="rank-header">Rank</div>
            <div className="hand-header">Cards to Hold</div>
            <div className="ev-header">Expected Value</div>
          </div>

          <div className="ev-grid-body">
            {analysis.combinations.slice(0, 10).map((combo, index) => {
              const rank = index + 1;
              const isPlayer = isPlayerChoice(combo);
              const isOptimal = isOptimalChoice(combo);
              const isSuboptimalPlayer = isPlayer && !isOptimal;
              
              const preview = simulateHandPreview(combo, originalHand);
              
              return (
                <div 
                  key={combo.holds.join('')} 
                  className={`ev-grid-row ${isOptimal ? 'optimal-choice' : ''} ${isPlayer ? 'player-choice' : ''} ${isSuboptimalPlayer ? 'suboptimal-player-choice' : ''} ${selectedRow === index ? 'selected' : ''}`}
                  onClick={() => setSelectedRow(selectedRow === index ? null : index)}
                  title={`Click to preview: ${preview.description}`}
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
                  
                  {selectedRow === index && (
                    <div className="row-preview">
                      <div className="preview-content">
                        <h4>Strategy Preview</h4>
                        <p><strong>Action:</strong> {preview.description}</p>
                        <p><strong>Expected Value:</strong> {combo.expectedValue.toFixed(3)} credits per hand</p>
                        <div className="preview-cards">
                          <strong>Cards to hold:</strong>
                          <div className="preview-mini-cards">
                            {combo.holds.map((hold, cardIndex) => 
                              hold && (
                                <span key={cardIndex} className="preview-card">
                                  {originalHand[cardIndex].rank}
                                  {originalHand[cardIndex].suit === 'hearts' ? '♥' : 
                                   originalHand[cardIndex].suit === 'diamonds' ? '♦' : 
                                   originalHand[cardIndex].suit === 'clubs' ? '♣' : '♠'}
                                </span>
                              )
                            )}
                            {combo.holds.filter(Boolean).length === 0 && (
                              <span className="preview-card-none">None</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};