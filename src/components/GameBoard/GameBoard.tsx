import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/Card/Card';
import { PayTablePopup } from '@/components/PayTablePopup/PayTablePopup';
import { Controls } from '@/components/Controls/Controls';
import { EVGrid } from '@/components/EVGrid/EVGrid';
import { useGameStore } from '@/hooks/useGameStore';
import { useSounds } from '@/hooks/useSounds';
import { getPayoutForHand, JACKS_OR_BETTER_9_6 } from '@/game/payTables';
import { analyzeAllPlaysAsync } from '@/game/evCalculatorOptimized';

export const GameBoard: React.FC = () => {
  const {
    hand,
    heldCards,
    credits,
    bet,
    gamePhase,
    lastResult,
    optimalHolds,
    mistakeMade,
    evAnalysis,
    deal,
    hold,
    draw,
    changeBet
  } = useGameStore();

  const { playWinSound, playCorrectSound, playIncorrectSound, playCardSound } = useSounds();
  const prevGamePhaseRef = useRef<string>('initial');
  const prevLastResultRef = useRef<any>(null);
  const [originalHand, setOriginalHand] = useState<any[]>([]);
  const [, setIsLoadingFullAnalysis] = useState(false);
  const [fullEvAnalysis, setFullEvAnalysis] = useState<any>(null);
  const [actualMistakeMade, setActualMistakeMade] = useState<boolean | null>(null);
  const [actualOptimalHolds, setActualOptimalHolds] = useState<boolean[] | null>(null);
  const [preComputedAnalysis, setPreComputedAnalysis] = useState<any>(null);
  const [showPayTable, setShowPayTable] = useState(false);

  // Capture original hand when dealt and start background analysis
  useEffect(() => {
    if (gamePhase === 'dealt' && hand.length === 5) {
      setOriginalHand([...hand]);
      
      // Start pre-computing EV analysis in background
      analyzeAllPlaysAsync([...hand], bet)
        .then((analysis) => {
          setPreComputedAnalysis(analysis);
        })
        .catch((error) => {
          console.error('Error pre-computing EV analysis:', error);
        });
    }
  }, [gamePhase, hand, bet]);

  // Use pre-computed analysis when user draws
  useEffect(() => {
    if (gamePhase === 'drawn' && originalHand.length === 5 && !fullEvAnalysis) {
      if (preComputedAnalysis) {
        // Use pre-computed analysis for instant feedback
        setFullEvAnalysis(preComputedAnalysis);
        
        // Determine actual optimal strategy based on pre-computed EV analysis
        const optimalChoice = preComputedAnalysis.optimalChoice;
        const actualOptimal = optimalChoice.holds;
        const playerWasOptimal = actualOptimal.every((should: boolean, i: number) => should === heldCards[i]);
        
        setActualOptimalHolds(actualOptimal);
        setActualMistakeMade(!playerWasOptimal);
      } else {
        // Fallback: compute analysis if pre-computation didn't complete
        setIsLoadingFullAnalysis(true);
        analyzeAllPlaysAsync(originalHand, bet)
          .then((analysis) => {
            setFullEvAnalysis(analysis);
            
            const optimalChoice = analysis.optimalChoice;
            const actualOptimal = optimalChoice.holds;
            const playerWasOptimal = actualOptimal.every((should: boolean, i: number) => should === heldCards[i]);
            
            setActualOptimalHolds(actualOptimal);
            setActualMistakeMade(!playerWasOptimal);
            setIsLoadingFullAnalysis(false);
          })
          .catch((error) => {
            console.error('Error running full EV analysis:', error);
            setIsLoadingFullAnalysis(false);
          });
      }
    }
  }, [gamePhase, originalHand, bet, fullEvAnalysis, heldCards, preComputedAnalysis]);

  // Reset analysis state when new hand is dealt
  useEffect(() => {
    if (gamePhase === 'dealt') {
      setFullEvAnalysis(null);
      setActualMistakeMade(null);
      setActualOptimalHolds(null);
      setPreComputedAnalysis(null);
    }
  }, [gamePhase]);

  // Play sounds based on game state changes
  useEffect(() => {
    const prevPhase = prevGamePhaseRef.current;
    const prevResult = prevLastResultRef.current;

    // Play card sound when dealing
    if (prevPhase === 'initial' && gamePhase === 'dealt') {
      playCardSound();
    }

    // Play sounds after drawing (when hand is evaluated)
    if (prevPhase === 'dealt' && gamePhase === 'drawn' && lastResult && lastResult !== prevResult) {
      const payout = getPayoutForHand(lastResult.type, bet, JACKS_OR_BETTER_9_6);
      
      // Play win sound if there's a payout
      if (payout > 0) {
        setTimeout(() => playWinSound(), 300); // Slight delay for better UX
      }
      
      // Play feedback sound based on EV analysis (when available)
      if (actualMistakeMade !== null) {
        if (actualMistakeMade) {
          setTimeout(() => playIncorrectSound(), 100);
        } else {
          setTimeout(() => playCorrectSound(), 100);
        }
      }
      // Note: No sound feedback if EV analysis isn't ready yet
    }

    // Update refs
    prevGamePhaseRef.current = gamePhase;
    prevLastResultRef.current = lastResult;
  }, [gamePhase, lastResult, actualMistakeMade, bet, playWinSound, playCorrectSound, playIncorrectSound, playCardSound]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent default behavior for our handled keys
      if (['1', '2', '3', '4', '5', ' '].includes(event.key)) {
        event.preventDefault();
      }

      // Handle number keys 1-5 for holding/unholding cards
      if (['1', '2', '3', '4', '5'].includes(event.key) && gamePhase === 'dealt') {
        const cardIndex = parseInt(event.key) - 1;
        hold(cardIndex);
      }

      // Handle spacebar for deal/draw
      if (event.key === ' ') {
        if (gamePhase === 'initial' || gamePhase === 'drawn') {
          if (credits >= bet) {
            deal();
          }
        } else if (gamePhase === 'dealt') {
          draw();
        }
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gamePhase, hold, deal, draw, credits, bet]);

  return (
    <div className="game-board">
      <div className="game-header">
        <h1>Video Poker Trainer</h1>
        <p>Learn optimal Jacks or Better strategy</p>
        <div className="game-header-actions">
          <button 
            className="pay-table-button"
            onClick={() => setShowPayTable(true)}
          >
            Pay Table
          </button>
          <div className="keyboard-help">
            <span>Keyboard: 1-5 to hold cards, Space to deal/draw</span>
          </div>
        </div>
      </div>
      
      <div className="game-layout">
        <div className="ev-panel">
          {gamePhase === 'drawn' && (evAnalysis || fullEvAnalysis) && (
            <EVGrid 
              analysis={fullEvAnalysis || evAnalysis} 
              originalHand={originalHand} 
              bet={bet} 
            />
          )}
        </div>
        <div className="center-panel">
          <div className="card-area">
            {gamePhase === 'drawn' && fullEvAnalysis && (
              <div className="strategy-feedback">
                {actualMistakeMade ? (
                  <>
                    <h3>🤔 Not quite optimal this time!</h3>
                    <p>No worries - check out the suggestions below to see what the math says is best.</p>
                  </>
                ) : (
                  <>
                    <h3>✅ Correct! Hand well played!</h3>
                  </>
                )}
              </div>
            )}
            
            <div className="cards-container">
              {gamePhase === 'drawn' ? (
                <div className="current-hand-label">Final Hand</div>
              ) : null}
              <div className="cards-row">
                {Array.from({ length: 5 }, (_, index) => (
                  <Card
                    key={index}
                    card={hand[index]}
                    isHeld={heldCards[index]}
                    onToggleHold={() => hold(index)}
                    disabled={gamePhase !== 'dealt'}
                    showBack={gamePhase === 'initial'}
                    showStrategy={false} // No strategy feedback on final hand
                    shouldHold={false}
                    playerHeld={false}
                  />
                ))}
              </div>
            </div>

            {originalHand.length === 5 && gamePhase === 'drawn' && (
              <div className="cards-container original-hand">
                <div className="original-hand-label">Original Hand</div>
                <div className="cards-row">
                  {originalHand.map((card, index) => (
                    <Card
                      key={`original-${index}`}
                      card={card}
                      isHeld={false}
                      onToggleHold={() => {}} // Disabled for original hand
                      disabled={true}
                      showBack={false}
                      showStrategy={!!(actualOptimalHolds || optimalHolds)}
                      shouldHold={(actualOptimalHolds || optimalHolds)?.[index] || false}
                      playerHeld={heldCards[index]} // What player actually held
                    />
                  ))}
                </div>
              </div>
            )}
            
            {lastResult && (() => {
              const payout = getPayoutForHand(lastResult.type, bet, JACKS_OR_BETTER_9_6);
              if (payout > 0) {
                return (
                  <div className="hand-result">
                    <div className="result-text">{lastResult.description}</div>
                    <div className="result-payout">
                      <span>Payout: {payout} credits</span>
                    </div>
                  </div>
                );
              }
              return null;
            })()}
          </div>
        </div>
        <div className="controls-panel">
          <Controls
            credits={credits}
            bet={bet}
            gamePhase={gamePhase}
            onDeal={deal}
            onDraw={draw}
            onChangeBet={changeBet}
            mistakeMade={mistakeMade}
          />
        </div>
      </div>
      
      
      <PayTablePopup
        isOpen={showPayTable}
        onClose={() => setShowPayTable(false)}
        currentBet={bet}
        lastHandType={lastResult?.type}
      />
    </div>
  );
};