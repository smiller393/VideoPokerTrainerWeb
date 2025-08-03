import { create } from 'zustand';
import { GameState } from '@/game/types';
import { 
  createInitialGameState, 
  dealNewHand, 
  toggleHold, 
  drawCards, 
  setBet, 
  resetGame 
} from '@/game/engine';

interface GameStore extends GameState {
  deal: () => void;
  hold: (cardIndex: number) => void;
  draw: () => void;
  changeBet: (bet: number) => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  ...createInitialGameState(),
  
  deal: () => set((state) => dealNewHand(state)),
  
  hold: (cardIndex: number) => set((state) => toggleHold(state, cardIndex)),
  
  draw: () => set((state) => drawCards(state)),
  
  changeBet: (bet: number) => set((state) => setBet(state, bet)),
  
  reset: () => set((state) => resetGame(state))
}));