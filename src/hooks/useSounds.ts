import { useCallback } from 'react';
import { soundService } from '@/services/soundService';

export const useSounds = () => {
  const playWinSound = useCallback(() => {
    soundService.playWinSound();
  }, []);

  const playCorrectSound = useCallback(() => {
    soundService.playCorrectSound();
  }, []);

  const playIncorrectSound = useCallback(() => {
    soundService.playIncorrectSound();
  }, []);

  const playCardSound = useCallback(() => {
    soundService.playCardSound();
  }, []);

  const toggleSound = useCallback(() => {
    const currentState = soundService.isEnabled();
    soundService.setEnabled(!currentState);
    return !currentState;
  }, []);

  const isSoundEnabled = useCallback(() => {
    return soundService.isEnabled();
  }, []);

  return {
    playWinSound,
    playCorrectSound,
    playIncorrectSound,
    playCardSound,
    toggleSound,
    isSoundEnabled
  };
};