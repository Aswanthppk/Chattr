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
            Stage 2: Interest & Mode Selection
          </h3>
          <p>
            On the interest screen, you can select up to five conversation tags (such as <em>Technology</em>, <em>Music</em>, or <em>Gaming</em>), or type any custom hobby. You also choose your preferred chat mode: <strong>Text Chat</strong> or <strong>Video Chat</strong>. Video chatters are strictly paired only with other video callers.
          </p>
        </div>

        <div className="border-l-2 border-secondary pl-6 space-y-2 relative">
          <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-secondary ring-4 ring-background" />
          <h3 className="font-headline-sm text-headline-sm text-text-primary font-semibold">
            Stage 3: Live Radar Matchmaking
          </h3>
          <p>
            Your client emits a secure match request to our Node.js matchmaking engine via Socket.IO. The engine evaluates waiting peers in the same mode, respects mutual block lists, checks interest intersections, and forms a mutual connection. Both peers are instantly routed into an active session without requiring manual confirmation.
          </p>
        </div>

        <div className="border-l-2 border-secondary pl-6 space-y-2 relative">
          <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-secondary ring-4 ring-background" />
          <h3 className="font-headline-sm text-headline-sm text-text-primary font-semibold">
            Stage 4: Active Text Chat or Live Video Call
          </h3>
          <p>
            In text chat mode, messages stream via encrypted bidirectional WebSocket connections with live typing indicators and icebreakers. In video chat mode, participants connect directly peer-to-peer via WebRTC with live microphone and camera controls, with zero video streams stored on any server.
          </p>
        </div>

        <div className="border-l-2 border-secondary pl-6 space-y-2 relative">
          <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-secondary ring-4 ring-background" />
          <h3 className="font-headline-sm text-headline-sm text-text-primary font-semibold">
            Stage 5: Session Termination & Discard
          </h3>
          <p>
            When either person clicks <strong>Next / Skip</strong>, <strong>End Chat</strong>, or closes their browser tab, the room and WebRTC connection dismantle immediately. Camera and microphone tracks stop instantly, and the server purges the session from memory for zero data retention.
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
