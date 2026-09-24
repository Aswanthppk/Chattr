import React, { useState } from 'react';
import { Header } from './Header';
import { OrbVisual } from './OrbVisual';
import { Topic } from '../types';

interface InterestScreenProps {
  userName?: string;
  selectedInterests: string[];
  onToggleInterest: (topic: string) => void;
  onResetInterests: () => void;
  onStartChat: () => void;
  onBack: () => void;
}

export const PRESET_TOPICS: Topic[] = [
  { id: 'tech', name: 'Technology', icon: 'memory' },
  { id: 'movies', name: 'Movies', icon: 'movie' },
  { id: 'music', name: 'Music', icon: 'graphic_eq' },
  { id: 'gaming', name: 'Gaming', icon: 'sports_esports' },
  { id: 'sports', name: 'Sports', icon: 'sprint' },
  { id: 'travel', name: 'Travel', icon: 'flight_takeoff' },
  { id: 'books', name: 'Books', icon: 'auto_stories' },
  { id: 'fitness', name: 'Fitness', icon: 'fitness_center' },
  { id: 'food', name: 'Food', icon: 'local_cafe' },
  { id: 'photo', name: 'Photography', icon: 'photo_camera' },
  { id: 'anime', name: 'Anime', icon: 'animation' },
  { id: 'coding', name: 'Coding', icon: 'terminal' },
];

