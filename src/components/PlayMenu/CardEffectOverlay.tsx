import React, { useEffect, useRef } from 'react';
import anime from 'animejs';
import type { CardDefinition, CardResolution } from '../../core/CardTypes';

interface CardEffectOverlayProps {
  card: CardDefinition;
  resolution: CardResolution;
  onComplete: () => void;
}

export const CardEffectOverlay: React.FC<CardEffectOverlayProps> = ({ card, resolution, onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const tl = anime.timeline({
      complete: () => {
         setTimeout(onComplete, 1500); // Read time
      }
    });

    if (card.tier === 'RED') {
       tl.add({
         targets: container,
         translateX: [
           { value: -10, duration: 50 },
           { value: 10, duration: 50 },
           { value: -10, duration: 50 },
           { value: 10, duration: 50 },
           { value: 0, duration: 50 }
         ],
         easing: 'easeInOutSine'
       });
    } else if (card.tier === 'GREEN') {
       tl.add({
         targets: container,
         scale: [0.8, 1.1, 1],
         opacity: [0, 1],
         duration: 600,
         easing: 'easeOutElastic(1, .8)'
       });
    } else {
       tl.add({
         targets: container,
         skewX: [20, -20, 10, -10, 0],
         duration: 400,
         easing: 'easeInOutSine'
       });
    }
  }, [card, resolution, onComplete]);

  let memeSrc = '';
  if (card.id === 'DEADLINE_BOMB') memeSrc = '/assets/memes/megumin-explosion.gif';
  if (card.id === 'ZA_WARUDO') memeSrc = '/assets/memes/dio-zawarudo.gif';
  if (card.id === 'AMENOTEJIKARA') memeSrc = '/assets/memes/ninja-teleport.gif';
  if (card.id === 'COUNTER_ARGUMENT') memeSrc = '/assets/memes/meliodas-counter.gif';
  if (card.id === 'NINJA_COPY') memeSrc = '/assets/memes/sasuke-swap.gif';
  if (card.id === 'POP_QUIZ') memeSrc = '/assets/memes/domain-expansion.gif';

  // Fallback styling for the banner
  let bannerColor = 'bg-slate-800 border-slate-500 text-white';
  if (card.tier === 'GREEN') bannerColor = 'bg-emerald-50 border-emerald-500 text-emerald-700';
  if (card.tier === 'RED') bannerColor = 'bg-rose-50 border-rose-500 text-rose-700';
  if (card.tier === 'PURPLE') bannerColor = 'bg-purple-50 border-purple-500 text-purple-700';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
       {card.tier === 'RED' && <div className="absolute inset-0 bg-red-500/20 mix-blend-multiply" />}
       {card.tier === 'PURPLE' && <div className="absolute inset-0 bg-purple-500/20 mix-blend-multiply" />}

       <div ref={containerRef} className="pointer-events-auto flex flex-col items-center gap-6 z-10 w-full max-w-2xl px-4">
          {memeSrc && (
             <img 
               src={memeSrc} 
               alt={card.name} 
               className="w-full h-64 object-cover rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] border-4 border-white/20" 
             />
          )}
          <div className={`w-full backdrop-blur-md p-6 game-card text-center border-4 shadow-2xl ${bannerColor}`}>
             <h3 className="text-3xl font-black uppercase mb-2">
               {card.icon} {card.name} Kích Hoạt!
             </h3>
             <p className="text-xl font-bold opacity-90">
                {resolution.type === 'MOVE' && (
                  <div className={`mt-4 inline-block px-6 py-2 rounded-xl text-white font-black text-2xl shadow-xl ${resolution.steps! > 0 ? 'bg-emerald-500 border-emerald-400' : 'bg-rose-500 border-rose-400'} border-4`}>
                    {resolution.steps! > 0 ? `Tiến ${resolution.steps} bước` : `Lùi ${Math.abs(resolution.steps!)} bước`}
                  </div>
                )}
                {resolution.type === 'BUFF' && `Hiệu ứng: Nhận trạng thái ${resolution.buff?.id}!`}
                {resolution.type === 'TELEPORT' && `Hiệu ứng: Dịch chuyển tức thời!`}
                {resolution.type === 'SWAP' && `Hiệu ứng: Hoán đổi vị trí!`}
                {resolution.type === 'FREEZE' && `Hiệu ứng: Đóng băng ${resolution.freezeTurns} lượt!`}
                {resolution.type === 'QUIZ' && `Hiệu ứng: Bành trướng lãnh địa! Solo 1v1!`}
             </p>
          </div>
       </div>
    </div>
  );
};
