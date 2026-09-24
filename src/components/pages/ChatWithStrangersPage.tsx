import React from 'react';
import { PageLayout } from './PageLayout';

interface PageProps {
  onNavigate: (path: string) => void;
  onStartChat: () => void;
}

export const ChatWithStrangersPage: React.FC<PageProps> = ({ onNavigate, onStartChat }) => {
  return (
    <PageLayout
      title="Chat With Strangers Online | Chattr."
      description="Chat with new people online without creating a complicated social profile. Enjoy instant, low-friction, and privacy-preserving text conversations."
      canonicalPath="/chat-with-strangers"
      breadcrumbs={[
        { name: 'Home', path: '/' },
        { name: 'Chat with Strangers', path: '/chat-with-strangers' }
      ]}
      h1="Chat With New People Online"
      badge="Profile-Free Experience"
      onNavigate={onNavigate}
      onStartChat={onStartChat}
    >
      <section className="space-y-4">
        <h2 className="font-headline-sm text-headline-sm text-text-primary font-bold">
          Why Remove the Permanent Profile?
        </h2>
        <p>
          On most platforms today, starting a simple conversation requires filling out elaborate profile bios, uploading curated photographs, connecting external accounts, and managing follower counts. This introduces social anxiety, performance pressure, and friction before two people have even exchanged a single greeting.
        </p>
        <p>
          Chattr. takes the opposite approach. We believe that when you remove permanent profiles, people talk more authentically. There are no vanity metrics, no likes, and no historical timeline to scrutinize. You connect simply as two human beings with curious minds.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-headline-sm text-headline-sm text-text-primary font-bold">
          How to Initiate a Meaningful Dialogue
        </h2>
        <p>
          Starting a conversation with a new person can feel daunting if you don't know where to begin. Here are proven strategies for engaging chats:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-surface border border-border-subtle/80 space-y-2">
            <h3 className="font-body-md text-body-md font-semibold text-text-primary">1. Ask an Open Question</h3>
            <p className="font-body-sm text-body-sm text-text-secondary">
              Instead of a solitary "hey", ask: "What was the most interesting part of your day?" or "What song have you had on repeat lately?"
            </p>
          </div>
          <div className="p-4 rounded-xl bg-surface border border-border-subtle/80 space-y-2">
            <h3 className="font-body-md text-body-md font-semibold text-text-primary">2. Lean on Shared Interests</h3>
            <p className="font-body-sm text-body-sm text-text-secondary">
              If you matched around a tag like <em>Cinema</em> or <em>Gaming</em>, immediately ask what they are watching or playing right now.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-surface border border-border-subtle/80 space-y-2">
            <h3 className="font-body-md text-body-md font-semibold text-text-primary">3. Use Built-in Icebreakers</h3>
            <p className="font-body-sm text-body-sm text-text-secondary">
              Chattr. automatically suggests curated, creative prompts directly inside the chat window to spark instant curiosity.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-headline-sm text-headline-sm text-text-primary font-bold">
          Zero Data Trails & Ephemeral Privacy
        </h2>
        <p>
          Your conversation stays between you and your partner. When either participant ends the session, the room socket closes and the temporary in-memory buffer is flushed immediately.
        </p>
        <p>
          This ensures you can discuss thoughts openly without fear of your messages being crawled, indexed, or saved to a database.
        </p>
      </section>
    </PageLayout>
  );
};
