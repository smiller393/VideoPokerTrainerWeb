import React from 'react';
import './MobileStatsBar.css';

interface MobileStatsBarProps {
  totalHands: number;
  correctDecisions: number;
  accuracy: number;
  credits: number;
  onReset: () => void;
}

export const MobileStatsBar: React.FC<MobileStatsBarProps> = ({
  totalHands,
  correctDecisions,
  accuracy,
  credits,
  onReset
}) => {
  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset your statistics? This cannot be undone.')) {
      onReset();
    }
  };
  return (
    <div className="mobile-stats-bar">
      <div className="mobile-credits">
        <span className="mobile-credits-value">🪙{credits.toLocaleString()}</span>
        <span className="mobile-credits-label">Credits</span>
      </div>
      
      <div className="mobile-stats-separator"></div>
      
      <div className="mobile-stats-group">
        <div className="mobile-stat">
          <span className="mobile-stat-value">{totalHands}</span>
          <span className="mobile-stat-label">Hands</span>
        </div>
        <div className="mobile-stat">
          <span className="mobile-stat-value">{correctDecisions}</span>
          <span className="mobile-stat-label">Correct</span>
        </div>
        <div className="mobile-stat">
          <span className="mobile-stat-value">{accuracy}%</span>
          <span className="mobile-stat-label">Accuracy</span>
        </div>
        {totalHands > 0 && (
          <button 
            className="mobile-stats-reset"
            onClick={handleReset}
            title="Reset all statistics"
            aria-label="Reset statistics"
          >
            ↻
          </button>
        )}
      </div>
    </div>
  );
};