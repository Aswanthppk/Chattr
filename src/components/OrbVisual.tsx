import React from 'react';

interface OrbVisualProps {
  size?: 'sm' | 'md' | 'lg';
  showRadar?: boolean;
}

export const OrbVisual: React.FC<OrbVisualProps> = ({ size = 'lg', showRadar = false }) => {
  if (size === 'sm') {
    return (
      <div className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-orb-gradient-end via-orb-gradient-mid to-orb-gradient-start shadow-[0_12px_32px_rgba(117,108,246,0.28)] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-gradient-to-b from-white/60 to-transparent backdrop-blur-[2px] flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
          <span className="material-symbols-outlined text-white text-[20px] drop-shadow-sm">
            bubble_chart
          </span>
        </div>
      </div>
    );
  }

  if (size === 'md') {
    return (
      <div className="relative flex items-center justify-center">
        {/* Glow halo */}
        <div className="absolute -inset-3 rounded-full bg-secondary/15 blur-xl -z-10 animate-pulse" />
        <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-orb-gradient-end via-orb-gradient-mid to-orb-gradient-start shadow-[0_12px_32px_rgba(117,108,246,0.28)] flex items-center justify-center transition-transform duration-500 hover:scale-105">
          <div className="w-14 h-14 rounded-full bg-gradient-to-b from-white/60 to-transparent backdrop-blur-[2px] flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
            <span className="material-symbols-outlined text-surface text-[22px] drop-shadow-sm">
              bubble_chart
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center my-auto py-space-md select-none">
      {/* Radar waves if requested */}
      {showRadar && (
        <>
          <div className="absolute w-72 h-72 rounded-full bg-secondary-fixed/40 blur-2xl pointer-events-none -z-10 animate-pulse" />
          <div className="absolute w-64 h-64 rounded-full bg-surface-container-high/60 pointer-events-none -z-10 scale-95" />
          <div
            className="absolute w-80 h-80 rounded-full bg-secondary-fixed/20 pointer-events-none -z-10 animate-ping"
            style={{ animationDuration: '3.5s' }}
          />
        </>
      )}

      {/* Ambient Diffused Glow Rings */}
      <div
        className="absolute w-72 h-72 rounded-full bg-orb-gradient-start/15 blur-3xl pointer-events-none -z-10 animate-pulse"
        style={{ animationDuration: '4s' }}
      />
      <div className="absolute w-56 h-56 rounded-full bg-orb-gradient-mid/25 blur-2xl pointer-events-none -z-10" />

      {/* Outer Concentric Subtle Ring */}
      <div className="relative flex items-center justify-center p-5 rounded-full bg-surface-container-low/70 shadow-sm transition-transform duration-700 hover:scale-105">
        {/* Glossy 3D Lavender Orb */}
        <div className="relative w-44 h-44 rounded-full shadow-2xl flex items-center justify-center overflow-hidden bg-gradient-to-br from-orb-gradient-start via-orb-gradient-mid to-orb-gradient-end">
          {/* Inner Specular Light & Reflection Sheen */}
          <div className="absolute -top-10 -left-6 w-36 h-36 rounded-full bg-white/45 blur-md pointer-events-none transform -rotate-12" />
          <div className="absolute inset-0 rounded-full shadow-[inset_0_2px_12px_rgba(255,255,255,0.7)] pointer-events-none" />
          <div className="absolute bottom-2 right-4 w-20 h-10 rounded-full bg-secondary-fixed/40 blur-lg pointer-events-none" />
          {/* Dynamic Micro Ambient Wave / Energy Core */}
          <div
            className="w-24 h-24 rounded-full bg-gradient-to-tr from-secondary/30 via-white/20 to-transparent blur-sm animate-orb-spin"
          />
        </div>
      </div>
    </div>
  );
};
