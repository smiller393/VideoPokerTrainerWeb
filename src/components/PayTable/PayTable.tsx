import React from 'react';
import { HandType } from '@/game/types';
import { JACKS_OR_BETTER_9_6 } from '@/game/payTables';

interface PayTableProps {
  currentBet: number;
  lastHandType?: HandType;
}

export const PayTable: React.FC<PayTableProps> = ({ currentBet, lastHandType }) => {
  const payTable = JACKS_OR_BETTER_9_6;
  
  const handTypes = [
    { type: HandType.ROYAL_FLUSH, label: 'Royal Flush' },
    { type: HandType.STRAIGHT_FLUSH, label: 'Straight Flush' },
    { type: HandType.FOUR_OF_A_KIND, label: 'Four of a Kind' },
    { type: HandType.FULL_HOUSE, label: 'Full House' },
    { type: HandType.FLUSH, label: 'Flush' },
    { type: HandType.STRAIGHT, label: 'Straight' },
    { type: HandType.THREE_OF_A_KIND, label: 'Three of a Kind' },
    { type: HandType.TWO_PAIR, label: 'Two Pair' },
    { type: HandType.JACKS_OR_BETTER, label: 'Jacks or Better' }
  ];

  return (
    <div className="pay-table">
      <h3 className="pay-table-title">Jacks or Better (9/6)</h3>
      <div className="pay-table-grid">
        <div className="pay-table-header">
          <div>Hand</div>
          <div>1</div>
          <div>2</div>
          <div>3</div>
          <div>4</div>
          <div>5</div>
        </div>
        {handTypes.map(({ type, label }) => (
          <div 
            key={type} 
            className={`pay-table-row ${lastHandType === type ? 'highlighted' : ''}`}
          >
            <div className="hand-name">{label}</div>
            {payTable[type as keyof typeof payTable].map((payout: number, index: number) => (
              <div 
                key={index} 
                className={`payout ${index === currentBet - 1 ? 'current-bet' : ''}`}
              >
                {payout}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};