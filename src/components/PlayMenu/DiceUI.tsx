import React, { useState, useEffect } from 'react';
import { AnimationService } from '../../services/AnimationService';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react';
import type { GamePhase } from '../../core/GameState';

interface DiceUIProps {
  onRoll: () => void;
  phase: GamePhase;
  currentValue: number;
}

export const DiceUI: React.FC<DiceUIProps> = ({ onRoll, phase, currentValue }) => {
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
    const props = { size: 64, className: "text-purple-600" };
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
        className={`p-4 bg-white rounded-[2rem] shadow-xl border border-slate-100 transition-all ${disabled ? 'opacity-90' : 'hover:-translate-y-2 hover:shadow-2xl active:scale-90 cursor-pointer'}`}
      >
        {getDiceIcon(displayValue)}
      </button>
      <p className="mt-4 text-sm font-bold text-slate-400 uppercase tracking-widest">
        {isRolling ? "Rolling..." : (disabled ? "Wait..." : "Roll Dice")}
      </p>
    </div>
  );
};
