import React, { useEffect, useRef, useState } from 'react';
import { AnimationService } from '../../services/AnimationService';
import { audioService } from '../../services/AudioService';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react';

interface PhysicalDiceProps {
  diceIndex: number;
  diceValue: number;
  activeColor: string;
  onLanded: () => void;
}

const DICE_ICONS = [Dice1, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

/**
 * PhysicalDice — the animated 3D spinning cube that drops from sky.
 * Number scrambles continuously via anime.js update callback, then
 * locks to a random d6 value on landing (visual only — total is managed by engine).
 * diceIndex provides stagger delay so multi-dice drops look natural.
 */
export const PhysicalDice: React.FC<PhysicalDiceProps> = ({
  diceIndex, diceValue, activeColor, onLanded
}) => {
  const hasAnimated = useRef(false);
  const [displayValue, setDisplayValue] = useState(1);
  const [landed, setLanded] = useState(false);
  const elementId = `sky-drop-dice-${diceIndex}`;

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    // Stagger each die by 120ms
    const delay = diceIndex * 120;

    setTimeout(() => {
      AnimationService.animateSkyDropDice(
        elementId,
        () => {
          // complete — lock to a random d6 face (visual only)
          const face = Math.floor(Math.random() * 6) + 1;
          setDisplayValue(face);
          setLanded(true);
          audioService.playDiceRoll();
          onLanded();
        },
        () => {
          // update — scramble number on every animation frame
          setDisplayValue(Math.floor(Math.random() * 6) + 1);
        }
      );
    }, delay);
  }, [diceIndex, diceValue, elementId, onLanded]);

  const Icon = DICE_ICONS[displayValue] || Dice1;

  return (
    <div
      id={elementId}
      className={`bg-white p-8 game-card border-2 flex items-center justify-center transition-shadow ${landed ? 'shadow-lg' : ''}`}
      style={{ borderColor: activeColor }}
    >
      <Icon size={120} style={{ color: activeColor }} />
    </div>
  );
};
