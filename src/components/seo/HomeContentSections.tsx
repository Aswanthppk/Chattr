import React, { useState } from 'react';

interface HomeContentSectionsProps {
  onNavigate?: (path: string) => void;
  onStartChatClick?: () => void;
}

export const FAQS = [
  {
    q: 'What is random chat?',
    a: 'Random chat is a digital service that instantly pairs two people online for a private, live conversation. Unlike traditional social media platforms that revolve around permanent follower networks and public feeds, random chat emphasizes spontaneous, one-on-one text discussions where participants meet without prior introduction.'
  },
  {
    q: 'How does random chat work?',
    a: 'When you join the queue, our matchmaking engine pairs you with another active person waiting online. You can opt to specify a few shared interests or enter the queue openly. Once a compatible peer is found, a temporary room is generated and you can immediately exchange text messages.'
  },
  {
    q: 'Can I chat with strangers online?',
    a: 'Yes. Chattr connects you with people from around the world who are also looking to have genuine, spontaneous conversations. It offers a low-pressure way to exchange ideas, practice languages, discuss hobbies, or simply share a quick moment with someone new.'
  },
  {
    q: 'Do I need to create a profile?',
    a: 'No. Chattr requires no account, email address, password, or permanent profile. You choose a temporary pseudonym or randomize one, select any optional topics, and begin chatting. No personal information is stored or tied to your identity.'
  },
  {
    q: 'Can I choose conversation interests?',
    a: 'Yes. You can choose from popular topics like Technology, Music, Film, Books, and Gaming, or type any custom hobby. The system uses your selections to find someone who shares those passions, while still allowing an open match if no immediate overlap is available.'
  },
  {
    q: 'Can I end a random chat?',
    a: 'Yes, at any moment. You have complete autonomy. You can click "Skip" to immediately disconnect and find another person, or click "End Chat" to leave the conversation entirely. All message history is erased when the session closes.'
  },
  {
    q: 'Can I report or block someone?',
    a: 'Yes. If an individual behaves inappropriately, you can block them with a single tap, which immediately ensures our matchmaking engine will never pair you with that person again. You can also submit an ephemeral report for moderation review.'
  },
  {
    q: 'Is random chat safe?',
    a: 'Chattr is engineered with a privacy-first approach: sessions are ephemeral, unindexed, and contain no user tracking. However, your personal safety also depends on staying vigilant: never share passwords, financial details, contact numbers, or real-life locations with anyone you meet online.'
  }
];

