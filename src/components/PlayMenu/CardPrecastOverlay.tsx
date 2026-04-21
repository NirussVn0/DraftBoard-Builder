import React, { useEffect, useRef, useState } from 'react';
import anime from 'animejs';
import { t } from '../../locales';
import { audioService } from '../../services/AudioService';
import type { CardDefinition } from '../../core/CardTypes';

interface CardPrecastOverlayProps {
  card: CardDefinition;
  onComplete: () => void;
}

export const CardPrecastOverlay: React.FC<CardPrecastOverlayProps> = ({ card, onComplete }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const hasAnimated = useRef(false);
  const [showFront, setShowFront] = useState(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const cardEl = cardRef.current;
    if (!cardEl) return;

    const tl = anime.timeline({
      complete: () => {
        setTimeout(() => onComplete(), 1000); // Hold for 1s so user can read
      }
    });

    // 1. Text pop up
    tl.add({
      targets: textRef.current,
      scale: [0, 1],
      opacity: [0, 1],
      duration: 600,
      easing: 'easeOutElastic(1, .8)'
    });

    // 2. Card Flip
    tl.add({
      targets: cardEl,
      rotateY: [-180, 0],
      scale: [0.5, 1.2, 1],
      duration: 800,
      easing: 'easeOutElastic(1, .8)',
      begin: () => setShowFront(false),
      update: (anim) => {
        if (anim.progress > 50 && !showFront) {
          setShowFront(true);
          audioService.playMysteryFlip();
        }
      }
    }, '-=200'); // start slightly before text finishes
  }, [onComplete, showFront]);

  let tierColor = 'bg-slate-800';
  let tierBorder = 'border-slate-400';
  let tierText = 'text-slate-200';
  if (card.tier === 'GREEN') { tierColor = 'bg-emerald-100'; tierBorder = 'border-emerald-500'; tierText = 'text-emerald-700'; }
  if (card.tier === 'RED') { tierColor = 'bg-rose-100'; tierBorder = 'border-rose-500'; tierText = 'text-rose-700'; }
  if (card.tier === 'PURPLE') { tierColor = 'bg-purple-100'; tierBorder = 'border-purple-500'; tierText = 'text-purple-700'; }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md gap-8">
      <h2 ref={textRef} className="text-3xl md:text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] uppercase tracking-widest opacity-0 text-center px-4">
        BẠN ĐÃ RÚT ĐƯỢC THẺ <br/> <span className={tierText}>{card.tier === 'GREEN' ? 'MAY MẮN' : card.tier === 'RED' ? 'XUI XẺO' : 'HỖN MANG'}!</span>
      </h2>

      <div
        ref={cardRef}
        className={`mystery-card-container w-64 h-80 flex flex-col items-center justify-center game-card border-4 ${tierBorder} shadow-2xl`}
        style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
      >
        {showFront ? (
          <div className={`w-full h-full flex flex-col items-center gap-4 ${tierColor} p-6 text-center`}>
            {card.icon.includes('.') ? (
              <img src={card.icon} alt={card.name} className="w-16 h-16 mt-4 object-contain" />
            ) : (
              <span className="text-6xl mt-4">{card.icon}</span>
            )}
            <span className={`text-3xl font-black ${tierText} leading-tight`}>
              {card.name}
            </span>
            <span className="text-sm font-bold text-slate-600 mt-auto">{card.description}</span>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-indigo-900 border-4 border-indigo-500 shadow-inner">
            <span className="text-5xl">✨</span>
            <span className="text-white font-black text-xl tracking-wider">{t().mystery.backLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
};
