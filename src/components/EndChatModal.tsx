import React from 'react';
import { UserMatch } from '../types';
import { UserAvatar } from './UserAvatar';

interface EndChatModalProps {
  isOpen: boolean;
  match: UserMatch;
  onClose: () => void;
  onEndChat: () => void;
  onReport: () => void;
  onBlock: () => void;
  onStartAnother: () => void;
  onReturnHome: () => void;
}

export const EndChatModal: React.FC<EndChatModalProps> = ({
  isOpen,
  match,
  onClose,
  onEndChat,
  onReport,
  onBlock,
  onStartAnother,
  onReturnHome
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex flex-col justify-end">
      {/* Ambient Backdrop Scrim */}
      <div
        id="modal-scrim"
        onClick={onClose}
        className="fixed inset-0 bg-primary/25 backdrop-blur-[6px] z-40 transition-opacity duration-300 animate-in fade-in"
      />

      {/* Primary Safety & Reconnection Card Modal */}
      <div
        id="sheet-container"
        className="relative z-50 flex flex-col justify-end max-w-lg mx-auto w-full transition-transform duration-300 ease-out animate-in slide-in-from-bottom duration-300"
      >
        <div className="bg-surface rounded-t-xl shadow-[0_24px_64px_-12px_rgba(17,17,17,0.18),0_8px_20px_-6px_rgba(17,17,17,0.06)] px-margin pt-space-sm pb-safe flex flex-col gap-space-lg max-h-[90vh] overflow-y-auto no-scrollbar">
          {/* Tactile Drag Handle */}
          <div className="w-full flex items-center justify-center pt-space-xs cursor-grab active:cursor-grabbing">
            <div className="w-10 h-1 bg-surface-container-highest rounded-full" />
          </div>

          {/* Header & Context */}
          <div className="flex items-center justify-between px-space-xs">
            <div className="flex items-center gap-space-sm">
              <UserAvatar name={match.name} size="sm" />
              <div>
                <h2 className="font-headline-sm text-headline-sm text-text-primary font-semibold">
                  Chat with {match.name}
                </h2>
                <p className="font-caption text-caption text-text-muted mt-0.5">
                  Choose an action or quietly wrap up your session
                </p>
              </div>
            </div>
            <button
              id="btn-close-modal"
              type="button"
              aria-label="Close dialog"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          {/* Action Menu Rows */}
          <div className="flex flex-col gap-space-xs">
            {/* 🛑 End Chat */}
            <button
              id="btn-end-chat"
              type="button"
              onClick={onEndChat}
              className="w-full flex items-center justify-between p-space-md rounded-DEFAULT bg-surface-container-low hover:bg-surface-container active:scale-[0.99] transition-all group text-left cursor-pointer"
            >
              <div className="flex items-center gap-space-md">
                <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-state-danger shadow-sm group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[20px]">stop_circle</span>
                </div>
                <div>
                  <span className="font-label-md text-label-md text-state-danger block font-semibold">
                    End Chat
                  </span>
                  <span className="font-caption text-caption text-text-muted">
                    Safely disconnect from this exchange
                  </span>
                </div>
              </div>
              <span className="material-symbols-outlined text-text-muted group-hover:translate-x-0.5 transition-transform text-[20px]">
                chevron_right
              </span>
            </button>

            {/* ⚠️ Report Row */}
            <button
              id="btn-report"
              type="button"
              onClick={onReport}
              className="w-full flex items-center justify-between p-space-md rounded-DEFAULT bg-surface-container-low hover:bg-surface-container active:scale-[0.99] transition-all group text-left cursor-pointer"
            >
              <div className="flex items-center gap-space-md">
                <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-text-secondary shadow-sm group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[20px]">flag</span>
                </div>
                <div>
                  <span className="font-label-md text-label-md text-text-primary block font-medium">
                    Report inappropriate behavior
                  </span>
                  <span className="font-caption text-caption text-text-muted">
                    Flag harassment, spam, or unsafe conduct
                  </span>
                </div>
              </div>
              <span className="material-symbols-outlined text-text-muted group-hover:translate-x-0.5 transition-transform text-[20px]">
                chevron_right
              </span>
            </button>

            {/* 🚫 Block User Row */}
            <button
              id="btn-block"
              type="button"
              onClick={onBlock}
              className="w-full flex items-center justify-between p-space-md rounded-DEFAULT bg-surface-container-low hover:bg-surface-container active:scale-[0.99] transition-all group text-left cursor-pointer"
            >
              <div className="flex items-center gap-space-md">
                <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-text-secondary shadow-sm group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[20px]">block</span>
                </div>
                <div>
                  <span className="font-label-md text-label-md text-text-primary block font-medium">
                    Block {match.name}
                  </span>
                  <span className="font-caption text-caption text-text-muted">
                    Never encounter this participant in Chattr. again
                  </span>
                </div>
              </div>
              <span className="material-symbols-outlined text-text-muted group-hover:translate-x-0.5 transition-transform text-[20px]">
                chevron_right
              </span>
            </button>
          </div>

          {/* Subtle Divider Line */}
          <div className="w-full h-px bg-surface-container-high my-space-xs" />

          {/* Next Steps & Serendipity Reconnection Card */}
          <div className="bg-surface-container-low rounded-lg p-space-lg flex flex-col items-center text-center relative overflow-hidden mb-space-sm">
            {/* Diffused Atmospheric Glow */}
            <div className="absolute -top-12 w-32 h-32 rounded-full bg-orb-gradient-mid/40 blur-2xl pointer-events-none" />

            {/* Glowing Mini Orb */}
            <div
              className="relative z-10 w-14 h-14 rounded-full mb-space-sm flex items-center justify-center shadow-[0_16px_36px_rgba(117,108,246,0.35)]"
              style={{
                background:
                  'radial-gradient(circle at 35% 30%, #C9C8FF 0%, #8D8BFF 45%, #6D72E8 100%)'
              }}
            >
              <div className="w-full h-full rounded-full shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.85)] flex items-center justify-center">
                <div className="w-2.5 h-1.5 rounded-full bg-white/70 -translate-y-3 -translate-x-2 blur-[0.5px]" />
              </div>
            </div>

            {/* Reconnection Copy */}
            <h3 className="font-headline-sm text-headline-sm text-text-primary mb-space-xs relative z-10 font-semibold">
              Want to meet someone else?
            </h3>
            <p className="font-body-sm text-body-sm text-text-secondary max-w-[280px] mb-space-lg relative z-10">
              Your topic preferences are active. We can match you with another curious stranger in
              seconds.
            </p>

            {/* CTAs */}
            <div className="w-full flex flex-col gap-space-sm relative z-10">
              <button
                id="btn-start-another"
                type="button"
                onClick={onStartAnother}
                className="w-full h-[52px] rounded-full bg-primary text-on-primary font-label-md text-label-md font-medium flex items-center justify-center gap-space-sm shadow-[0_4px_14px_rgba(17,17,17,0.14)] hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>Start Another Chat</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>

              <button
                id="btn-return-home"
                type="button"
                onClick={onReturnHome}
                className="w-full py-space-sm text-text-secondary hover:text-text-primary font-label-md text-label-md transition-colors cursor-pointer"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
