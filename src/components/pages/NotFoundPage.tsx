import React from 'react';
import { MetaManager } from '../seo/MetaManager';
import { Footer } from '../seo/Footer';

interface NotFoundPageProps {
  onNavigate: (path: string) => void;
  onStartChat: () => void;
  currentPath?: string;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  onNavigate,
  onStartChat,
  currentPath = window.location.pathname
}) => {
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    onNavigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cleanPath = currentPath.length > 25 ? `${currentPath.slice(0, 22)}...` : currentPath;

  const popularRoutes = [
    {
      title: 'Random Chat',
      desc: 'Meet someone new online instantly with zero setup or sign-ups.',
      path: '/random-chat',
      icon: 'chat'
    },
    {
      title: 'Chat With Strangers',
      desc: 'Engage in spontaneous, ephemeral text chat with verified real users.',
      path: '/chat-with-strangers',
      icon: 'public'
    },
    {
      title: 'Meet New People',
      desc: 'Filter by shared interests or connect freely across mutual hobbies.',
      path: '/meet-new-people',
      icon: 'groups'
    },
    {
      title: 'How It Works',
      desc: 'Learn about our real-time radar matching and zero-retention privacy.',
      path: '/how-random-chat-works',
      icon: 'radar'
    }
  ];

  return (
    <div className="w-full min-h-screen bg-background text-text-primary flex flex-col font-sans selection:bg-[#e3dfff] selection:text-[#5146d0]">
      <MetaManager
        title="404 – Page Not Found | Chattr."
        description="The page you are looking for does not exist on Chattr. Start a random chat with strangers or return to the homepage."
        canonicalPath="/404"
        noIndex={true}
      />

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-surface/85 backdrop-blur-md border-b border-border-subtle/80">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <a
            href="/"
            onClick={(e) => handleLinkClick(e, '/')}
            className="flex items-center gap-2 group"
          >
            <img
              src="/icons/chattr-icon-96x96.png"
              alt="Chattr. Logo"
              className="w-7 h-7 rounded-full shadow-sm object-cover transition-transform duration-300 group-hover:scale-105 shrink-0"
            />
            <span className="font-headline-sm text-headline-sm text-text-primary font-bold tracking-tight">
              Chattr<span className="text-secondary">.</span>
            </span>
          </a>

          <div className="flex items-center gap-3">
            <a
              href="/"
              onClick={(e) => handleLinkClick(e, '/')}
              className="hidden sm:inline-block font-body-sm text-body-sm text-text-secondary hover:text-text-primary transition-colors px-2 py-1"
            >
              Home
            </a>
            <button
              type="button"
              onClick={onStartChat}
              className="h-9 px-4 rounded-full bg-primary text-on-primary font-caption text-caption font-medium flex items-center gap-1.5 shadow-sm hover:opacity-95 active:scale-95 transition-all cursor-pointer"
            >
              <span>Start Random Chat</span>
              <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main 404 Hero Container */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-12 flex flex-col items-center text-center justify-center">
        {/* Animated Radar/Satellite Lost Signal Graphic */}
        <div className="relative mb-6 flex items-center justify-center">
          {/* Subtle concentric orbital rings */}
          <div className="w-36 h-36 rounded-full border border-dashed border-border-subtle/60 flex items-center justify-center animate-spin" style={{ animationDuration: '30s' }}>
            <div className="w-24 h-24 rounded-full border border-border-subtle/40 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-secondary-fixed/40 flex items-center justify-center">
                <span className="material-symbols-outlined text-secondary text-[26px]">
                  satellite_alt
                </span>
              </div>
            </div>
          </div>

          {/* Drifting signal ping */}
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-secondary/80 animate-ping" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-secondary shadow-sm" />
        </div>

        {/* 404 Badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-surface-container border border-border-subtle text-text-secondary font-label-sm text-label-sm font-semibold mb-4 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-state-danger" />
          <span>Error 404 // Lost in Orbit</span>
        </div>

        {/* Headline */}
        <h1 className="font-display-hero-mobile text-display-hero-mobile sm:text-headline-lg font-bold text-text-primary tracking-tight mb-3">
          Signal Not Found
        </h1>

        {/* Body Text */}
        <p className="font-body-lg text-body-lg text-text-secondary max-w-lg mx-auto mb-4 leading-relaxed">
          The frequency or page you are looking for doesn't exist, has drifted into deep space, or may have been relocated.
        </p>

        {/* Requested Path Callout */}
        {currentPath && currentPath !== '/' && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-surface border border-border-subtle/60 font-mono text-caption text-text-muted mb-8">
            <span className="text-secondary font-bold">404</span>
            <span>Requested:</span>
            <code className="text-text-primary font-semibold">{cleanPath}</code>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-sm mb-14">
          <button
            type="button"
            onClick={onStartChat}
            className="flex-1 min-w-[160px] h-12 rounded-full bg-primary text-on-primary font-body-md text-body-md font-semibold flex items-center justify-center gap-2 shadow-md hover:opacity-95 active:scale-95 transition-all cursor-pointer"
          >
            <span>Start Random Chat</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>

          <a
            href="/"
            onClick={(e) => handleLinkClick(e, '/')}
            className="flex-1 min-w-[140px] h-12 rounded-full bg-surface text-text-primary border border-border-subtle font-body-md text-body-md font-medium flex items-center justify-center gap-2 hover:bg-surface-container-low active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-text-secondary">home</span>
            <span>Return Home</span>
          </a>
        </div>

        {/* Quick Directory of Existing Pages */}
        <div className="w-full text-left pt-8 border-t border-border-subtle">
          <h2 className="font-headline-sm text-headline-sm text-text-primary font-bold mb-1">
            Active Frequencies
          </h2>
          <p className="font-body-sm text-body-sm text-text-secondary mb-5">
            Looking for something specific? Jump straight into one of our active channels:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {popularRoutes.map((route) => (
              <a
                key={route.path}
                href={route.path}
                onClick={(e) => handleLinkClick(e, route.path)}
                className="group p-4 rounded-xl bg-surface border border-border-subtle/80 hover:border-secondary/40 hover:shadow-md transition-all flex items-start gap-3.5 text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center shrink-0 group-hover:bg-secondary-fixed/50 transition-colors">
                  <span className="material-symbols-outlined text-text-primary group-hover:text-secondary text-[20px] transition-colors">
                    {route.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-label-md text-label-md font-bold text-text-primary group-hover:text-secondary transition-colors">
                      {route.title}
                    </span>
                    <span className="material-symbols-outlined text-[16px] text-text-muted group-hover:translate-x-0.5 group-hover:text-secondary transition-all">
                      arrow_outward
                    </span>
                  </div>
                  <p className="font-caption text-caption text-text-secondary line-clamp-2 mt-0.5">
                    {route.desc}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </main>

      {/* Standard Footer */}
      <Footer onNavigate={onNavigate} />
    </div>
  );
};
