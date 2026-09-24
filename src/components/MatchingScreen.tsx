import React, { useEffect, useState } from 'react';
import { Header } from './Header';
import { UserAvatar } from './UserAvatar';
import { UserMatch } from '../types';
import { socketService } from '../services/SocketService';

interface MatchingScreenProps {
  userName: string;
  userInterests: string[];
  blockedUsers: string[];
  onMatchFound: (match: UserMatch) => void;
  onStartChat?: () => void;
  onCancel: () => void;
  currentMatch: UserMatch | null;
}

export const MatchingScreen: React.FC<MatchingScreenProps> = ({
  userName,
  userInterests,
  blockedUsers,
  onMatchFound,
  onStartChat,
  onCancel,
  currentMatch
}) => {
  const [isSearching, setIsSearching] = useState(!currentMatch);
  const [searchTime, setSearchTime] = useState<string>('2.4s');
  const [isSkipping, setIsSkipping] = useState(false);
  const [waitingElapsed, setWaitingElapsed] = useState(0);

  useEffect(() => {
    let timer: number | undefined;
    if (isSearching) {
      setWaitingElapsed(0);
      const start = Date.now();
      timer = window.setInterval(() => {
        setWaitingElapsed(Math.floor((Date.now() - start) / 1000));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isSearching]);

  useEffect(() => {
    if (currentMatch) {
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const startTime = Date.now();

    const cleanup = socketService.findMatch(
      userName || 'Stranger',
      userInterests,
      blockedUsers,
      (payload) => {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        setSearchTime(`${elapsed}s`);
        onMatchFound({ ...payload.partner, roomId: payload.roomId });
        setIsSearching(false);
      }
    );

    return () => {
      cleanup();
    };
  }, [userName, userInterests, blockedUsers, currentMatch]);

  const handleSkip = () => {
    setIsSkipping(true);
    socketService.cancelSearch();
    setTimeout(() => {
      setIsSkipping(false);
      // Re-trigger search
      setIsSearching(true);
      const startTime = Date.now();
      socketService.findMatch(
        userName || 'Stranger',
        userInterests,
        blockedUsers,
        (payload) => {
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
          setSearchTime(`${elapsed}s`);
          onMatchFound({ ...payload.partner, roomId: payload.roomId });
          setIsSearching(false);
        }
      );
    }, 400);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header title="Finding Match" onBack={onCancel} userName={userName} />

      <main className="flex-1 w-full bg-background pt-16 flex flex-col">
        <div className="flex flex-col w-full px-margin pb-safe max-w-md mx-auto flex-1 justify-between">
          {/* Top Utility Bar: Cancel / Re-center */}
          <div className="flex items-center justify-between py-space-sm w-full">
            <button
              type="button"
              aria-label="Cancel search"
              onClick={onCancel}
              className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-text-secondary hover:text-text-primary transition-all active:scale-95 shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low shadow-sm">
              <span className="w-2 h-2 rounded-full bg-state-success animate-ping" />
              <span className="w-2 h-2 rounded-full bg-state-success -ml-3.5" />
              <span className="font-caption text-caption text-text-secondary tracking-wide uppercase font-medium">
                Live Radar
              </span>
            </div>

            <button
              type="button"
              aria-label="Discovery filters"
              className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-text-secondary hover:text-text-primary transition-all active:scale-95 shadow-sm"
            >
              <span className="material-symbols-outlined text-[20px]">tune</span>
            </button>
          </div>

          {/* Orb Stage: Ambient Radar & Dimensional Catalyst */}
          <div className="relative flex flex-col items-center justify-center py-space-md select-none overflow-visible">
            {/* Concentric Ambient Radar Waves */}
            <div className="absolute w-72 h-72 rounded-full bg-secondary-fixed/40 blur-2xl pointer-events-none -z-10 animate-pulse" />
            <div className="absolute w-64 h-64 rounded-full bg-surface-container-high/60 pointer-events-none -z-10 scale-95" />
            <div
              className="absolute w-80 h-80 rounded-full bg-secondary-fixed/20 pointer-events-none -z-10 animate-ping"
              style={{ animationDuration: '3.5s' }}
            />

            {/* Center Glossy Orb */}
            <div className="relative w-44 h-44 rounded-full flex items-center justify-center p-2 shadow-2xl">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-orb-gradient-end via-orb-gradient-mid to-orb-gradient-start opacity-70 blur-xl" />
              <div className="relative w-40 h-40 rounded-full shadow-2xl flex items-center justify-center overflow-hidden bg-gradient-to-br from-orb-gradient-start via-orb-gradient-mid to-orb-gradient-end transition-transform duration-700 hover:scale-105">
                <div className="absolute -top-10 -left-6 w-36 h-36 rounded-full bg-white/45 blur-md pointer-events-none transform -rotate-12" />
                <div className="absolute inset-0 rounded-full shadow-[inset_0_2px_12px_rgba(255,255,255,0.7)] pointer-events-none" />
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-secondary/30 via-white/20 to-transparent blur-sm animate-orb-spin" />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                  <UserAvatar name={userName || 'Chattr'} size="lg" className="scale-110 shadow-lg border-2 border-white/60" />
                </div>
              </div>

              {/* Sparkle Orbit Ping */}
              <div className="absolute top-2 right-4 w-6 h-6 rounded-full bg-surface flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-[14px] text-secondary">
                  auto_awesome
                </span>
              </div>
            </div>

            {/* Status Headline & Micro-Telemetry */}
            <div className="text-center mt-space-md z-10">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant mb-1.5 shadow-sm">
                <span className="material-symbols-outlined text-[14px]">
                  {isSearching ? 'radar' : 'bolt'}
                </span>
                <span className="font-label-sm text-label-sm">
                  {isSearching
                    ? `Searching live queue (${waitingElapsed}s)...`
                    : `Found in ${searchTime}`}
                </span>
              </div>
              <h2 className="font-display-hero-mobile text-display-hero-mobile text-text-primary tracking-tight font-semibold">
                {isSearching ? 'Finding someone...' : "Someone's here!"}
              </h2>
              <p className="font-body-sm text-body-sm text-text-secondary mt-0.5">
                {isSearching
                  ? 'Waiting for a real person with similar interests in Orbit.'
                  : 'Matched around shared curiosity & perspectives'}
              </p>
            </div>
          </div>

          {/* Match Reveal Card or Waiting Card */}
          {isSearching ? (
            <div className="w-full bg-surface rounded-xl p-space-md shadow-sm border border-border-subtle flex flex-col items-center justify-center min-h-[160px] mb-space-lg text-center gap-2">
              <div className="w-8 h-8 rounded-full border-2 border-secondary border-t-transparent animate-spin" />
              <span className="font-caption text-caption text-text-primary font-medium">
                Live matchmaking active
              </span>
              <span className="font-caption text-caption text-text-muted max-w-[280px]">
                Connecting with the next available person in the queue...
              </span>
            </div>
          ) : currentMatch ? (
            <div className="w-full bg-surface rounded-xl p-space-md shadow-xl transition-all relative overflow-hidden mb-space-lg animate-in fade-in zoom-in-95 duration-300">
              {/* Subtle Background Shimmer Gradient */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-secondary-fixed/30 to-transparent rounded-bl-full pointer-events-none" />

              <div className="flex items-start gap-space-md">
                {/* Mini Initial Avatar with Presence Glow */}
                <UserAvatar name={currentMatch.name} size="lg" showOnlineDot isOnline />

                {/* Identity & Mutual Anchor */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-headline-sm text-headline-sm text-text-primary truncate font-semibold">
                        {currentMatch.name}
                      </h3>
                      <span className="text-body-md" title={currentMatch.country}>
                        {currentMatch.flag}
                      </span>
                    </div>
                    <span className="font-caption text-caption text-text-muted">Just now</span>
                  </div>

                  <p className="font-body-sm text-body-sm text-state-success flex items-center gap-1 mt-0.5 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-state-success animate-pulse" />
                    {currentMatch.status}
                  </p>

                  {/* Topic Tags / Shared Resonance */}
                  <div className="mt-space-sm pt-space-xs flex flex-wrap gap-1.5">
                    {currentMatch.interests.slice(0, 2).map((topic) => (
                      <div
                        key={topic}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[13px]">
                          {topic.toLowerCase() === 'technology' ? 'code' : 'theaters'}
                        </span>
                        <span className="font-label-sm text-label-sm">{topic}</span>
                      </div>
                    ))}
                    {currentMatch.interests.length > 2 && (
                      <div className="px-2 py-1 rounded-full bg-surface-container text-text-secondary font-label-sm text-label-sm">
                        +{currentMatch.interests.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Serendipity Icebreaker Prompt Capsule */}
              <div className="mt-space-md p-space-sm rounded-lg bg-surface-container-low flex items-start gap-space-sm">
                <span className="material-symbols-outlined text-[18px] text-secondary shrink-0 mt-0.5">
                  forum
                </span>
                <p className="font-body-sm text-body-sm text-text-secondary">
                  <strong className="text-text-primary font-medium">Icebreaker:</strong>{' '}
                  "{currentMatch.icebreaker}"
                </p>
              </div>
            </div>
          ) : null}

          {/* Bottom Interactive CTA Stack */}
          <div className="flex flex-col gap-space-sm w-full mt-auto pb-space-sm">
            <button
              id="start-chat-cta"
              type="button"
              disabled={isSearching || !currentMatch}
              onClick={onStartChat}
              className={`w-full h-14 rounded-full bg-primary text-on-primary font-label-md text-label-md flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-[0.98] hover:bg-surface-dark cursor-pointer ${
                isSearching || !currentMatch ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              <span>Start Chat</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>

            <button
              id="skip-cta"
              type="button"
              disabled={isSearching}
              onClick={handleSkip}
              className="w-full h-12 rounded-full bg-surface text-text-primary font-label-md text-label-md flex items-center justify-center gap-1.5 shadow-sm transition-all hover:bg-surface-container-low active:scale-[0.98] cursor-pointer"
            >
              <span
                className={`material-symbols-outlined text-[18px] text-text-secondary ${
                  isSkipping ? 'rotate-180 transition-transform duration-300' : ''
                }`}
              >
                refresh
              </span>
              <span>Skip & Find Another</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