export const InterestScreen: React.FC<InterestScreenProps> = ({
  userName = '',
  selectedInterests,
  onToggleInterest,
  onResetInterests,
  onStartChat,
  onBack
}) => {
  const MAX_TOPICS = 5;
  const count = selectedInterests.length;
  const [customHobbyInput, setCustomHobbyInput] = useState('');

  // Distinguish custom hobbies from preset topics
  const presetNames = PRESET_TOPICS.map((t) => t.name.toLowerCase());
  const customInterests = selectedInterests.filter(
    (item) => !presetNames.includes(item.toLowerCase())
  );

  const handleAddCustomHobby = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customHobbyInput.trim();
    if (!trimmed) return;

    // Capitalize first letter of each word
    const formatted = trimmed
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');

    if (!selectedInterests.some((t) => t.toLowerCase() === formatted.toLowerCase())) {
      if (count < MAX_TOPICS) {
        onToggleInterest(formatted);
      }
    }
    setCustomHobbyInput('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header title="Choose Interests" onBack={onBack} userName={userName} />

      <main className="flex-1 w-full bg-background pt-16 flex flex-col">
        <div className="flex flex-col w-full px-margin pb-safe select-none max-w-md mx-auto flex-1">
          {/* Interactive Ambient Header Aura */}
          <div className="relative w-full pt-space-md pb-space-lg flex flex-col items-center">
            <OrbVisual size="md" />

            {/* Editorial Typography Block */}
            <h2 className="font-headline-lg text-headline-lg text-text-primary text-center tracking-tight mt-space-sm font-semibold">
              What are you into?
            </h2>
            <p className="font-body-md text-body-md text-text-secondary text-center mt-space-xs max-w-[280px]">
              Pick or type topics to spark conversation (0–5 topics). You can also jump right in!
            </p>

            {/* Interactive Selected Counter Badge */}
            <div className="mt-space-md inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant shadow-sm transition-all duration-300">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping" />
              <span className="font-label-sm text-label-sm font-medium" id="counter-text">
                {count === 0 ? 'Open to any topic (0 of 5)' : `${count} of ${MAX_TOPICS} selected`}
              </span>
            </div>
          </div>

          {/* Search / Type Custom Hobbies Input */}
          <div className="w-full mb-space-sm">
            <form
              onSubmit={handleAddCustomHobby}
              className="w-full bg-surface rounded-full shadow-sm px-3.5 py-1.5 flex items-center gap-2 border border-border-subtle focus-within:ring-2 focus-within:ring-secondary/20 focus-within:border-secondary transition-all"
            >
              <span className="material-symbols-outlined text-[18px] text-text-muted">
                search
              </span>
              <input
                type="text"
                value={customHobbyInput}
                onChange={(e) => setCustomHobbyInput(e.target.value)}
                placeholder="Type your own hobby (e.g. Chess, Astronomy)..."
                maxLength={24}
                className="flex-1 bg-transparent py-1 font-body-sm text-body-sm text-text-primary placeholder:text-text-muted focus:outline-none"
              />
              <button
                type="submit"
                disabled={!customHobbyInput.trim() || count >= MAX_TOPICS}
                className={`h-7 px-3 rounded-full text-on-primary font-caption text-caption font-medium flex items-center gap-1 transition-all cursor-pointer ${
                  !customHobbyInput.trim() || count >= MAX_TOPICS
                    ? 'bg-surface-container text-text-muted opacity-50 cursor-not-allowed'
                    : 'bg-primary hover:opacity-90 active:scale-95'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">add</span>
                <span>Add</span>
              </button>
            </form>
          </div>

          {/* Custom Hobbies Row if any added */}
          {customInterests.length > 0 && (
            <div className="w-full mb-space-xs flex flex-wrap gap-2 justify-center py-1">
              {customInterests.map((hobby) => (
                <div
                  key={hobby}
                  className="h-9 px-3.5 rounded-full flex items-center gap-1.5 bg-secondary-fixed text-secondary shadow-[0_2px_8px_rgba(117,108,246,0.12)] scale-[1.02] font-medium"
                >
                  <span className="material-symbols-outlined text-[16px] text-secondary">
                    tag
                  </span>
                  <span className="font-label-md text-label-md">{hobby}</span>
                  <button
                    type="button"
                    onClick={() => onToggleInterest(hobby)}
                    className="w-4 h-4 rounded-full hover:bg-secondary/15 flex items-center justify-center transition-colors ml-0.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[13px] text-secondary">
                      close
                    </span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Topics & Interests Selection Grid */}
          <div className="w-full flex flex-col gap-space-sm mt-space-xs">
            <div className="flex items-center justify-between px-space-xs mb-1">
              <span className="font-caption text-caption uppercase tracking-wider text-text-muted font-medium">
                Curated Spheres
              </span>
              {count > 0 && (
                <button
                  id="clear-btn"
                  type="button"
                  onClick={onResetInterests}
                  className="font-caption text-caption text-secondary hover:text-text-primary transition-colors cursor-pointer py-1"
                >
                  Reset selection
                </button>
              )}
            </div>

            {/* Chips Container */}
            <div className="flex flex-wrap gap-2.5 justify-center py-1" id="chips-container">
              {PRESET_TOPICS.map((topic) => {
                const isSelected = selectedInterests.some(
                  (t) => t.toLowerCase() === topic.name.toLowerCase()
                );
                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => {
                      if (!isSelected && count >= MAX_TOPICS) {
                        return;
                      }
                      onToggleInterest(topic.name);
                    }}
                    className={`topic-chip group h-9 px-4 rounded-full flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'active bg-secondary-fixed text-secondary shadow-[0_2px_8px_rgba(117,108,246,0.12)] scale-[1.02] font-medium'
                        : 'bg-surface text-text-secondary shadow-sm hover:bg-surface-container-low active:scale-95'
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-[16px] ${
                        isSelected ? 'text-secondary' : 'text-text-muted group-hover:text-text-primary'
                      } transition-colors`}
                    >
                      {topic.icon}
                    </span>
                    <span className="font-label-md text-label-md">{topic.name}</span>
                    {isSelected && (
                      <span className="chip-check material-symbols-outlined text-[15px] text-secondary ml-0.5">
                        check
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ambient Micro-Card Insight */}
          <div className="mt-space-md w-full bg-surface rounded-lg p-space-md shadow-sm flex items-center gap-space-sm border border-border-subtle/40">
            <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-secondary text-[20px]">insights</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-sm text-label-sm text-text-primary truncate font-medium">
                Curated Resonance
              </span>
              <span className="font-caption text-caption text-text-secondary line-clamp-2">
                {count === 0
                  ? 'Connect freely without filtering, or pick topics for targeted serendipity.'
                  : 'Over 1,420 curious minds are online sharing these intersections right now.'}
              </span>
            </div>
          </div>

          {/* Persistent Bottom Action & Guidance Area */}
          <div className="mt-auto pt-space-lg pb-space-md flex flex-col items-center gap-space-sm">
            {/* Primary Solid Black Pill CTA - Always enabled */}
            <button
              id="start-chat-cta"
              type="button"
              onClick={onStartChat}
              className="w-full h-[52px] bg-primary text-on-primary rounded-full font-label-md text-label-md font-medium shadow-[0_4px_14px_rgba(17,17,17,0.12)] flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 active:scale-[0.98] cursor-pointer"
            >
              <span>{count === 0 ? 'Start Random Chat' : 'Start Chat'}</span>
              <span className="material-symbols-outlined text-[18px] transition-transform duration-200 group-hover:translate-x-1">
                arrow_forward
              </span>
            </button>

            {/* Warm micro-copy disclaimer */}
            <div className="flex items-center gap-1.5 text-center">
              <span className="w-2 h-2 rounded-full bg-state-success" />
              <p className="font-caption text-caption text-text-secondary">
                {count === 0
                  ? "We'll pair you immediately with any active stranger."
                  : "We'll pair you immediately with an active stranger."}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
