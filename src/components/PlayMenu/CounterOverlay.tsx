import React, { useEffect, useRef } from 'react';
import anime from 'animejs';

interface CounterOverlayProps {
  onComplete: () => void;
}

export const CounterOverlay: React.FC<CounterOverlayProps> = ({ onComplete }) => {
  const beamRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const tl = anime.timeline({ complete: () => setTimeout(onComplete, 300) });

    // Screen shake via container
    tl.add({
      targets: document.body,
      translateX: [
        { value: -15, duration: 60 },
        { value: 15, duration: 60 },
        { value: -10, duration: 60 },
        { value: 10, duration: 60 },
        { value: 0, duration: 60 },
      ],
      easing: 'easeInOutSine',
    });

    // Beam flash
    tl.add({
      targets: beamRef.current,
      scaleY: [0, 1],
      opacity: [0, 1, 0],
      duration: 600,
      easing: 'easeOutQuad',
    }, 0);

    // Text pop
    tl.add({
      targets: textRef.current,
      scale: [0, 1.3, 1],
      opacity: [0, 1],
      duration: 500,
      easing: 'easeOutElastic(1, .8)',
    }, '-=400');

    // Auto-hide after 4 seconds (instead of 1.2s)
    tl.add({
      targets: textRef.current,
      opacity: 0,
      duration: 300,
      delay: 4000,
    });
  }, [onComplete]);

  const finishAnimation = () => {
    anime.remove(textRef.current);
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none overflow-hidden">
      <div 
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-0 pointer-events-auto cursor-pointer" 
        onClick={finishAnimation}
        title="Bấm để bỏ qua"
      />
      {/* Beam */}
      <div ref={beamRef}
        className="absolute inset-0 opacity-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, rgba(234,179,8,0.3) 50%, transparent 100%)',
          transformOrigin: 'center',
        }}
      />

      <div ref={textRef} className="z-10 flex flex-col items-center justify-center w-full max-w-5xl px-4 gap-6 opacity-0 pointer-events-auto">
        <h2 className="text-5xl md:text-7xl font-black text-yellow-300 drop-shadow-[0_0_20px_rgba(253,224,71,0.8)] text-center">
          BẬT THẦY / PHẢN BIỆN!
        </h2>
        
        {/* Media Frame */}
        <div className="relative p-2 md:p-3 bg-white/10 backdrop-blur-md rounded-2xl md:rounded-3xl shadow-2xl border border-white/20 inline-flex items-center justify-center max-w-full max-h-[50vh]">
           <img 
              src="/assets/memes/meliodas-counter.gif"
              alt="Counter"
              className="max-w-full max-h-[50vh] w-auto h-auto object-contain rounded-xl md:rounded-2xl shadow-inner bg-black/40"
           />
        </div>

        <p className="text-white font-bold text-2xl md:text-4xl text-center drop-shadow-md bg-black/50 px-6 py-3 rounded-full border border-white/20">
          Sát thương bị bắn ngược lại!
        </p>
      </div>
    </div>
  );
};
