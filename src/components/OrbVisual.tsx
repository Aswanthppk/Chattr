import React from 'react';

interface OrbVisualProps {
  size?: 'sm' | 'md' | 'lg';
  showRadar?: boolean;
}

export const OrbVisual: React.FC<OrbVisualProps> = ({ size = 'lg', showRadar = false }) => {
  if (size === 'sm') {
    return (
      <div className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-orb-gradient-end via-orb-gradient-mid to-orb-gradient-start shadow-[0_8px_20px_rgba(117,108,246,0.22)] flex items-center justify-center">
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
        {/* Soft ambient glow */}
        <div className="absolute -inset-2 rounded-full bg-secondary/10 blur-lg -z-10" />
        <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-orb-gradient-end via-orb-gradient-mid to-orb-gradient-start shadow-[0_8px_24px_rgba(117,108,246,0.22)] flex items-center justify-center animate-orb-breathe">
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
    <div className="relative flex flex-col items-center justify-center my-auto py-space-md select-none w-full max-w-sm">
      {/* Optional Radar waves (only when matchmaking / showRadar explicitly active) */}
      {showRadar && (
        <div
          className="absolute w-52 h-52 rounded-full border border-secondary/25 pointer-events-none -z-10 animate-radar"
        />
      )}

      {/* Extremely subtle ambient bloom */}
      <div
        className="absolute w-56 h-56 rounded-full bg-orb-gradient-mid/20 blur-2xl pointer-events-none -z-10"
      />

      {/* Outer subtle concentric container disc from Stitch source */}
      <div className="relative flex items-center justify-center p-5 rounded-full bg-surface-container-low/60 shadow-xs">
        {/*
          Heartbeat Ripple Effect:
          - Starts exactly at orb's outer edge (w-44 h-44)
          - Expands smoothly: scale 1.00 -> 1.18
          - Opacity: 0.16 -> 0
          - Extremely soft and blurred
          - One single wave per heartbeat cycle
        */}
        <div
          aria-hidden="true"
          className="absolute w-44 h-44 rounded-full pointer-events-none animate-orb-ripple border border-orb-gradient-start/35 bg-orb-gradient-mid/10 blur-[4px]"
        />

        {/*
          Glossy 3D Lavender Orb:
          - Continuous, slow breathing animation: scale 1.00 -> 1.035 -> 1.00 over 4.5s
          - Subtle internal light brightening & softening on expansion
          - Existing Chattr lavender/periwinkle gradient & sheen
        */}
        <div
          className="relative w-44 h-44 rounded-full shadow-2xl flex items-center justify-center overflow-hidden bg-gradient-to-br from-orb-gradient-start via-orb-gradient-mid to-orb-gradient-end animate-orb-breathe"
          style={{ willChange: 'transform, filter' }}
        >
          {/* Inner Specular Light & Reflection Sheen */}
          <div className="absolute -top-10 -left-6 w-36 h-36 rounded-full bg-white/45 blur-md pointer-events-none transform -rotate-12" />
          <div className="absolute inset-0 rounded-full shadow-[inset_0_2px_12px_rgba(255,255,255,0.7)] pointer-events-none" />
          <div className="absolute bottom-2 right-4 w-20 h-10 rounded-full bg-secondary-fixed/40 blur-lg pointer-events-none" />

          {/* Internal Lavender Light (Gentle bloom synchronized with the expansion breath) */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/15 via-orb-gradient-mid/25 to-transparent blur-sm pointer-events-none animate-orb-bloom" />
        </div>
      </div>
    </div>
  );
};
