import React, { useState, useCallback, useRef } from 'react';
import { PhysicalDice } from './PhysicalDice';
import { DiceResultBanner } from './DiceResultBanner';

interface DiceOverlayProps {
  diceValue: number;
  diceRolls: number[];
  diceCount: number;
  activeColor: string;
  onComplete: () => void;
}

/**
 * DiceOverlay — orchestrates N PhysicalDice (sky-drop) and DiceResultBanner (total).
 * Each die drops with a slight stagger. After ALL dice land:
 * pause (200ms) → Banner slides in (300ms) → hold (800ms) → close.
 */
export const DiceOverlay: React.FC<DiceOverlayProps> = ({
  diceValue, diceRolls, diceCount, activeColor, onComplete
}) => {
  const [showBanner, setShowBanner] = useState(false);
  const landedCount = useRef(0);

  const handleDiceLanded = useCallback(() => {
    landedCount.current += 1;
    if (landedCount.current < diceCount) return;

    // All dice have landed — wait 200ms pause, then show banner
    setTimeout(() => {
      setShowBanner(true);

      // Hold banner for 800ms, then close everything
      setTimeout(() => {
        onComplete();
      }, 800);
    }, 200);
  }, [diceCount, onComplete]);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        {/* Physical dice — sky-drop animation */}
        <div className="flex items-center gap-4">
          {Array.from({ length: diceCount }).map((_, i) => (
            <PhysicalDice
              key={i}
              diceIndex={i}
              diceValue={diceRolls[i] || 1}
              activeColor={activeColor}
              onLanded={handleDiceLanded}
            />
          ))}
        </div>

        {/* Result banner — appears after ALL dice land */}
        {showBanner && (
          <DiceResultBanner value={diceValue} activeColor={activeColor} />
        )}
      </div>
    </div>
  );
};
