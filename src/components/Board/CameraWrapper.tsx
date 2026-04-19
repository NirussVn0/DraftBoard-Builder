import React from 'react';

export const CameraWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div id="board-container" className="w-full h-full relative">
      <div id="camera-viewport" className="w-full h-full" style={{ transformOrigin: 'center' }}>
        {children}
      </div>
    </div>
  );
};
