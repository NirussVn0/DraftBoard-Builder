import React, { useEffect, useRef } from 'react';
import anime from 'animejs';
import type { Player } from '../../core/GameState';

interface FreezeOverlayProps {
  frozenPlayerIds: string[];
  players: Player[];
  onComplete: () => void;
}

export const FreezeOverlay: React.FC<FreezeOverlayProps> = ({ frozenPlayerIds, players, onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  const frozenPlayers = players.filter(p => frozenPlayerIds.includes(p.id));

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const container = containerRef.current;
    if (!container) return;

    const tl = anime.timeline({
      complete: () => setTimeout(onComplete, 600)
    });

    // Fade in backdrop
    tl.add({
      targets: container,
      opacity: [0, 1],
      duration: 400,
      easing: 'easeOutQuad',
    });

    // Icon + text pop in
    tl.add({
      targets: container.querySelectorAll('.freeze-content'),
      scale: [0.5, 1.1, 1],
      opacity: [0, 1],
      duration: 600,
      easing: 'easeOutElastic(1, .8)',
    }, '-=200');

    // Player cards stagger in
    tl.add({
      targets: container.querySelectorAll('.freeze-card'),
      translateY: [30, 0],
      opacity: [0, 1],
      duration: 400,
      delay: anime.stagger(150),
      easing: 'easeOutQuad',
    }, '-=300');

    // Hold, then fade out everything
    tl.add({
      targets: container,
      opacity: [1, 0],
      duration: 500,
      easing: 'easeInQuad',
      delay: 2000,
    });
  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/85 backdrop-blur-md opacity-0"
    >
      {/* Ice particles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-cyan-300/40 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="freeze-content flex flex-col items-center gap-4 opacity-0">
        <span className="text-8xl drop-shadow-[0_0_30px_rgba(147,210,255,0.8)]">⏱️</span>
        <h2 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-cyan-200 to-blue-400 drop-shadow-[0_0_20px_rgba(147,210,255,0.6)] uppercase tracking-wider text-center">
          Za Warudo!
        </h2>
        <p className="text-lg text-cyan-200/80 font-medium">Thời gian đã dừng lại...</p>
      </div>

      <div className="flex flex-wrap gap-3 justify-center mt-6">
        {frozenPlayers.map(p => (
          <div
            key={p.id}
            className="freeze-card px-5 py-3 bg-blue-950/80 border-2 border-cyan-400/50 rounded-xl text-cyan-100 font-bold text-lg flex items-center gap-3 shadow-[0_0_15px_rgba(147,210,255,0.3)] opacity-0"
          >
            <span className="text-2xl grayscale">{p.emoji}</span>
            <span>{p.name}</span>
            <span className="text-sm text-cyan-300/70">❄️ bị đóng băng!</span>
          </div>
        ))}
      </div>
    </div>
  );
};
