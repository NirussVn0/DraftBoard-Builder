import React, { useEffect, useRef } from 'react';
import anime from 'animejs';

interface LifebuoyBreakOverlayProps {
  onComplete: () => void;
}

export const LifebuoyBreakOverlay: React.FC<LifebuoyBreakOverlayProps> = ({ onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const shardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const hasAnimated = useRef(false);

  // 8 shards exploding outward
  const SHARDS = Array.from({ length: 8 }, (_, i) => ({
    angle: (i / 8) * 360,
    size: Math.random() * 40 + 20,
  }));

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    // Screen flash
    anime({
      targets: containerRef.current,
      backgroundColor: ['rgba(147,210,255,0.8)', 'rgba(0,0,0,0)'],
      duration: 300,
      easing: 'easeOutQuad',
    });

    // Shards
    shardRefs.current.forEach((shard, i) => {
      if (!shard) return;
      const a = SHARDS[i].angle * (Math.PI / 180);
      anime({
        targets: shard,
        translateX: Math.cos(a) * 200,
        translateY: Math.sin(a) * 200,
        rotate: `${Math.random() * 720}deg`,
        opacity: [1, 0],
        scale: [1, 0.2],
        duration: 800,
        easing: 'easeOutQuad',
        delay: 50,
        complete: i === 0 ? () => setTimeout(onComplete, 400) : undefined,
      });
    });
  }, [onComplete, SHARDS]);

  return (
    <div ref={containerRef} className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="relative w-64 h-64 flex items-center justify-center">
        <span className="text-8xl opacity-0 animate-none">💥</span>
        {SHARDS.map((shard, i) => (
          <div
            key={i}
            ref={el => { shardRefs.current[i] = el; }}
            className="absolute bg-blue-200 border border-blue-400"
            style={{
              width: shard.size,
              height: shard.size * 0.4,
              transform: `rotate(${shard.angle}deg)`,
              clipPath: 'polygon(0 0, 100% 50%, 0 100%)',
              boxShadow: '0 0 10px rgba(147,210,255,0.8)',
            }}
          />
        ))}
        <p className="absolute text-blue-200 font-black text-2xl drop-shadow-[0_0_10px_rgba(147,210,255,1)]">
          🛟 PHAO CỨU SINH VỠ!
        </p>
      </div>
    </div>
  );
};
