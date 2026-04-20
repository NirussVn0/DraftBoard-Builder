import React, { useState } from 'react';
import { Heart } from 'lucide-react';

export const CreatorTag: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <a 
      href="https://github.com/NirussVn0" 
      target="_blank" 
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 z-[999] flex items-center gap-2 px-3 py-2 bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md rounded-xl shadow-lg border border-white/10 text-white transition-all duration-300 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col items-end">
        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider leading-none mb-1">DEV by</span>
        <span className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 leading-none">NirussVn0</span>
      </div>
      <div className="relative">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-slate-300 group-hover:text-white transition-colors">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
        
        {/* Flying Hearts */}
        <div className="absolute left-1/2 -top-2 pointer-events-none">
          {isHovered && (
            <>
              <Heart size={14} className="absolute text-rose-500 fill-rose-500 animate-fly-heart" style={{ left: '-10px', top: '0', animationDelay: '0s' }} />
              <Heart size={10} className="absolute text-pink-400 fill-pink-400 animate-fly-heart" style={{ left: '5px', top: '5px', animationDelay: '0.2s' }} />
              <Heart size={12} className="absolute text-rose-400 fill-rose-400 animate-fly-heart" style={{ left: '-2px', top: '2px', animationDelay: '0.4s' }} />
            </>
          )}
        </div>
      </div>
    </a>
  );
};
