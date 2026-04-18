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
 * Number scrambles continuously via anime.js update callback, then
 * locks to the real value on landing.
 */
export const PhysicalDice: React.FC<PhysicalDiceProps> = ({
  diceValue, activeColor, onLanded
}) => {
  const hasAnimated = useRef(false);
  const [displayValue, setDisplayValue] = useState(1);
  const [landed, setLanded] = useState(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    // Sky-drop animation with per-frame scrambling via anime.js update hook
    AnimationService.animateSkyDropDice(
      'sky-drop-dice',
      () => {
        // complete — lock to real value
        setDisplayValue(diceValue);
        setLanded(true);
        audioService.playDiceRoll();
        onLanded();
      },
      () => {
        // update — scramble number on every animation frame
        setDisplayValue(Math.floor(Math.random() * 6) + 1);
      }
    );
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
