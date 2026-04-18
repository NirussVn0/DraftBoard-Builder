import React, { useEffect, useRef } from 'react';
import anime from 'animejs';

interface DiceResultBannerProps {
  value: number;
  activeColor: string;
}

/**
 * DiceResultBanner — slides in from bottom AFTER the dice lands.
 * Only responsible for displaying the final number.
 */
export const DiceResultBanner: React.FC<DiceResultBannerProps> = ({ value, activeColor }) => {
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bannerRef.current) return;

    anime({
      targets: bannerRef.current,
      translateY: [40, 0],
      opacity: [0, 1],
      duration: 300,
      easing: 'easeOutCubic',
    });
  }, []);

  return (
    <div
      ref={bannerRef}
      className="bg-white game-card px-6 py-3 text-center opacity-0"
      style={{ borderTop: `3px solid ${activeColor}` }}
    >
      <span className="text-5xl font-black" style={{ color: activeColor }}>
        {value}
      </span>
    </div>
  );
};
