import React, { useState } from 'react';
import { useSounds } from '@/hooks/useSounds';

interface ControlsProps {
  credits: number;
  bet: number;
  gamePhase: 'initial' | 'dealt' | 'drawn' | 'evaluated';
  onDeal: () => void;
  onDraw: () => void;
  onChangeBet: (bet: number) => void;
  mistakeMade?: boolean;
}

export const Controls: React.FC<ControlsProps> = ({
  credits,
  bet,
  gamePhase,
  onDeal,
  onDraw,
  onChangeBet,
  mistakeMade
}) => {
  const canDeal = gamePhase === 'initial' || gamePhase === 'drawn';
  const canDraw = gamePhase === 'dealt';
  const canChangeBet = gamePhase === 'initial' || gamePhase === 'drawn';
  
  const { toggleSound, isSoundEnabled } = useSounds();
  const [soundEnabled, setSoundEnabled] = useState(isSoundEnabled());

  const handleSoundToggle = () => {
    const newState = toggleSound();
    setSoundEnabled(newState);
  };

  const handleBetUp = () => {
    const nextBet = bet >= 5 ? 1 : bet + 1;
    onChangeBet(nextBet);
  };

  const handleMaxBet = () => {
    onChangeBet(5);
  };

  return (
    <div className="controls">
      <div className="credits-display">
        <div className="credits-label">🪙 CREDITS</div>
        <div className="credits-value">{credits.toLocaleString()}</div>
      </div>
      
      <div className="bet-controls">
        <div className="bet-display">
          <span className="bet-label">BET:</span>
          <span className="bet-value">{bet}</span>
        </div>
        <div className="bet-buttons">
          <button
            className="casino-button bet-up-button"
            onClick={handleBetUp}
            disabled={!canChangeBet}
            title="Increase bet"
          >
            BET UP
          </button>
          <button
            className="casino-button max-bet-button"
            onClick={handleMaxBet}
            disabled={!canChangeBet || credits < 5}
            title="Maximum bet (5 credits)"
          >
            MAX BET
          </button>
        </div>
      </div>
      
      <div className="game-controls">
        <button
          className="casino-button deal-button primary-action"
          onClick={onDeal}
          disabled={!canDeal || credits < bet}
        >
          {gamePhase === 'initial' ? '🎰 DEAL' : '🎰 NEW HAND'}
        </button>
        
        <button
          className="casino-button draw-button primary-action"
          onClick={onDraw}
          disabled={!canDraw}
        >
          🎯 DRAW CARDS
        </button>
      </div>
      
      <div className="sound-controls">
        <button
          className={`casino-button sound-button ${soundEnabled ? 'active' : ''}`}
          onClick={handleSoundToggle}
          title={soundEnabled ? 'Disable sound effects' : 'Enable sound effects'}
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>
      </div>
      
      {mistakeMade && gamePhase === 'drawn' && (
        <div className="mistake-indicator">
          ⚠️ Suboptimal play detected! Check the suggestion below.
        </div>
      )}
    </div>
  );
};