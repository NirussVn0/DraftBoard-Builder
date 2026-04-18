import React from 'react';

export const CameraWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="w-full aspect-square max-w-3xl overflow-hidden rounded-lg shadow-xl relative border-4 border-slate-800 bg-slate-900">
      <div id="camera-viewport" className="w-full h-full transform-origin-center">
        {children}
      </div>
    </div>
  );
};
