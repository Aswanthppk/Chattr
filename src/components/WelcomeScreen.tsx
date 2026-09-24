import React, { useState } from 'react';
import { OrbVisual } from './OrbVisual';
import { MetaManager } from './seo/MetaManager';
import { HomeContentSections, FAQS } from './seo/HomeContentSections';
import { Footer } from './seo/Footer';

interface WelcomeScreenProps {
  onContinue: (name: string) => void;
  initialName?: string;
  onlineCount?: number;
  onNavigate?: (path: string) => void;
}

const RANDOM_NAMES = [
  'Rowan', 'Kei', 'Solstice', 'Lumen', 'Jules', 'Indigo', 'Aura',
  'Pari', 'Atlas', 'Zephyr', 'Nova', 'Ellis', 'Clover', 'Koa'
];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onContinue,
  initialName = '',
  onlineCount = 1420,
  onNavigate
}) => {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState(false);
  const [isRolling, setIsRolling] = useState(false);

  const handleRandomize = () => {
    setIsRolling(true);
    setTimeout(() => setIsRolling(false), 350);
    const chosen = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
    setName(chosen);
    setError(false);
  };

  const handlePreset = (presetName: string) => {
    setName(presetName);
    setError(false);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError(true);
      return;
    }
    onContinue(trimmed);
  };

  const homeJsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': 'Chattr.',
      'url': 'https://chattr.app',
      'description': 'A simple random chat application for meeting new people online.'
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': 'Chattr.',
      'url': 'https://chattr.app',
      'logo': 'https://chattr.app/og-image.svg'
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      'name': 'Chattr.',
      'applicationCategory': 'SocialNetworkingApplication',
      'operatingSystem': 'Web',
      'description': 'A simple random chat application for meeting new people online.'
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': FAQS.map((faq) => ({
        '@type': 'Question',
        'name': faq.q,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': faq.a
        }
      }))
    }
  ];

  return (
    <div className="w-full flex flex-col min-h-screen">
      <MetaManager
        title="Random Chat – Talk to New People Online | Chattr."
        description="Meet new people through random chat. Choose your interests, get matched with someone online, and start a conversation in seconds."
        canonicalPath="/"
        jsonLd={homeJsonLd}
      />

      {/* Exact Stitch Hero Stage */}
      <div className="flex flex-col w-full px-margin pb-safe justify-between min-h-[calc(100vh-theme(spacing.space-2xl))] max-w-sm mx-auto">
        {/* Minimal Top Header */}
        <header className="flex items-center justify-between pt-space-md w-full">
          <div className="flex items-center gap-space-xs">
            <img
              src="/icons/chattr-icon-72x72.png"
              alt="Chattr. Logo"
              className="w-7 h-7 rounded-full shadow-sm object-cover shrink-0"
            />
            <span className="font-headline-sm text-headline-sm tracking-tight text-text-primary font-bold">
              Chattr<span className="text-secondary">.</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface shadow-sm">
            <span className="w-2 h-2 rounded-full bg-state-success animate-pulse" />
            <span className="font-caption text-caption text-text-secondary font-medium">
              {onlineCount.toLocaleString()} online
            </span>
          </div>
        </header>

        {/* Center Hero: Luminous Glass Orb Experience */}
        <div className="flex flex-col items-center justify-center my-auto py-space-md select-none relative">
          <OrbVisual size="lg" />

          {/* Editorial Typography Block */}
          <div className="mt-space-lg text-center space-y-space-xs">
            <h1 className="font-display-hero-mobile text-display-hero-mobile text-text-primary tracking-tight font-semibold">
              Meet someone new.
            </h1>
            <p className="font-body-md text-body-md text-text-secondary max-w-[280px] mx-auto">
              Start a random conversation with someone online in seconds.
            </p>
          </div>
        </div>

        {/* Ultra-Simple Input & Action Section */}
        <div className="flex flex-col space-y-space-md w-full max-w-sm mx-auto">
          {/* Elevated Minimal Input Card */}
          <div
            className={`bg-surface rounded-lg p-space-md shadow-sm space-y-space-xs flex flex-col justify-center transition-all focus-within:shadow-md focus-within:ring-2 ${
              error ? 'ring-2 ring-error' : 'focus-within:ring-secondary/20'
            }`}
          >
            <div className="flex justify-between items-center">
              <label className="font-label-sm text-label-sm text-text-secondary font-medium" htmlFor="userName">
                What should we call you?
              </label>
              <span className="font-caption text-caption text-text-muted">Pseudonym ok</span>
            </div>

            <div className="relative flex items-center">
              <input
                id="userName"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSubmit();
                }}
                maxLength={24}
                placeholder="e.g. Sam, River, or Alex"
                spellCheck={false}
                autoComplete="off"
                className="w-full font-body-lg text-body-lg text-text-primary bg-transparent outline-none placeholder:text-text-muted/60 py-1"
              />
              <button
                id="diceBtn"
                type="button"
                onClick={handleRandomize}
                title="Surprise me with a pseudonym"
                className={`p-1.5 rounded-full text-text-muted hover:text-text-primary transition-all flex items-center justify-center active:scale-95 ${
                  isRolling ? 'rotate-180 duration-300' : ''
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">casino</span>
              </button>
            </div>
          </div>

          {error && (
            <p className="text-error font-caption text-caption text-center -mt-2">
              Please enter a name or pick a preset below
            </p>
          )}

          {/* Quick Micro Identity Chips */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto py-0.5 no-scrollbar">
            {['Nomad', 'Cosmos', 'Echo', 'Sol'].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handlePreset(preset)}
                className={`preset-pill px-3 py-1 rounded-full text-text-secondary font-caption text-caption shadow-sm transition-colors ${
                  name === preset
                    ? 'bg-secondary-fixed text-secondary font-semibold'
                    : 'bg-surface hover:bg-secondary-fixed hover:text-secondary'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Primary Action Button */}
          <button
            id="continueBtn"
            type="button"
            onClick={() => handleSubmit()}
            className="group w-full h-[52px] rounded-full bg-primary text-on-primary font-body-lg text-body-lg font-medium flex items-center justify-center gap-2 shadow-md hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer"
          >
            <span>Start Random Chat</span>
            <span className="material-symbols-outlined text-[18px] transition-transform duration-300 group-hover:translate-x-1">
              arrow_forward
            </span>
          </button>

          {/* Subtle Privacy Guarantee Footnote */}
          <div className="flex flex-col items-center text-center pt-space-xs pb-space-sm space-y-1">
            <div className="flex items-center gap-1.5 text-text-secondary font-caption text-caption">
              <span className="material-symbols-outlined text-[14px]">lock_reset</span>
              <span>No account needed • Ephemeral by default</span>
            </div>
            <p className="font-caption text-caption text-text-muted">
              Conversations vanish automatically when you leave.
            </p>
          </div>
        </div>
      </div>

      {/* Informational SEO Content Sections Below Hero */}
      <HomeContentSections
        onNavigate={onNavigate}
        onStartChatClick={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          const input = document.getElementById('userName');
          if (input) input.focus();
        }}
      />

      {/* Structured Semantic Footer */}
      <Footer onNavigate={onNavigate} />
    </div>
  );
};
