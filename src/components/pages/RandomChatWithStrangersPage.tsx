import React from 'react';
import { PageLayout } from './PageLayout';

interface PageProps {
  onNavigate: (path: string) => void;
  onStartChat: () => void;
}

export const RandomChatWithStrangersPage: React.FC<PageProps> = ({ onNavigate, onStartChat }) => {
  return (
    <PageLayout
      title="Random Chat With Strangers Online | Chattr."
      description="Talk to strangers online responsibly through ephemeral random chat. Experience spontaneous encounters, interest-based pairing, and complete user privacy."
      canonicalPath="/random-chat-with-strangers"
      breadcrumbs={[
        { name: 'Home', path: '/' },
        { name: 'Random Chat with Strangers', path: '/random-chat-with-strangers' }
      ]}
      h1="Random Chat With Strangers"
      badge="Spontaneous Encounters"
      onNavigate={onNavigate}
      onStartChat={onStartChat}
    >
      <section className="space-y-4">
        <h2 className="font-headline-sm text-headline-sm text-text-primary font-bold">
          The Value of Spontaneous Encounters
        </h2>
        <p>
          Speaking with someone you have never met before can be one of the most refreshing ways to broaden your world. Unlike conventional social networks where interactions are shaped by mutual acquaintances and existing social circles, chatting with a stranger offers an unfiltered exchange of ideas without preconceived expectations.
        </p>
        <p>
          At Chattr., we believe spontaneous communication is most rewarding when built on a foundation of dignity, mutual curiosity, and user control.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-headline-sm text-headline-sm text-text-primary font-bold">
          Interest-Guided Conversations
        </h2>
        <p>
          While the word "stranger" might imply complete unpredictability, Chattr. allows you to anchor your chats in shared curiosity. You can choose to discuss:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Creative Arts & Literature:</strong> Discover recommended novels, underground music scenes, and indie cinema.</li>
          <li><strong>Technology & Science:</strong> Debate emerging artificial intelligence tools, space exploration, and programming paradigms.</li>
          <li><strong>Language Practice:</strong> Converse naturally with native speakers across different continents.</li>
          <li><strong>Everyday Reflections:</strong> Unwind after a busy workday with someone who is simply looking for a lighthearted discussion.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-headline-sm text-headline-sm text-text-primary font-bold">
          Prioritizing Personal Boundaries & Control
        </h2>
        <p>
          Engaging in random chat with strangers should always happen on your own terms. We recommend keeping these principles in mind:
        </p>
        <div className="bg-surface rounded-xl p-6 border border-border-subtle/80 space-y-3">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">verified_user</span>
            <div>
              <h4 className="font-body-md text-body-md font-semibold text-text-primary">Keep It Strictly Ephemeral</h4>
              <p className="font-body-sm text-body-sm text-text-secondary">
                You do not need to share your identity to have a memorable conversation. Use a pseudonym and enjoy the present dialogue.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-state-warning text-[20px] mt-0.5">security</span>
            <div>
              <h4 className="font-body-md text-body-md font-semibold text-text-primary">Protect Personal Data</h4>
              <p className="font-body-sm text-body-sm text-text-secondary">
                Never disclose sensitive information such as financial credentials, physical addresses, or workplace details.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-headline-sm text-headline-sm text-text-primary font-bold">
          Helpful Resources
        </h2>
        <div className="flex flex-wrap gap-3">
          <a
            href="/chat-with-strangers"
            onClick={(e) => { e.preventDefault(); onNavigate('/chat-with-strangers'); }}
            className="px-4 py-2 rounded-full bg-surface border border-border-subtle text-text-primary hover:border-secondary transition-colors font-body-sm text-body-sm font-medium"
          >
            Chat with Strangers Online
          </a>
          <a
            href="/safety"
            onClick={(e) => { e.preventDefault(); onNavigate('/safety'); }}
            className="px-4 py-2 rounded-full bg-surface border border-border-subtle text-text-primary hover:border-secondary transition-colors font-body-sm text-body-sm font-medium"
          >
            Read Safety Tips
          </a>
        </div>
      </section>
    </PageLayout>
  );
};
