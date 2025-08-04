import React from 'react';
import './Statistics.css';

interface StatisticsProps {
  totalHands: number;
  correctDecisions: number;
  accuracy: number;
  onReset: () => void;
}

export const Statistics: React.FC<StatisticsProps> = ({
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
    <div className="statistics-panel">
      <h3>Your Statistics</h3>
      
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-value">{totalHands}</div>
          <div className="stat-label">Total Hands</div>
        </div>
        
        <div className="stat-item">
          <div className="stat-value">{correctDecisions}</div>
          <div className="stat-label">Correct</div>
        </div>
        
        <div className="stat-item">
          <div className="stat-value">{accuracy}%</div>
          <div className="stat-label">Accuracy</div>
        </div>
      </div>
      
      {totalHands > 0 && (
        <button 
          className="reset-button"
          onClick={handleReset}
          title="Reset all statistics"
        >
          Reset Stats
        </button>
      )}
    </div>
  );
};