export const HomeContentSections: React.FC<HomeContentSectionsProps> = ({
  onNavigate,
  onStartChatClick
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

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
    <div className="w-full max-w-3xl mx-auto px-6 space-y-20 pt-16">
      {/* 1. What is Random Chat? (150-250 words) */}
      <section className="bg-surface rounded-2xl p-8 sm:p-10 shadow-sm border border-border-subtle/80 space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant text-caption font-medium">
          <span className="material-symbols-outlined text-[15px]">info</span>
          <span>Understanding Random Chat</span>
        </div>
        <h2 className="font-headline-sm text-headline-sm text-text-primary font-bold tracking-tight">
          What is random chat?
        </h2>
        <div className="font-body-md text-body-md text-text-secondary leading-relaxed space-y-3">
          <p>
            Random chat is a streamlined way to connect and converse with real people across the world in real time. Rather than relying on static friend requests, endless public profile feeds, or algorithmic recommendation loops, random chat matches two individuals for a direct, one-on-one text conversation. It provides a spontaneous environment where every encounter begins with a clean slate.
          </p>
          <p>
            The service functions by placing active users into a live matchmaking queue. To make your interactions more engaging, you can choose specific conversational interests—such as cinema, software development, electronic music, or creative writing. When someone online shares common curiosities, our system seamlessly introduces you into a private chat room.
          </p>
          <p>
            Random chat gives you complete control over your time and digital boundaries. There are no social obligations or lasting commitments; you can comfortably exchange thoughts for a minute or an hour, and whenever you are ready to conclude the dialogue, you can end the chat or move on to someone new with a single tap.
          </p>
        </div>
      </section>

      {/* 2. How Random Chat Works */}
      <section className="space-y-6">
        <div className="text-center space-y-2 max-w-lg mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface text-text-secondary shadow-sm text-caption font-medium">
            <span className="material-symbols-outlined text-[15px] text-secondary">explore</span>
            <span>Simple 3-Step Process</span>
          </div>
          <h2 className="font-headline-sm text-headline-sm text-text-primary font-bold tracking-tight">
            How random chat works
          </h2>
          <p className="font-body-sm text-body-sm text-text-secondary">
            Get connected in seconds without complicated setup or identity checks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Step 1 */}
          <div className="bg-surface rounded-2xl p-6 shadow-sm border border-border-subtle/80 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
            <div className="space-y-2">
              <span className="w-8 h-8 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant flex items-center justify-center font-bold text-sm">
                1
              </span>
              <h3 className="font-headline-sm text-headline-sm text-text-primary font-semibold">
                Enter your name
              </h3>
              <p className="font-body-sm text-body-sm text-text-secondary leading-relaxed">
                Pick a display name or roll the dice for an imaginative pseudonym. No sign-up or verification needed.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-1.5 text-caption text-text-muted">
              <span className="material-symbols-outlined text-[16px]">fingerprint</span>
              <span>100% Pseudonymous</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-surface rounded-2xl p-6 shadow-sm border border-border-subtle/80 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
            <div className="space-y-2">
              <span className="w-8 h-8 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant flex items-center justify-center font-bold text-sm">
                2
              </span>
              <h3 className="font-headline-sm text-headline-sm text-text-primary font-semibold">
                Choose a few interests
              </h3>
              <p className="font-body-sm text-body-sm text-text-secondary leading-relaxed">
                Select from popular conversation topics or type custom hobbies to guide your matchmaking radar.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-1.5 text-caption text-text-muted">
              <span className="material-symbols-outlined text-[16px]">tune</span>
              <span>Mutual resonance</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-surface rounded-2xl p-6 shadow-sm border border-border-subtle/80 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
            <div className="space-y-2">
              <span className="w-8 h-8 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant flex items-center justify-center font-bold text-sm">
                3
              </span>
              <h3 className="font-headline-sm text-headline-sm text-text-primary font-semibold">
                Start chatting with someone new
              </h3>
              <p className="font-body-sm text-body-sm text-text-secondary leading-relaxed">
                Step immediately into a private, ephemeral chat room. Skip to the next person whenever you want.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-1.5 text-caption text-text-muted">
              <span className="material-symbols-outlined text-[16px]">bolt</span>
              <span>Instant connection</span>
            </div>
          </div>
        </div>

        <div className="text-center pt-2">
          <a
            href="/how-random-chat-works"
            onClick={(e) => handleLinkClick(e, '/how-random-chat-works')}
            className="inline-flex items-center gap-1 font-body-sm text-body-sm text-secondary hover:text-primary font-medium transition-colors"
          >
            <span>Learn how random chat works in detail</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </a>
        </div>
      </section>

      {/* 3. Why Use Chattr. */}
      <section className="bg-surface-container-low rounded-2xl p-8 sm:p-10 border border-border-subtle space-y-6">
        <div className="space-y-1">
          <span className="text-caption text-text-muted uppercase tracking-wider font-semibold">
            Product Philosophy
          </span>
          <h2 className="font-headline-sm text-headline-sm text-text-primary font-bold tracking-tight">
            Why use Chattr.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-text-primary font-semibold font-body-md text-body-md">
              <span className="material-symbols-outlined text-secondary text-[20px]">bolt</span>
              <h4>Quick conversations</h4>
            </div>
            <p className="font-body-sm text-body-sm text-text-secondary leading-relaxed">
              No waiting in lobbies or swiping through profiles. You are matched directly with someone online ready to talk.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-text-primary font-semibold font-body-md text-body-md">
              <span className="material-symbols-outlined text-secondary text-[20px]">hub</span>
              <h4>Interest-based matching</h4>
            </div>
            <p className="font-body-sm text-body-sm text-text-secondary leading-relaxed">
              Tag your favorite hobbies or explore random chats openly. You decide what shapes the conversation.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-text-primary font-semibold font-body-md text-body-md">
              <span className="material-symbols-outlined text-secondary text-[20px]">verified_user</span>
              <h4>No complicated profile setup</h4>
            </div>
            <p className="font-body-sm text-body-sm text-text-secondary leading-relaxed">
              Zero email verification, bio requirements, or photo uploads. Your anonymity and focus remain protected.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-text-primary font-semibold font-body-md text-body-md">
              <span className="material-symbols-outlined text-secondary text-[20px]">public</span>
              <h4>Meet people from different places</h4>
            </div>
            <p className="font-body-sm text-body-sm text-text-secondary leading-relaxed">
              Discover unique global perspectives, regional ideas, and fresh viewpoints from outside your everyday circle.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Safety Section */}
      <section className="bg-surface rounded-2xl p-8 sm:p-10 shadow-sm border border-border-subtle/80 space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center shrink-0 text-secondary">
            <span className="material-symbols-outlined text-[22px]">shield</span>
          </div>
          <div className="space-y-1">
            <h2 className="font-headline-sm text-headline-sm text-text-primary font-bold tracking-tight">
              Chat safely with new people
            </h2>
            <p className="font-body-sm text-body-sm text-text-secondary">
              A respectful, safe environment starts with responsible digital boundaries.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-surface-container-low space-y-1 border border-border-subtle/40">
            <div className="flex items-center gap-2 font-semibold text-text-primary font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[16px] text-state-warning">lock</span>
              <span>Never share passwords or secrets</span>
            </div>
            <p className="font-caption text-caption text-text-secondary">
              Never share passwords, credentials, credit card details, or banking information under any circumstance.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-low space-y-1 border border-border-subtle/40">
            <div className="flex items-center gap-2 font-semibold text-text-primary font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[16px] text-state-warning">visibility_off</span>
              <span>Avoid sensitive personal data</span>
            </div>
            <p className="font-caption text-caption text-text-secondary">
              Keep your home address, exact workplace, phone number, and private social handles confidential.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-low space-y-1 border border-border-subtle/40">
            <div className="flex items-center gap-2 font-semibold text-text-primary font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[16px] text-secondary">block</span>
              <span>End or block in one tap</span>
            </div>
            <p className="font-caption text-caption text-text-secondary">
              If an interaction feels uncomfortable, skip to someone else immediately or block them permanently.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-low space-y-1 border border-border-subtle/40">
            <div className="flex items-center gap-2 font-semibold text-text-primary font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[16px] text-secondary">person_off</span>
              <span>Keep conversations online</span>
            </div>
            <p className="font-caption text-caption text-text-secondary">
              Do not arrange in-person meetings with strangers based solely on anonymous online chat conversations.
            </p>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-caption text-caption text-text-muted">
            All text messages are strictly ephemeral and discarded upon disconnect.
          </span>
          <a
            href="/safety"
            onClick={(e) => handleLinkClick(e, '/safety')}
            className="inline-flex items-center gap-1 font-body-sm text-body-sm text-secondary hover:text-primary font-semibold transition-colors shrink-0"
          >
            <span>Read full safety guidelines</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </a>
        </div>
      </section>

      {/* 5. Frequently Asked Questions */}
      <section className="space-y-6">
        <div className="text-center space-y-2 max-w-lg mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface text-text-secondary shadow-sm text-caption font-medium">
            <span className="material-symbols-outlined text-[15px] text-secondary">help</span>
            <span>Common Questions</span>
          </div>
          <h2 className="font-headline-sm text-headline-sm text-text-primary font-bold tracking-tight">
            Frequently asked questions
          </h2>
          <p className="font-body-sm text-body-sm text-text-secondary">
            Everything you need to know about starting conversations on Chattr.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((item, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={item.q}
                className="bg-surface rounded-xl border border-border-subtle/80 overflow-hidden shadow-sm transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-surface-container-low/50 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="font-body-md text-body-md text-text-primary font-semibold">
                    {item.q}
                  </span>
                  <span
                    className={`material-symbols-outlined text-text-muted transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-secondary' : ''
                    }`}
                  >
                    expand_more
                  </span>
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-text-secondary font-body-md text-body-md leading-relaxed border-t border-border-subtle/30">
                    <p>{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Final Call to Action Banner */}
      <div className="bg-surface-dark text-on-primary rounded-2xl p-8 sm:p-12 text-center space-y-6 shadow-xl">
        <div className="space-y-2 max-w-md mx-auto">
          <h3 className="font-display-hero-mobile text-display-hero-mobile font-bold tracking-tight">
            Ready to meet someone new?
          </h3>
          <p className="font-body-md text-body-md text-on-primary-variant">
            Join active people online right now. Pick an interest or jump in freely.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (onStartChatClick) {
                onStartChatClick();
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                const nameInput = document.getElementById('userName');
                if (nameInput) nameInput.focus();
              }
            }}
            className="w-full sm:w-auto px-8 h-[50px] rounded-full bg-primary text-on-primary font-body-lg text-body-lg font-medium flex items-center justify-center gap-2 shadow-md hover:opacity-95 active:scale-95 transition-all cursor-pointer"
          >
            <span>Start Random Chat</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};
