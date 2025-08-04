import { useState, useEffect } from 'react';

interface Statistics {
  totalHands: number;
  correctDecisions: number;
  accuracy: number;
}

const STORAGE_KEY = 'vp-trainer-statistics';

export const useStatistics = () => {
  const [statistics, setStatistics] = useState<Statistics>(() => {
    // Initialize from localStorage if available
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
    return {
      totalHands: 0,
      correctDecisions: 0,
      accuracy: 0
    };
  });

  // Save statistics to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(statistics));
  }, [statistics]);

  const recordDecision = (wasCorrect: boolean) => {
    setStatistics(prev => {
      const newTotalHands = prev.totalHands + 1;
      const newCorrectDecisions = prev.correctDecisions + (wasCorrect ? 1 : 0);
      const newAccuracy = newTotalHands > 0 ? (newCorrectDecisions / newTotalHands) * 100 : 0;
      
      return {
        totalHands: newTotalHands,
        correctDecisions: newCorrectDecisions,
        accuracy: Number(newAccuracy.toFixed(1))
      };
    });
  };

  const resetStatistics = () => {
    setStatistics({
      totalHands: 0,
      correctDecisions: 0,
      accuracy: 0
    });
  };

  return {
    statistics,
    recordDecision,
    resetStatistics
  };
};