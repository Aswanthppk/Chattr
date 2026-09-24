import React from 'react';
import { PageLayout } from './PageLayout';

interface PageProps {
  onNavigate: (path: string) => void;
  onStartChat: () => void;
}

export const RandomChatPage: React.FC<PageProps> = ({ onNavigate, onStartChat }) => {
  return (
    <PageLayout
      title="Random Chat – Meet Someone New Online | Chattr."
      description="Connect instantly with real people worldwide through random chat. Choose your interests, join the queue, and start a spontaneous conversation in seconds."
      canonicalPath="/random-chat"
      breadcrumbs={[
        { name: 'Home', path: '/' },
        { name: 'Random Chat', path: '/random-chat' }
      ]}
      h1="Random Chat"
      badge="Core Experience"
      onNavigate={onNavigate}
      onStartChat={onStartChat}
    >
      <section className="space-y-4">
        <h2 className="font-headline-sm text-headline-sm text-text-primary font-bold">
          What is Random Chat on Chattr.?
        </h2>
        <p>
          Random chat is a streamlined real-time medium designed for spontaneous, one-on-one text conversations between two people online. While modern social networks emphasize permanent public personas, status updates, and curated follower graphs, Chattr. strips away the artificial noise to restore the joy of spontaneous dialogue.
        </p>
        <p>
          Whether you are looking to exchange thoughts on modern cinema, debate technological breakthroughs, practice a second language, or simply share a friendly greeting across timezones, random chat provides a direct bridge to a real person anywhere in the world.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-headline-sm text-headline-sm text-text-primary font-bold">
          How Real-Time Matchmaking Operates
        </h2>
        <p>
          When you enter the matchmaking queue, our server analyzes active participants in real time. Rather than maintaining static waiting rooms or exposing user lists, matchmaking occurs dynamically:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Interest Resonance:</strong> If you select specific topics (e.g. <em>Gaming</em>, <em>Philosophy</em>, or custom tags like <em>Photography</em>), the system prioritizes individuals seeking the same subject.
          </li>
          <li>
            <strong>Open Exploration:</strong> If you choose zero topics or select open matchmaking, you are instantly eligible to pair with any active person online.
          </li>
          <li>
            <strong>Ephemeral Rooms:</strong> The moment two people match, a temporary cryptographic room identifier is created. Messages stream directly between both participants through WebSocket connections.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-headline-sm text-headline-sm text-text-primary font-bold">
          Starting and Ending Conversations with Autonomy
        </h2>
        <p>
          A healthy random chat service must respect user autonomy. On Chattr., conversations never require commitments:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="bg-surface p-5 rounded-xl border border-border-subtle/80 space-y-2">
            <h3 className="font-body-md text-body-md font-semibold text-text-primary flex items-center gap-1.5">
              <span className="material-symbols-outlined text-secondary text-[18px]">fast_forward</span>
              Instant Skip
            </h3>
            <p className="font-body-sm text-body-sm text-text-secondary">
              If a conversation has run its natural course or the tone is not a mutual fit, tap <strong>Skip</strong> to immediately disconnect and queue for the next person.
            </p>
          </div>
          <div className="bg-surface p-5 rounded-xl border border-border-subtle/80 space-y-2">
            <h3 className="font-body-md text-body-md font-semibold text-text-primary flex items-center gap-1.5">
              <span className="material-symbols-outlined text-state-warning text-[18px]">logout</span>
              Clean Closure
            </h3>
            <p className="font-body-sm text-body-sm text-text-secondary">
              When you close your tab or leave the room, the temporary session is permanently erased. No message transcripts are stored on our servers.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-headline-sm text-headline-sm text-text-primary font-bold">
          Related Conversations & Guides
        </h2>
        <p>
          Explore related guides to learn more about spontaneous online interaction:
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          <a
            href="/random-chat-with-strangers"
            onClick={(e) => { e.preventDefault(); onNavigate('/random-chat-with-strangers'); }}
            className="px-4 py-2 rounded-full bg-surface border border-border-subtle text-text-primary hover:border-secondary transition-colors font-body-sm text-body-sm font-medium"
          >
            Random Chat with Strangers
          </a>
          <a
            href="/how-random-chat-works"
            onClick={(e) => { e.preventDefault(); onNavigate('/how-random-chat-works'); }}
            className="px-4 py-2 rounded-full bg-surface border border-border-subtle text-text-primary hover:border-secondary transition-colors font-body-sm text-body-sm font-medium"
          >
            How Random Chat Works
          </a>
          <a
            href="/safety"
            onClick={(e) => { e.preventDefault(); onNavigate('/safety'); }}
            className="px-4 py-2 rounded-full bg-surface border border-border-subtle text-text-primary hover:border-secondary transition-colors font-body-sm text-body-sm font-medium"
          >
            Safety Guidelines
          </a>
        </div>
      </section>
    </PageLayout>
  );
};
