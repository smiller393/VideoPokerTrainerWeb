import React from 'react';
import './LoadingIndicator.css';

interface LoadingIndicatorProps {
  message?: string;
  show: boolean;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ 
  message = 'Computing...', 
  show 
}) => {
  if (!show) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <div className="loading-spinner"></div>
        <div className="loading-message">{message}</div>
      </div>
    </div>
  );
};