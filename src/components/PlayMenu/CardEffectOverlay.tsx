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
  const hasAnimated = useRef(false);
  let memeSrc = '';
  if (card.id === 'DEADLINE_BOMB') memeSrc = '/assets/memes/megumin-explosion.gif';
  if (card.id === 'ZA_WARUDO') memeSrc = '/assets/memes/dio-zawarudo.mp4';
  if (card.id === 'AMENOTEJIKARA') memeSrc = '/assets/memes/isekai.gif';
  if (card.id === 'COUNTER_ARGUMENT') memeSrc = '/assets/memes/meliodas-counter.gif';
  if (card.id === 'BLACKOUT') memeSrc = '/assets/memes/blackout.gif';
  if (card.id === 'POP_QUIZ') memeSrc = '/assets/memes/domain-expansion.gif';

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const container = containerRef.current;
    if (!container) return;

    const tl = anime.timeline({
      complete: () => {
         setTimeout(onComplete, memeSrc ? 3500 : 1500); // Read time longer if meme
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
  }, [card, resolution, onComplete, memeSrc]);

  // Fallback styling for the banner
  let bannerColor = 'bg-slate-800 border-slate-500 text-white';
  if (card.tier === 'GREEN') bannerColor = 'bg-emerald-50 border-emerald-500 text-emerald-700';
  if (card.tier === 'RED') bannerColor = 'bg-rose-50 border-rose-500 text-rose-700';
  if (card.tier === 'PURPLE') bannerColor = 'bg-purple-50 border-purple-500 text-purple-700';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
       {memeSrc && memeSrc.match(/\.(mp4|webm)$/i) ? (
         <video 
           src={memeSrc} 
           autoPlay 
           loop 
           playsInline
           className="fixed inset-0 w-full h-full object-cover z-0" 
         />
       ) : memeSrc ? (
         <img 
           src={memeSrc} 
           alt={card.name} 
           className="fixed inset-0 w-full h-full object-cover z-0" 
         />
       ) : null}
       {card.tier === 'RED' && <div className="absolute inset-0 bg-red-500/40 mix-blend-multiply z-0" />}
       {card.tier === 'PURPLE' && <div className="absolute inset-0 bg-purple-500/40 mix-blend-multiply z-0" />}

       <div ref={containerRef} className="pointer-events-auto relative z-10 flex flex-col items-center justify-end pb-20 w-full h-full px-4">
          <div className={`w-full max-w-2xl backdrop-blur-md p-6 rounded-3xl text-center border-4 shadow-2xl animate-bounce-slight ${bannerColor}`}>
             <h3 className="text-3xl font-black uppercase mb-2">
               {card.icon} {card.name} Kích Hoạt!
             </h3>
             <div className="text-xl font-bold opacity-90">
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
             </div>
          </div>
       </div>
    </div>
  );
};
