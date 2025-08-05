import React from 'react';
import './FloatingStats.css';

interface FloatingStatsProps {
  totalHands: number;
  correctDecisions: number;
  accuracy: number;
  onReset: () => void;
}

export const FloatingStats: React.FC<FloatingStatsProps> = ({
  totalHands,
  correctDecisions,
  accuracy,
  onReset
}) => {
  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset your statistics? This cannot be undone.')) {
      onReset();
    }
  };
  return (
    <div className="floating-stats">
      <div className="floating-stat">
        <span className="floating-stat-value">{totalHands}</span>
        <span className="floating-stat-label">Hands</span>
      </div>
      <div className="floating-stat">
        <span className="floating-stat-value">{correctDecisions}</span>
        <span className="floating-stat-label">Correct</span>
      </div>
      <div className="floating-stat">
        <span className="floating-stat-value">{accuracy}%</span>
        <span className="floating-stat-label">Accuracy</span>
      </div>
      {totalHands > 0 && (
        <button 
          className="floating-stats-reset"
          onClick={handleReset}
          title="Reset all statistics"
          aria-label="Reset statistics"
        >
          ↻
        </button>
      )}
    </div>
  );
};