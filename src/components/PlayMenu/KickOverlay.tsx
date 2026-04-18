import React, { useEffect, useRef } from 'react';
import anime from 'animejs';
import { t } from '../../locales';
import { audioService } from '../../services/AudioService';
import type { KickEvent, Player } from '../../core/GameState';

interface KickOverlayProps {
  kickEvent: KickEvent;
  players: Player[];
  onComplete: () => void;
}

export const KickOverlay: React.FC<KickOverlayProps> = ({ kickEvent, players, onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  const kicker = players.find(p => p.id === kickEvent.kickerPlayerId);
  const kicked = players.find(p => p.id === kickEvent.kickedPlayerId);
  const steps = kickEvent.kickedFromPosition - kickEvent.kickedToPosition;

  useEffect(() => {
    if (hasAnimated.current || !containerRef.current) return;
    hasAnimated.current = true;

    const tl = anime.timeline({ easing: 'easeOutElastic(1, .6)' });

    // Impact burst
    tl.add({
      targets: containerRef.current.querySelector('.kick-impact'),
      scale: [0, 1.3, 1],
      opacity: [0, 1],
      duration: 600,
      easing: 'easeOutBack',
      begin: () => { audioService.playKick(); },
    });

    // Text slide in
    tl.add({
      targets: containerRef.current.querySelector('.kick-text'),
      translateY: [40, 0],
      opacity: [0, 1],
      duration: 400,
      easing: 'easeOutCubic',
    }, '-=300');

    // Hold then fade
    tl.add({
      targets: containerRef.current,
      opacity: [1, 0],
      duration: 400,
      delay: 1200,
      easing: 'easeInCubic',
      complete: () => onComplete(),
    });
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20 backdrop-blur-sm" ref={containerRef}>
      <div className="flex flex-col items-center gap-4">
        {/* Impact burst emoji */}
        <div className="kick-impact text-8xl opacity-0" style={{ transform: 'scale(0)' }}>
          💥
        </div>

        {/* Kick message */}
        <div
          className="kick-text bg-white game-card px-8 py-4 text-center opacity-0"
          style={{ borderLeft: `4px solid ${kicker?.color || '#6366f1'}` }}
        >
          <p className="text-lg font-black text-slate-800">
            {kicker && kicked
              ? t().kick.message(kicker.name, kicked.name, steps)
              : 'KICK!'
            }
          </p>
        </div>
      </div>
    </div>
  );
};
