import React, { useState, useEffect } from 'react';
import { AnimationService } from '../../services/AnimationService';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react';
import type { GamePhase } from '../../core/GameState';

interface DiceUIProps {
  onRoll: () => void;
  phase: GamePhase;
  currentValue: number;
  activeColor?: string;
}

export const DiceUI: React.FC<DiceUIProps> = ({ onRoll, phase, currentValue, activeColor }) => {
  const [displayValue, setDisplayValue] = useState(currentValue);
  const isRolling = phase === 'ROLLING_DICE';
  const disabled = phase !== 'IDLE_TURN';

  useEffect(() => {
    if (isRolling) {
      const interval = setInterval(() => {
        setDisplayValue(Math.floor(Math.random() * 6) + 1);
      }, 100);
      return () => clearInterval(interval);
    } else {
      setDisplayValue(currentValue);
    }
  }, [isRolling, currentValue]);

  const handleRoll = () => {
    if (!disabled) {
      AnimationService.animateDiceShake('dice-container');
      onRoll();
    }
  };

  const getDiceIcon = (val: number) => {
    const props = { size: 96, style: { color: activeColor || '#9333ea' } };
    const icons = [Dice1, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];
    const Icon = icons[val] || Dice1;
    return <Icon {...props} />;
  };

  return (
    <div className="flex flex-col items-center">
      <button 
        id="dice-container"
        onClick={handleRoll}
        disabled={disabled}
        className={`p-6 bg-white rounded-[2.5rem] shadow-xl transition-all ${disabled ? 'opacity-90 grayscale-[0.2]' : 'hover:-translate-y-2 hover:shadow-2xl active:scale-90 cursor-pointer'}`}
        style={{
          border: `4px solid ${isRolling ? activeColor : (activeColor ? activeColor + '80' : '#f1f5f9')}`,
          boxShadow: isRolling ? `0 0 30px ${activeColor}60` : undefined,
        }}
      >
        {getDiceIcon(displayValue)}
      </button>
      <p className="mt-4 text-sm font-bold text-slate-400 uppercase tracking-widest">
        {isRolling ? "Rolling..." : (disabled ? "Wait..." : "Roll Dice")}
      </p>
    </div>
  );
};
