import React, { useState, useCallback } from 'react';
import { PhysicalDice } from './PhysicalDice';
import { DiceResultBanner } from './DiceResultBanner';

interface DiceOverlayProps {
  diceValue: number;
  activeColor: string;
  onComplete: () => void;
}

/**
 * DiceOverlay — orchestrates PhysicalDice (sky-drop) and DiceResultBanner (number).
 * Timing: Dice drops (1000ms) → pause (200ms) → Banner slides in (300ms) → hold (800ms) → close.
 */
export const DiceOverlay: React.FC<DiceOverlayProps> = ({
  diceValue, activeColor, onComplete
}) => {
  const [showBanner, setShowBanner] = useState(false);

  const handleDiceLanded = useCallback(() => {
    // Dice has landed — wait 200ms pause, then show banner
    setTimeout(() => {
      setShowBanner(true);

      // Hold banner for 800ms, then close everything
      setTimeout(() => {
        onComplete();
      }, 800);
    }, 200);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        {/* Physical dice — sky-drop animation */}
        <PhysicalDice
          diceValue={diceValue}
          activeColor={activeColor}
          onLanded={handleDiceLanded}
        />

        {/* Result banner — appears after dice lands */}
        {showBanner && (
          <DiceResultBanner value={diceValue} activeColor={activeColor} />
        )}
      </div>
    </div>
  );
};
