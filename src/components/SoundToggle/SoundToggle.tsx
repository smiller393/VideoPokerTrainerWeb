import React, { useState } from 'react';
import { useSounds } from '@/hooks/useSounds';
import './SoundToggle.css';

export const SoundToggle: React.FC = () => {
  const { toggleSound, isSoundEnabled } = useSounds();
  const [soundEnabled, setSoundEnabled] = useState(isSoundEnabled());

  const handleSoundToggle = () => {
    const newState = toggleSound();
    setSoundEnabled(newState);
  };

  return (
    <button
      className={`sound-toggle ${soundEnabled ? 'active' : ''}`}
      onClick={handleSoundToggle}
      title={soundEnabled ? 'Disable sound effects' : 'Enable sound effects'}
      aria-label={soundEnabled ? 'Disable sound effects' : 'Enable sound effects'}
    >
      {soundEnabled ? '🔊' : '🔇'}
    </button>
  );
};