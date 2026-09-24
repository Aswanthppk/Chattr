import React from 'react';
import { PageLayout } from './PageLayout';

interface PageProps {
  onNavigate: (path: string) => void;
  onStartChat: () => void;
}

export const HowItWorksPage: React.FC<PageProps> = ({ onNavigate, onStartChat }) => {
  return (
    <PageLayout
      title="How Random Chat Works – Step-by-Step Guide | Chattr."
      description="Understand how Chattr matches you with active people online in real time. Learn about our radar matchmaking, custom hobby filters, and ephemeral rooms."
      canonicalPath="/how-random-chat-works"
      breadcrumbs={[
        { name: 'Home', path: '/' },
        { name: 'How It Works', path: '/how-random-chat-works' }
      ]}
      h1="How Random Chat Works"
      badge="Technical & User Guide"
      onNavigate={onNavigate}
      onStartChat={onStartChat}
    >
      <section className="space-y-4">
        <h2 className="font-headline-sm text-headline-sm text-text-primary font-bold">
          The Lifecycle of a Conversation
        </h2>
        <p>
          Chattr. is built with modern WebSockets and real-time event streaming to deliver an instantaneous, lag-free chat experience. Here is an overview of what occurs behind the scenes from the moment you visit until your chat concludes.
        </p>
      </section>

      {/* Step by Step Breakdown */}
      <section className="space-y-6">
        <div className="border-l-2 border-secondary pl-6 space-y-2 relative">
          <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-secondary ring-4 ring-background" />
          <h3 className="font-headline-sm text-headline-sm text-text-primary font-semibold">
            Stage 1: Choosing a Pseudonym
          </h3>
          <p>
            When you land on the welcome screen, you choose any name you'd like to be called, or tap the dice icon to generate a spontaneous pseudonym like <em>Cosmos</em>, <em>Nomad</em>, or <em>Sol</em>. No registration, email confirmation, or password creation is ever requested.
          </p>
        </div>

        <div className="border-l-2 border-secondary pl-6 space-y-2 relative">
          <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-secondary ring-4 ring-background" />
          <h3 className="font-headline-sm text-headline-sm text-text-primary font-semibold">
            Stage 2: Interest Selection or Open Matching
          </h3>
          <p>
            On the interest screen, you can select up to five conversation tags (such as <em>Technology</em>, <em>Music</em>, or <em>Gaming</em>), or type any custom hobby (e.g. <em>Astrophotography</em>, <em>Archery</em>). Alternatively, you can leave all interests unselected to connect freely with anyone available in the global queue.
          </p>
        </div>

        <div className="border-l-2 border-secondary pl-6 space-y-2 relative">
          <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-secondary ring-4 ring-background" />
          <h3 className="font-headline-sm text-headline-sm text-text-primary font-semibold">
            Stage 3: Live Radar Matchmaking
          </h3>
          <p>
            Your client emits a secure match request to our Node.js matchmaking engine via Socket.IO. The engine evaluates waiting peers, respects mutual block lists, checks interest intersections, and forms a mutual connection. Both peers are instantly routed into an active chat room without requiring manual confirmation.
          </p>
        </div>

        <div className="border-l-2 border-secondary pl-6 space-y-2 relative">
          <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-secondary ring-4 ring-background" />
          <h3 className="font-headline-sm text-headline-sm text-text-primary font-semibold">
            Stage 4: Active Chat & Ephemeral Messaging
          </h3>
          <p>
            Messages travel via encrypted bidirectional WebSocket connections directly into your view. You see ambient typing signals, read receipts, and curated icebreaker questions. You can chat as long as you desire.
          </p>
        </div>

        <div className="border-l-2 border-secondary pl-6 space-y-2 relative">
          <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-secondary ring-4 ring-background" />
          <h3 className="font-headline-sm text-headline-sm text-text-primary font-semibold">
            Stage 5: Session Termination & Discard
          </h3>
          <p>
            When either person clicks <strong>Skip</strong>, <strong>End Chat</strong>, or closes their browser tab, the room is dismantled immediately. The server purges the room state from memory, ensuring zero data retention.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-headline-sm text-headline-sm text-text-primary font-bold">
          Why Real-Time Architecture Matters
        </h2>
        <p>
          Traditional polling-based web apps suffer from message delays, high battery drain, and sluggish interactions. By maintaining persistent WebSocket connections, Chattr. delivers sub-50ms message latency, giving your conversations the natural cadence of a real-life face-to-face dialogue.
        </p>
      </section>
    </PageLayout>
  );
};
