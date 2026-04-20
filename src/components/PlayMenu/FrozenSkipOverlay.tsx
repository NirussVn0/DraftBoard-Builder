import React, { useEffect, useRef } from 'react';
import anime from 'animejs';
import type { Player } from '../../core/GameState';
import { audioService } from '../../services/AudioService';

interface FrozenSkipOverlayProps {
  player: Player;
  onComplete: () => void;
}

export const FrozenSkipOverlay: React.FC<FrozenSkipOverlayProps> = ({ player, onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    if (!containerRef.current) return;

    audioService.playMysteryFlip();

    const tl = anime.timeline({
      complete: () => {
        setTimeout(onComplete, 1200);
      }
    });

    tl.add({
      targets: containerRef.current,
      scale: [0.8, 1.1, 1],
      opacity: [0, 1],
      duration: 500,
      easing: 'easeOutElastic(1, .8)'
    })
    .add({
      targets: containerRef.current,
      translateX: [0, -10, 10, -10, 10, 0],
      duration: 400,
      easing: 'easeInOutSine'
    });
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md">
      <div ref={containerRef} className="flex flex-col items-center gap-6 opacity-0">
        <div 
          className="w-32 h-32 rounded-full flex items-center justify-center text-6xl shadow-[0_0_50px_rgba(255,255,255,0.8)] border-8 border-white grayscale filter"
          style={{ backgroundColor: player.color }}
        >
          {player.emoji || player.name.charAt(0).toUpperCase()}
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] uppercase tracking-widest text-center px-4">
          <span className="text-cyan-400">THỜI GIAN ĐÃ DỪNG LẠI!</span><br/>
          {player.name} MẤT LƯỢT!
        </h2>
      </div>
    </div>
  );
};
