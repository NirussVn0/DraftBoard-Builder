import React, { useEffect, useRef, useState } from 'react';
import anime from 'animejs';
import type { Player } from '../../core/GameState';
import { gameEngine } from '../../core/GameEngine';

interface DetentionOverlayProps {
  prisoner: Player;
  onComplete: () => void;
}

export const DetentionOverlay: React.FC<DetentionOverlayProps> = ({ prisoner, onComplete }) => {
  const barsRef = useRef<HTMLDivElement>(null);
  const [rolled, setRolled] = useState<number | null>(null);
  const [escaped, setEscaped] = useState<boolean | null>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;
    anime({
      targets: barsRef.current,
      translateY: [-200, 0],
      duration: 800,
      easing: 'easeOutBounce',
    });
  }, []);

  const handleRoll = () => {
    const value = Math.floor(Math.random() * 6) + 1;
    const ESCAPE_VALUE = 6;
    setRolled(value);
    const didEscape = value >= ESCAPE_VALUE;
    setEscaped(didEscape);

    anime({
      targets: '#dungeon-dice',
      rotate: ['0turn', '2turn'],
      scale: [0.5, 1.2, 1],
      duration: 600,
      easing: 'easeOutElastic(1, .8)',
      complete: () => {
        setTimeout(() => {
          gameEngine.resolveDetentionRoll(value);
          onComplete();
        }, 1500);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md">
      <div className="absolute inset-0 opacity-30"
        style={{ backgroundImage: 'repeating-linear-gradient(90deg, #1e1b4b 0px, #1e1b4b 8px, transparent 8px, transparent 48px)' }}
      />

      <div ref={barsRef} className="z-10 flex flex-col items-center gap-6 text-center px-8">
        <span className="text-8xl">⛓️</span>
        <h2 className="text-4xl font-black text-amber-300 drop-shadow">Phòng Giám Thị (Cấm Túc)</h2>
        <div className="flex items-center gap-3 text-xl text-white/80 font-bold">
          <span>{prisoner.emoji}</span>
          <span style={{ color: prisoner.color }}>{prisoner.name}</span>
          <span>đang bị giam cầm!</span>
        </div>
        <p className="text-white/50 text-sm">Lắc xúc xắc — ra đúng <span className="text-amber-300 font-black text-lg">6</span> mới thoát!</p>

        {rolled === null ? (
          <button
            id="detention-dice"
            onClick={handleRoll}
            className="mt-4 w-24 h-24 text-5xl game-card bg-amber-900 border-4 border-amber-400 text-white hover:scale-110 active:scale-95 transition-all shadow-[0_0_30px_rgba(251,191,36,0.4)]"
          >
            🎲
          </button>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div id="detention-dice" className="w-24 h-24 text-5xl flex items-center justify-center game-card bg-amber-900 border-4 border-amber-400 font-black text-white text-4xl">
              {rolled}
            </div>
            {escaped !== null && (
              <p className={`text-2xl font-black ${escaped ? 'text-emerald-400' : 'text-rose-400'}`}>
                {escaped ? '🔓 THOÁT RỒI!' : '🔒 Chưa đủ... Thử lại lượt sau!'}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
