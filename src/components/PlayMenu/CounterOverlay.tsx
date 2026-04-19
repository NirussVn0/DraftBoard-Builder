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

    tl.add({
      targets: textRef.current,
      opacity: 0,
      duration: 300,
      delay: 1200,
    });
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none overflow-hidden">
      {/* Beam */}
      <div ref={beamRef}
        className="absolute inset-0 opacity-0"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, rgba(234,179,8,0.3) 50%, transparent 100%)',
          transformOrigin: 'center',
        }}
      />
      {/* Red flash border */}
      <div className="absolute inset-0 border-8 border-rose-500 opacity-60" />

      <div ref={textRef} className="z-10 flex flex-col items-center gap-3 opacity-0">
        <span className="text-7xl">🪞</span>
        <h2 className="text-5xl font-black text-yellow-300 drop-shadow-[0_0_20px_rgba(253,224,71,0.8)]">
          BẬT THẦY / PHẢN BIỆN!
        </h2>
        <p className="text-white font-bold text-xl">Sát thương bị bắn ngược lại!</p>
      </div>
    </div>
  );
};
