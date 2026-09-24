import React from 'react';
import { UserAvatar } from './UserAvatar';

interface HeaderProps {
  title?: string;
  onBack?: () => void;
  showBack?: boolean;
  userName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onBack,
  showBack = true,
  userName = ''
}) => {
  return (
    <header className="fixed top-0 w-full z-50 pt-safe bg-background/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-16 px-gutter flex items-center justify-between max-w-lg mx-auto">
        <div className="flex items-center gap-space-sm">
          {showBack && onBack && (
            <button
              aria-label="Go Back"
              className="w-11 h-11 flex items-center justify-center rounded-full text-text-primary hover:bg-surface-container transition-colors cursor-pointer"
              onClick={onBack}
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
          )}

          {/* Mini Orb Emblem Logo */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orb-gradient-end via-orb-gradient-mid to-orb-gradient-start p-0.5 shadow-sm flex items-center justify-center shrink-0">
            <div className="w-full h-full rounded-full bg-white/30 backdrop-blur-xs flex items-center justify-center shadow-[inset_0_1px_2px_rgba(255,255,255,0.8)]">
              <div className="w-2 h-2 rounded-full bg-white/90" />
            </div>
          </div>

          <span className="font-headline-sm text-headline-sm text-text-primary ml-1 font-bold tracking-tight">
            Chattr<span className="text-secondary">.</span>
          </span>
        </div>

        <div className="flex items-center gap-space-sm">
          {title && (
            <span className="font-label-md text-label-md text-text-secondary hidden sm:block">
              {title}
            </span>
          )}

          {userName ? (
            <UserAvatar name={userName} size="sm" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
