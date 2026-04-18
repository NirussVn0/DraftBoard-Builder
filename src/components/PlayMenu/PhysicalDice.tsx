import React, { useEffect, useRef, useState } from 'react';
import { AnimationService } from '../../services/AnimationService';
import { audioService } from '../../services/AudioService';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react';

interface PhysicalDiceProps {
  diceValue: number;
  activeColor: string;
  onLanded: () => void;
}

const DICE_ICONS = [Dice1, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

/**
 * PhysicalDice — the animated 3D spinning cube that drops from sky.
 * Only responsible for the sky-drop animation and cycling dice faces.
 * Calls onLanded() when the dice hits the ground.
 */
export const PhysicalDice: React.FC<PhysicalDiceProps> = ({
  diceValue, activeColor, onLanded
}) => {
  const hasAnimated = useRef(false);
  const intervalRef = useRef<number | null>(null);
  const [displayValue, setDisplayValue] = useState(1);
  const [landed, setLanded] = useState(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    // Rapid cycling of dice faces during drop
    intervalRef.current = window.setInterval(() => {
      setDisplayValue(Math.floor(Math.random() * 6) + 1);
    }, 80);

    // Sky-drop animation
    AnimationService.animateSkyDropDice('sky-drop-dice', () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      setDisplayValue(diceValue);
      setLanded(true);
      audioService.playDiceRoll();
      onLanded();
    });

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [diceValue, onLanded]);

  const Icon = DICE_ICONS[displayValue] || Dice1;

  return (
    <div
      id="sky-drop-dice"
      className={`bg-white p-8 game-card border-2 flex items-center justify-center transition-shadow ${landed ? 'shadow-lg' : ''}`}
      style={{ borderColor: activeColor }}
    >
      <Icon size={120} style={{ color: activeColor }} />
    </div>
  );
};
