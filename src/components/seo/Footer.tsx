import React from 'react';

interface FooterProps {
  onNavigate?: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-surface-container-low border-t border-border-subtle mt-16 pt-12 pb-16 text-text-secondary select-none">
      <div className="max-w-4xl mx-auto px-6">
        {/* Brand & Mission Statement */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-8 pb-10 border-b border-border-subtle/60">
          <div className="space-y-3 max-w-sm">
            <div className="flex items-center gap-2">
              <img
                src="/icons/chattr-icon-48x48.png"
                alt="Chattr. Logo"
                className="w-5 h-5 rounded-full shadow-sm object-cover shrink-0"
              />
              <span className="font-headline-sm text-headline-sm text-text-primary font-bold">
                Chattr<span className="text-secondary">.</span>
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-text-secondary leading-relaxed">
              A minimalist, privacy-first random chat platform connecting people through genuine curiosity and shared interests. No accounts, no digital footprint.
            </p>
          </div>

          {/* Categorized Link Columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-left w-full md:w-auto">
            {/* Column 1: Conversations */}
            <div className="space-y-3">
              <h3 className="font-label-sm text-label-sm text-text-primary font-semibold uppercase tracking-wider">
                Explore
              </h3>
              <ul className="space-y-2 font-caption text-caption">
                <li>
                  <a
                    href="/random-chat"
                    onClick={(e) => handleLinkClick(e, '/random-chat')}
                    className="hover:text-primary transition-colors inline-block py-0.5"
                  >
                    Random Chat
                  </a>
                </li>
                <li>
                  <a
                    href="/random-chat-with-strangers"
                    onClick={(e) => handleLinkClick(e, '/random-chat-with-strangers')}
                    className="hover:text-primary transition-colors inline-block py-0.5"
                  >
                    Random Chat with Strangers
                  </a>
                </li>
                <li>
                  <a
                    href="/chat-with-strangers"
                    onClick={(e) => handleLinkClick(e, '/chat-with-strangers')}
                    className="hover:text-primary transition-colors inline-block py-0.5"
                  >
                    Chat with Strangers
                  </a>
                </li>
                <li>
                  <a
                    href="/meet-new-people"
                    onClick={(e) => handleLinkClick(e, '/meet-new-people')}
                    className="hover:text-primary transition-colors inline-block py-0.5"
                  >
                    Meet New People
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 2: Safety & Guides */}
            <div className="space-y-3">
              <h3 className="font-label-sm text-label-sm text-text-primary font-semibold uppercase tracking-wider">
                Guides & Trust
              </h3>
              <ul className="space-y-2 font-caption text-caption">
                <li>
                  <a
                    href="/how-random-chat-works"
                    onClick={(e) => handleLinkClick(e, '/how-random-chat-works')}
                    className="hover:text-primary transition-colors inline-block py-0.5"
                  >
                    How Random Chat Works
                  </a>
                </li>
                <li>
                  <a
                    href="/safety"
                    onClick={(e) => handleLinkClick(e, '/safety')}
                    className="hover:text-primary transition-colors inline-block py-0.5"
                  >
                    Chat Safely
                  </a>
                </li>
                <li>
                  <a
                    href="/community-guidelines"
                    onClick={(e) => handleLinkClick(e, '/community-guidelines')}
                    className="hover:text-primary transition-colors inline-block py-0.5"
                  >
                    Community Guidelines
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Legal & Help */}
            <div className="space-y-3">
              <h3 className="font-label-sm text-label-sm text-text-primary font-semibold uppercase tracking-wider">
                Legal & Contact
              </h3>
              <ul className="space-y-2 font-caption text-caption">
                <li>
                  <a
                    href="/privacy"
                    onClick={(e) => handleLinkClick(e, '/privacy')}
                    className="hover:text-primary transition-colors inline-block py-0.5"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="/terms"
                    onClick={(e) => handleLinkClick(e, '/terms')}
                    className="hover:text-primary transition-colors inline-block py-0.5"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="/contact"
                    onClick={(e) => handleLinkClick(e, '/contact')}
                    className="hover:text-primary transition-colors inline-block py-0.5"
                  >
                    Contact & Support
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-caption text-caption text-text-muted">
          <p>© 2026 Chattr. All rights reserved. Ephemeral & unindexed conversations.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-state-success" />
              <span>Zero-Retention Matchmaking</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
