import React, { useState, useEffect } from 'react';
import { AnimationService } from '../../services/AnimationService';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react';

interface DiceUIProps {
  onRoll: () => void;
  disabled: boolean;
  currentValue: number;
}

export const DiceUI: React.FC<DiceUIProps> = ({ onRoll, disabled, currentValue }) => {
  const [displayValue, setDisplayValue] = useState(currentValue);

  useEffect(() => {
    if (disabled) {
      const interval = setInterval(() => {
        setDisplayValue(Math.floor(Math.random() * 6) + 1);
      }, 100);
      return () => clearInterval(interval);
    } else {
      setDisplayValue(currentValue);
    }
  }, [disabled, currentValue]);

  const handleRoll = () => {
    if (!disabled) {
      AnimationService.animateDiceShake('dice-container');
      onRoll();
    }
  };

  const getDiceIcon = (val: number) => {
    const props = { size: 64, className: "text-purple-600 dark:text-purple-400" };
    const icons = [Dice1, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6]; // Index 0 is fallback
    const Icon = icons[val] || Dice1;
    return <Icon {...props} />;
  };

  return (
    <div className="flex flex-col items-center">
      <button 
        id="dice-container"
        onClick={handleRoll}
        disabled={disabled}
        className={`p-4 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 transition-all ${disabled ? 'opacity-90' : 'hover:-translate-y-2 hover:shadow-2xl active:scale-90 cursor-pointer'}`}
      >
        {getDiceIcon(displayValue)}
      </button>
      <p className="mt-4 text-sm font-bold text-gray-500 uppercase tracking-widest">
        {disabled ? "Rolling..." : "Roll Dice"}
      </p>
    </div>
  );
};
