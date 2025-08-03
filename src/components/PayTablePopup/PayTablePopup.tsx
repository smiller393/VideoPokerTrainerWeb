import React from 'react';
import { PayTable } from '../PayTable/PayTable';
import { HandType } from '@/game/types';
import './PayTablePopup.css';

interface PayTablePopupProps {
  isOpen: boolean;
  onClose: () => void;
  currentBet: number;
  lastHandType?: string;
}

export const PayTablePopup: React.FC<PayTablePopupProps> = ({
  isOpen,
  onClose,
  currentBet,
  lastHandType
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="pay-table-overlay" onClick={handleOverlayClick}>
      <div className="pay-table-popup">
        <div className="pay-table-header">
          <h2>Pay Table - Jacks or Better (9-6)</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="pay-table-content">
          <PayTable currentBet={currentBet} lastHandType={lastHandType as HandType} />
        </div>
      </div>
    </div>
  );
};