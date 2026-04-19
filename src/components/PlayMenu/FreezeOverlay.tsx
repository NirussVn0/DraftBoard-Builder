import React, { useEffect, useRef } from 'react';
import anime from 'animejs';
import type { Player } from '../../core/GameState';

interface FreezeOverlayProps {
  frozenPlayerIds: string[];
  players: Player[];
  onComplete: () => void;
}

export const FreezeOverlay: React.FC<FreezeOverlayProps> = ({ frozenPlayerIds, players, onComplete }) => {
  const waveRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  const frozenPlayers = players.filter(p => frozenPlayerIds.includes(p.id));

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const tl = anime.timeline({ complete: () => setTimeout(onComplete, 500) });

    // Clock wave ripple
    tl.add({
      targets: waveRef.current,
      scale: [0, 3],
      opacity: [0.8, 0],
      duration: 1200,
      easing: 'easeOutQuad',
    });

    // Text entrance
    tl.add({
      targets: textRef.current,
      scale: [0.5, 1.1, 1],
      opacity: [0, 1],
      duration: 600,
      easing: 'easeOutElastic(1, .8)',
    }, '-=800');

    // Hold then fade out
    tl.add({
      targets: textRef.current,
      opacity: [1, 0],
      duration: 400,
      easing: 'easeInQuad',
      delay: 1500,
    });
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{ filter: 'invert(1) hue-rotate(180deg)' }}
    >
      <div className="absolute inset-0 bg-black/70" style={{ filter: 'invert(1)' }} />

      {/* Clock wave */}
      <div ref={waveRef}
        className="absolute w-32 h-32 rounded-full border-4 border-blue-300 opacity-0"
        style={{ boxShadow: '0 0 60px 20px rgba(147,210,255,0.5)' }}
      />

      <div ref={textRef} className="z-10 flex flex-col items-center gap-4 opacity-0">
        <span className="text-8xl">⏱️</span>
        <h2 className="text-6xl font-black text-white drop-shadow-[0_0_20px_rgba(147,210,255,0.8)]">
          ZA WARUDO!
        </h2>
        <div className="flex flex-wrap gap-3 justify-center mt-2">
          {frozenPlayers.map(p => (
            <div key={p.id} className="px-4 py-2 bg-blue-900/80 border-2 border-blue-300 game-card text-blue-100 font-bold text-lg flex items-center gap-2">
              <span>{p.emoji}</span>
              <span>{p.name}</span>
              <span className="text-sm opacity-70">bị đóng băng!</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
