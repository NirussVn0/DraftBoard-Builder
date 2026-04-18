import React, { useEffect, useRef, useState } from 'react';
import { AnimationService } from '../../services/AnimationService';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react';

interface DiceOverlayProps {
  diceValue: number;
  activeColor: string;
  onComplete: () => void;
}

const DICE_ICONS = [Dice1, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

export const DiceOverlay: React.FC<DiceOverlayProps> = ({
  diceValue, activeColor, onComplete
}) => {
  const hasAnimated = useRef(false);
  const intervalRef = useRef<number | null>(null);
  const [displayValue, setDisplayValue] = useState(1);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    // Rapid cycling of dice faces during drop
    intervalRef.current = window.setInterval(() => {
      setDisplayValue(Math.floor(Math.random() * 6) + 1);
    }, 80);

    // Sky-drop animation using exact CEO-mandated anime.js config
    AnimationService.animateSkyDropDice('sky-drop-dice', () => {
      // Animation complete — stop cycling, show final value
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      setDisplayValue(diceValue);
      setShowResult(true);

      // Wait 1s before removing overlay
      setTimeout(() => {
        onComplete();
      }, 1000);
    });

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [diceValue, onComplete]);

  const Icon = DICE_ICONS[displayValue] || Dice1;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div
        id="sky-drop-dice"
        className="bg-white p-8 shadow-2xl border-2 flex flex-col items-center gap-4"
        style={{ borderColor: activeColor }}
      >
        <Icon size={120} style={{ color: activeColor }} />
        {showResult && (
          <div className="text-center">
            <span className="text-5xl font-black" style={{ color: activeColor }}>
              {diceValue}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
