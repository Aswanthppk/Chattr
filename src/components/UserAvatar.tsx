import React from 'react';

interface UserAvatarProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showOnlineDot?: boolean;
  isOnline?: boolean;
  className?: string;
}

// Deterministic pastel/vibrant gradient generator based on character/name
const GRADIENTS = [
  'from-[#6D72E8] via-[#8D8BFF] to-[#C9C8FF]', // Stitch Lavender
  'from-[#5146d0] via-[#7064f2] to-[#b6afff]', // Royal Violet
  'from-[#3b82f6] via-[#60a5fa] to-[#bfdbfe]', // Sky Indigo
  'from-[#10b981] via-[#34d399] to-[#a7f3d0]', // Emerald Mint
  'from-[#8b5cf6] via-[#a78bfa] to-[#ddd6fe]', // Soft Purple
  'from-[#ec4899] via-[#f472b6] to-[#fbcfe8]', // Rose Petal
];

function getGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENTS.length;
  return GRADIENTS[index];
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  size = 'sm',
  showOnlineDot = false,
  isOnline = true,
  className = ''
}) => {
  const initial = (name || '?').trim().charAt(0).toUpperCase();
  const gradient = getGradient(name || 'Chattr');

  const sizeClasses = {
    xs: 'w-6 h-6 text-[11px] font-semibold',
    sm: 'w-9 h-9 text-[14px] font-semibold',
    md: 'w-10 h-10 text-[16px] font-bold',
    lg: 'w-14 h-14 text-[22px] font-bold',
  }[size];

  const dotClasses = {
    xs: 'w-2 h-2 -bottom-0.5 -right-0.5',
    sm: 'w-2.5 h-2.5 bottom-0 right-0',
    md: 'w-3 h-3 bottom-0 right-0',
    lg: 'w-3.5 h-3.5 -bottom-0.5 -right-0.5',
  }[size];

  return (
    <div className={`relative shrink-0 flex items-center justify-center select-none ${className}`}>
      <div
        className={`${sizeClasses} rounded-full bg-gradient-to-tr ${gradient} text-white flex items-center justify-center shadow-sm border border-white/40 tracking-wider font-sans`}
      >
        <span className="drop-shadow-xs leading-none">{initial}</span>
      </div>

      {showOnlineDot && (
        <span
          className={`absolute rounded-full ring-2 ring-surface ${dotClasses} ${
            isOnline ? 'bg-state-success' : 'bg-text-muted'
          }`}
        />
      )}
    </div>
  );
};
