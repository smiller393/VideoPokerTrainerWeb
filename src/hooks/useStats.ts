import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Stats {
  handsPlayed: number;
  optimalPlays: number;
  mistakes: number;
  totalCreditsWon: number;
  totalCreditsLost: number;
}

interface StatsStore extends Stats {
  recordHand: (optimal: boolean, creditsChange: number) => void;
  getAccuracy: () => number;
  getNetCredits: () => number;
  resetStats: () => void;
}

const initialStats: Stats = {
  handsPlayed: 0,
  optimalPlays: 0,
  mistakes: 0,
  totalCreditsWon: 0,
  totalCreditsLost: 0
};

export const useStats = create<StatsStore>()(
  persist(
    (set, get) => ({
      ...initialStats,
      
      recordHand: (optimal: boolean, creditsChange: number) => {
        set((state) => ({
          handsPlayed: state.handsPlayed + 1,
          optimalPlays: optimal ? state.optimalPlays + 1 : state.optimalPlays,
          mistakes: optimal ? state.mistakes : state.mistakes + 1,
          totalCreditsWon: creditsChange > 0 ? state.totalCreditsWon + creditsChange : state.totalCreditsWon,
          totalCreditsLost: creditsChange < 0 ? state.totalCreditsLost + Math.abs(creditsChange) : state.totalCreditsLost
        }));
      },
      
      getAccuracy: () => {
        const state = get();
        return state.handsPlayed > 0 ? (state.optimalPlays / state.handsPlayed) * 100 : 0;
      },
      
      getNetCredits: () => {
        const state = get();
        return state.totalCreditsWon - state.totalCreditsLost;
      },
      
      resetStats: () => set(initialStats)
    }),
    {
      name: 'vp-trainer-stats'
    }
  )
);