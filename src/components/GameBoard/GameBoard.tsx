import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/Card/Card';
import { PayTablePopup } from '@/components/PayTablePopup/PayTablePopup';
import { Controls } from '@/components/Controls/Controls';
import { EVGrid } from '@/components/EVGrid/EVGrid';
import { Statistics } from '@/components/Statistics/Statistics';
import { useGameStore } from '@/hooks/useGameStore';
import { useSounds } from '@/hooks/useSounds';
import { useStatistics } from '@/hooks/useStatistics';
import { getPayoutForHand, JACKS_OR_BETTER_9_6 } from '@/game/payTables';
import { analyzeAllPlaysAsync } from '@/game/evCalculatorOptimized';
import { evaluateHand } from '@/game/handEvaluator';
import { Card as CardType, HandType, Rank } from '@/game/types';

// Helper function to identify which cards are part of the winning hand
const getWinningCards = (hand: CardType[], handType: HandType): boolean[] => {
  const winningCards = [false, false, false, false, false];
  
  // Get rank counts for pair/trips/quads detection
  const rankCounts = new Map<string, number[]>();
  hand.forEach((card, index) => {
    if (!rankCounts.has(card.rank)) {
      rankCounts.set(card.rank, []);
    }
    rankCounts.get(card.rank)!.push(index);
  });

  switch (handType) {
    case HandType.JACKS_OR_BETTER:
      // Find the pair of Jacks or better
      for (const [rank, indices] of rankCounts.entries()) {
        if (indices.length === 2) {
          const highCardRanks = [Rank.JACK, Rank.QUEEN, Rank.KING, Rank.ACE];
          if (highCardRanks.includes(rank as Rank)) {
            indices.forEach(index => winningCards[index] = true);
            break;
          }
        }
      }
      break;

    case HandType.TWO_PAIR:
      // Find both pairs
      for (const [, indices] of rankCounts.entries()) {
        if (indices.length === 2) {
          indices.forEach(index => winningCards[index] = true);
        }
      }
      break;

    case HandType.THREE_OF_A_KIND:
      // Find the three of a kind
      for (const [, indices] of rankCounts.entries()) {
        if (indices.length === 3) {
          indices.forEach(index => winningCards[index] = true);
          break;
        }
      }
      break;

    case HandType.FOUR_OF_A_KIND:
      // Find the four of a kind
      for (const [, indices] of rankCounts.entries()) {
        if (indices.length === 4) {
          indices.forEach(index => winningCards[index] = true);
          break;
        }
      }
      break;

    case HandType.FULL_HOUSE:
      // Find the three of a kind and pair
      for (const [, indices] of rankCounts.entries()) {
        if (indices.length === 3 || indices.length === 2) {
          indices.forEach(index => winningCards[index] = true);
        }
      }
      break;

    // For straights, flushes, straight flushes, and royal flushes, all cards are needed
    case HandType.STRAIGHT:
    case HandType.FLUSH:
    case HandType.STRAIGHT_FLUSH:
    case HandType.ROYAL_FLUSH:
      winningCards.fill(true);
      break;

    default:
      // No winning cards for other hand types
      break;
  }
  
  return winningCards;
};

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
  const { statistics, recordDecision, resetStatistics } = useStatistics();
  const prevGamePhaseRef = useRef<string>('initial');
  const prevLastResultRef = useRef<any>(null);
  const [originalHand, setOriginalHand] = useState<any[]>([]);
  const [, setIsLoadingFullAnalysis] = useState(false);
  const [fullEvAnalysis, setFullEvAnalysis] = useState<any>(null);
  const [actualMistakeMade, setActualMistakeMade] = useState<boolean | null>(null);
  const [actualOptimalHolds, setActualOptimalHolds] = useState<boolean[] | null>(null);
  const [preComputedAnalysis, setPreComputedAnalysis] = useState<any>(null);
  const [showPayTable, setShowPayTable] = useState(false);
  const [dealtWinningHand, setDealtWinningHand] = useState<{type: string, payout: number, winningCards: boolean[]} | null>(null);

  // Capture original hand when dealt and start background analysis
  useEffect(() => {
    if (gamePhase === 'dealt' && hand.length === 5) {
      setOriginalHand([...hand]);
      
      // Check if we have a winning hand on deal
      const handResult = evaluateHand(hand);
      const payout = getPayoutForHand(handResult.type, bet, JACKS_OR_BETTER_9_6);
      
      if (payout > 0) {
        // Play positive chime for winning hand on deal
        setTimeout(() => playWinSound(), 200);
        const winningCards = getWinningCards(hand, handResult.type);
        setDealtWinningHand({ 
          type: handResult.description, 
          payout,
          winningCards 
        });
      } else {
        setDealtWinningHand(null);
      }
      
      // Start pre-computing EV analysis in background
      analyzeAllPlaysAsync([...hand], bet)
        .then((analysis) => {
          setPreComputedAnalysis(analysis);
        })
        .catch((error) => {
          console.error('Error pre-computing EV analysis:', error);
        });
    }
  }, [gamePhase, hand, bet, playWinSound]);

  // Use pre-computed analysis when user draws
  useEffect(() => {
    if (gamePhase === 'drawn' && originalHand.length === 5 && !fullEvAnalysis) {
      if (preComputedAnalysis) {
        // Find the player's choice in the analysis
        const playerChoice = preComputedAnalysis.combinations.find((combo: any) => 
          combo.holds.every((hold: boolean, index: number) => hold === heldCards[index])
        );
        
        // Update analysis with player choice
        const analysisWithPlayer = {
          ...preComputedAnalysis,
          playerChoice,
          playerRank: playerChoice ? preComputedAnalysis.combinations.indexOf(playerChoice) + 1 : undefined
        };
        
        setFullEvAnalysis(analysisWithPlayer);
        
        // Determine actual optimal strategy based on pre-computed EV analysis
        const optimalChoice = preComputedAnalysis.optimalChoice;
        const actualOptimal = optimalChoice.holds;
        const playerWasOptimal = actualOptimal.every((should: boolean, i: number) => should === heldCards[i]);
        
        setActualOptimalHolds(actualOptimal);
        setActualMistakeMade(!playerWasOptimal);
        
        // Record the decision for statistics
        recordDecision(playerWasOptimal);
      } else {
        // Fallback: compute analysis if pre-computation didn't complete
        setIsLoadingFullAnalysis(true);
        analyzeAllPlaysAsync(originalHand, bet)
          .then((analysis) => {
            // Find the player's choice in the analysis
            const playerChoice = analysis.combinations.find((combo: any) => 
              combo.holds.every((hold: boolean, index: number) => hold === heldCards[index])
            );
            
            // Update analysis with player choice
            const analysisWithPlayer = {
              ...analysis,
              playerChoice,
              playerRank: playerChoice ? analysis.combinations.indexOf(playerChoice) + 1 : undefined
            };
            
            setFullEvAnalysis(analysisWithPlayer);
            
            const optimalChoice = analysis.optimalChoice;
            const actualOptimal = optimalChoice.holds;
            const playerWasOptimal = actualOptimal.every((should: boolean, i: number) => should === heldCards[i]);
            
            setActualOptimalHolds(actualOptimal);
            setActualMistakeMade(!playerWasOptimal);
            
            // Record the decision for statistics
            recordDecision(playerWasOptimal);
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
    } else if (gamePhase === 'initial') {
      setDealtWinningHand(null);
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
      } else {
        // Fallback: play card sound for feedback even if EV analysis isn't ready
        setTimeout(() => playCardSound(), 100);
      }
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
          <div className="keyboard-help desktop-only">
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

            {/* Winning hand notification on initial deal */}
            {gamePhase === 'dealt' && dealtWinningHand && (
              <div className="winning-hand-notification">
                <h3>🎉 Congratulations! You were dealt a winning hand!</h3>
                <p>
                  <strong>{dealtWinningHand.type}</strong> - Hold the winning cards to win {dealtWinningHand.payout} {dealtWinningHand.payout === 1 ? 'credit' : 'credits'}!
                </p>
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
                    highlightWinning={gamePhase === 'dealt' && dealtWinningHand?.winningCards[index] === true}
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
          {/* Desktop Statistics - shown at top of controls */}
          <div className="desktop-statistics">
            <Statistics
              totalHands={statistics.totalHands}
              correctDecisions={statistics.correctDecisions}
              accuracy={statistics.accuracy}
              onReset={resetStatistics}
            />
          </div>
          {/* Mobile Statistics - shown with controls */}
          <div className="mobile-statistics">
            <Statistics
              totalHands={statistics.totalHands}
              correctDecisions={statistics.correctDecisions}
              accuracy={statistics.accuracy}
              onReset={resetStatistics}
            />
          </div>
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