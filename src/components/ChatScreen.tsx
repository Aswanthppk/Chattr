import React, { useEffect, useRef, useState } from 'react';
import { Header } from './Header';
import { EndChatModal } from './EndChatModal';
import { UserAvatar } from './UserAvatar';
import { ChatMessage, UserMatch } from '../types';
import { socketService } from '../services/SocketService';

interface ChatScreenProps {
  match: UserMatch;
  userName: string;
  userInterests: string[];
  onEndChat: () => void;
  onBlockUser: (userId: string) => void;
  onStartAnotherChat: () => void;
  onReturnHome: () => void;
}

const STARTER_PROMPTS = [
  'Where are you from?',
  'What are you into?',
  'Favorite movie?',
  'Sci-Fi or Noir?'
];

export const ChatScreen: React.FC<ChatScreenProps> = ({
  match,
  userName,
  userInterests,
  onEndChat,
  onBlockUser,
  onStartAnotherChat,
  onReturnHome
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSafetySheet, setShowSafetySheet] = useState(false);
  const [isEndModalOpen, setIsEndModalOpen] = useState(false);
  const [partnerLeft, setPartnerLeft] = useState(false);

  const streamEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<number | undefined>(undefined);

  const scrollToBottom = () => {
    streamEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!match.roomId) return;

    // Join real-time room
    const cleanup = socketService.joinChatRoom(
      match.roomId,
      (incomingMsg) => {
        setMessages((prev) => [...prev, incomingMsg]);
      },
      (typing) => {
        setIsTyping(typing);
      },
      () => {
        setPartnerLeft(true);
      }
    );

    return () => {
      cleanup();
    };
  }, [match.roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, partnerLeft]);

  const handleSend = (textToSend?: string) => {
    const text = (textToSend ?? inputText).trim();
    if (!text) return;

    const userMsg = socketService.sendMessage(text, userName || 'Me');
    setMessages((prev) => [...prev, userMsg]);

    socketService.sendTyping(false);
    if (!textToSend) {
      setInputText('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);

    // Broadcast typing indicator
    socketService.sendTyping(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = window.setTimeout(() => {
      socketService.sendTyping(false);
    }, 1500);
  };

  const shared = userInterests.filter((i) => match.interests.includes(i));
  const matchedTopicsLabel = (shared.length > 0 ? shared : match.interests).slice(0, 2).join(' & ');

  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      <Header
        title="Active Chat Room"
        userName={userName}
        onBack={() => setIsEndModalOpen(true)}
      />

      <main className="flex-1 w-full bg-background pt-16 flex flex-col">
        <div className="flex flex-col w-full relative max-w-lg mx-auto flex-1">
          {/* Top Presence Sub-bar / Active Partner Context */}
          <section className="sticky top-16 z-30 px-margin py-space-sm bg-background/90 backdrop-blur-md shadow-sm border-b border-border-subtle/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-sm min-w-0">
                <UserAvatar
                  name={match.name}
                  size="sm"
                  showOnlineDot
                  isOnline={!partnerLeft}
                />

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-headline-sm text-headline-sm text-text-primary leading-none truncate font-semibold">
                      {match.name}
                    </span>
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        partnerLeft ? 'bg-text-muted' : 'bg-state-success'
                      }`}
                    />
                  </div>
                  <span className="font-caption text-caption text-text-muted truncate mt-0.5">
                    {partnerLeft ? 'Left the conversation' : match.interests.join(' · ')}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Instant Skip Button to find another person */}
                <button
                  type="button"
                  aria-label="Skip & find another"
                  onClick={() => {
                    socketService.leaveChat();
                    onStartAnotherChat();
                  }}
                  className="h-8 px-3 rounded-full bg-surface-container hover:bg-surface-container-high text-text-primary flex items-center gap-1 font-caption text-caption font-medium active:scale-95 transition-all cursor-pointer border border-border-subtle"
                  id="skip-chat-btn"
                  title="Skip to next person"
                >
                  <span className="material-symbols-outlined text-[16px] text-text-secondary">fast_forward</span>
                  <span>Skip</span>
                </button>

                <button
                  type="button"
                  aria-label="Session details"
                  onClick={() => setShowSafetySheet(!showSafetySheet)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:bg-surface-container active:scale-95 transition-all cursor-pointer"
                  id="session-info-btn"
                >
                  <span className="material-symbols-outlined text-[18px]">tune</span>
                </button>

                <button
                  type="button"
                  aria-label="More options"
                  onClick={() => setIsEndModalOpen(true)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:bg-surface-container active:scale-95 transition-all cursor-pointer"
                  id="chat-options-btn"
                >
                  <span className="material-symbols-outlined text-[18px]">more_horiz</span>
                </button>
              </div>
            </div>
          </section>

          {/* Ephemeral Session Banner / Notice Drawer (Togglable) */}
          {showSafetySheet && (
            <div
              className="px-margin pt-space-sm pb-space-md bg-surface-container-low transition-all border-b border-border-subtle"
              id="safety-sheet"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs text-text-secondary">
                  <span className="material-symbols-outlined text-[16px] text-secondary">
                    verified_user
                  </span>
                  <span className="font-label-sm text-label-sm">
                    Encrypted & unindexed chat session
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSafetySheet(false)}
                  className="font-caption text-caption text-text-muted hover:text-text-primary cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Messages Stream Area */}
          <div className="flex flex-col px-margin pt-space-md pb-44 gap-y-space-md flex-1" id="chat-stream">
            {/* Timeline Timestamp */}
            <div className="flex flex-col items-center justify-center my-space-xs">
              <span className="font-caption text-caption text-text-muted tracking-wide uppercase px-space-sm py-1 bg-surface-container-high rounded-full">
                Connected · Ephemeral session
              </span>
            </div>

            {/* Serendipitous Match Pill */}
            <div className="flex justify-center">
              <div className="flex items-center gap-1.5 px-space-md py-1.5 rounded-full bg-secondary-fixed text-secondary shadow-[0_2px_8px_rgba(117,108,246,0.08)]">
                <span
                  className="material-symbols-outlined text-[15px] filled"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  auto_awesome
                </span>
                <span className="font-label-sm text-label-sm font-medium">
                  You both matched on {matchedTopicsLabel || 'Common Curiosity'}
                </span>
              </div>
            </div>

            {/* If no messages yet, show icebreaker card prompt */}
            {messages.length === 0 && (
              <div className="bg-surface-container-low rounded-xl p-4 text-center my-2 max-w-sm mx-auto border border-border-subtle/50">
                <p className="font-caption text-caption text-text-muted uppercase tracking-wider mb-1 font-medium">
                  Icebreaker Idea
                </p>
                <p className="font-body-sm text-body-sm text-text-primary italic">
                  "{match.icebreaker}"
                </p>
              </div>
            )}

            {/* Rendered Messages with Person First Character Avatar Log */}
            {messages.map((msg) => {
              if (msg.sender === 'user') {
                return (
                  <div
                    key={msg.id}
                    className="flex items-end justify-end gap-2 self-end max-w-[85%] transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
                  >
                    <div className="flex flex-col items-end gap-1">
                      <div className="bg-surface-dark text-on-primary px-space-md py-3 rounded-2xl rounded-br-[6px] shadow-[0_4px_14px_rgba(0,0,0,0.12)]">
                        <p className="font-body-md text-body-md whitespace-pre-wrap">{msg.text}</p>
                      </div>
                      <div className="flex items-center gap-1 mr-1 text-text-muted">
                        <span className="font-caption text-caption">{msg.timestamp}</span>
                        <span className="material-symbols-outlined text-[13px] text-state-success">
                          done_all
                        </span>
                      </div>
                    </div>
                    <UserAvatar name={userName || 'You'} size="xs" className="mb-1" />
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className="flex items-end gap-2 max-w-[85%] transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
                >
                  <UserAvatar name={match.name} size="xs" className="mb-1" />
                  <div className="flex flex-col items-start gap-1">
                    <div className="bg-surface text-text-primary px-space-md py-3 rounded-2xl rounded-bl-[6px] shadow-[0_2px_8px_rgba(17,17,17,0.03)] border border-border-subtle/30">
                      <p className="font-body-md text-body-md whitespace-pre-wrap">{msg.text}</p>
                    </div>
                    <span className="font-caption text-caption text-text-muted ml-1">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Ambient Typing Indicator */}
            {isTyping && (
              <div
                className="flex items-end gap-2 max-w-[82%] animate-in fade-in duration-200"
                id="typing-indicator"
              >
                <UserAvatar name={match.name} size="xs" className="mb-1" />
                <div className="bg-surface px-4 py-3 rounded-2xl rounded-bl-[6px] shadow-[0_2px_8px_rgba(17,17,17,0.03)] flex items-center gap-1.5 border border-border-subtle/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-pulse" />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-text-muted animate-pulse"
                    style={{ animationDelay: '200ms' }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-text-muted animate-pulse"
                    style={{ animationDelay: '400ms' }}
                  />
                </div>
              </div>
            )}

            {/* Partner Left Notification */}
            {partnerLeft && (
              <div className="bg-surface rounded-2xl p-4 text-center my-3 max-w-sm mx-auto flex flex-col items-center justify-center gap-2 border border-border-subtle shadow-sm animate-in fade-in">
                <div className="flex items-center gap-1.5 text-text-secondary">
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  <span className="font-label-sm text-label-sm font-medium">
                    {match.name} ended the chat
                  </span>
                </div>
                <p className="font-caption text-caption text-text-muted">
                  Ready to connect with someone else?
                </p>
                <button
                  type="button"
                  onClick={() => {
                    socketService.leaveChat();
                    onStartAnotherChat();
                  }}
                  className="mt-1 h-10 px-5 rounded-full bg-primary text-on-primary font-label-md text-label-md font-medium flex items-center gap-1.5 shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                >
                  <span>Find Next Person</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            )}

            <div ref={streamEndRef} />
          </div>

          {/* Bottom Floating Deck (Starters + Pill Composer) */}
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-background via-background/95 to-transparent pt-4 pb-safe pointer-events-none">
            <div className="w-full max-w-lg mx-auto px-margin flex flex-col gap-2.5 pointer-events-auto pb-3">
              {/* Quick Starters Horizontal Ribbon */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                {STARTER_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleSend(prompt)}
                    className="starter-chip shrink-0 px-3.5 py-1.5 rounded-full bg-surface text-text-secondary font-label-sm text-label-sm hover:bg-secondary-fixed hover:text-secondary shadow-sm active:scale-95 transition-all cursor-pointer border border-border-subtle/40"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Modern Ambient Pill Composer */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="relative flex items-center bg-surface rounded-full shadow-[0_12px_32px_rgba(17,17,17,0.06),0_2px_6px_rgba(17,17,17,0.02)] p-1.5 border border-border-subtle/50"
              >
                {/* Media / Plus Action */}
                <button
                  type="button"
                  aria-label="Add attachment"
                  onClick={() => handleSend("✨ [Sent a gentle wave]")}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-container active:scale-90 transition-all shrink-0 cursor-pointer"
                  id="attach-btn"
                >
                  <span className="material-symbols-outlined text-[20px]">add</span>
                </button>

                {/* Message Field */}
                <input
                  id="chat-input"
                  type="text"
                  value={inputText}
                  onChange={handleInputChange}
                  placeholder={partnerLeft ? "Partner left. Tap top right to reconnect" : "Type a message..."}
                  disabled={partnerLeft}
                  autoComplete="off"
                  className="flex-1 bg-transparent px-2.5 py-2 font-body-md text-body-md text-text-primary placeholder:text-text-muted focus:outline-none"
                />

                {/* Action / Send Button */}
                <button
                  id="send-button"
                  type="submit"
                  disabled={!inputText.trim() || partnerLeft}
                  aria-label="Send message"
                  className={`w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md active:scale-95 transition-all shrink-0 cursor-pointer ${
                    !inputText.trim() || partnerLeft ? 'opacity-40' : 'hover:opacity-90'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">arrow_upward</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Screen 5: End Chat Modal Sheet */}
      <EndChatModal
        isOpen={isEndModalOpen}
        match={match}
        onClose={() => setIsEndModalOpen(false)}
        onEndChat={() => {
          socketService.leaveChat();
          setIsEndModalOpen(false);
          onEndChat();
        }}
        onReport={() => {
          alert('Report received. Thank you for keeping our community mindful and safe.');
        }}
        onBlock={() => {
          if (confirm(`Are you sure you want to block ${match.name}? This action cannot be undone.`)) {
            socketService.leaveChat();
            onBlockUser(match.id);
            setIsEndModalOpen(false);
            onStartAnotherChat();
          }
        }}
        onStartAnother={() => {
          socketService.leaveChat();
          setIsEndModalOpen(false);
          onStartAnotherChat();
        }}
        onReturnHome={() => {
          socketService.leaveChat();
          setIsEndModalOpen(false);
          onReturnHome();
        }}
      />
    </div>
  );
};
