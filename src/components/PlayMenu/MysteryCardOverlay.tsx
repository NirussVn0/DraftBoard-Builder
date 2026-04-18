import React, { useEffect, useRef, useState } from 'react';
import anime from 'animejs';
import { t } from '../../locales';
import { audioService } from '../../services/AudioService';

interface MysteryCardOverlayProps {
  mysteryValue: number;
  onComplete: () => void;
}

export const MysteryCardOverlay: React.FC<MysteryCardOverlayProps> = ({
  mysteryValue, onComplete
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);
  const [showFront, setShowFront] = useState(false);

  const label = t().mystery.stepsLabel(mysteryValue);
  const isPositive = mysteryValue > 0;

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const cardEl = cardRef.current;
    if (!cardEl) return;

    // CEO-mandated anime.js 3D flip config
    anime({
      targets: cardEl,
      rotateY: [-180, 0],
      scale: [0.5, 1.2, 1],
      duration: 800,
      easing: 'easeOutElastic(1, .8)',
      begin: () => {
        // Card starts face-down (back visible)
        setShowFront(false);
      },
      update: (anim) => {
        // Swap to front face at ~90 degrees (halfway through flip)
        if (anim.progress > 50 && !showFront) {
          setShowFront(true);
          audioService.playMysteryFlip();
        }
      },
      complete: () => {
        setShowFront(true);
        // Wait 1.5s, then remove overlay
        setTimeout(() => {
          onComplete();
        }, 1500);
      }
    });
  }, [mysteryValue, onComplete, showFront]);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div
        ref={cardRef}
        className="mystery-card-container w-64 h-80 flex items-center justify-center game-card border-2 border-slate-300"
        style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
      >
        {showFront ? (
          /* Front face — shows the mystery result */
          <div className={`w-full h-full flex flex-col items-center justify-center gap-4 ${isPositive ? 'bg-emerald-50' : 'bg-rose-50'}`}>
            <span className="text-6xl">{isPositive ? '🎉' : '💀'}</span>
            <span className={`text-3xl font-black ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
              {label}
            </span>
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t().mystery.title}</span>
          </div>
        ) : (
          /* Back face — card face-down */
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-purple-600">
            <span className="text-5xl">✨</span>
            <span className="text-white font-black text-xl tracking-wider">{t().mystery.backLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
};
