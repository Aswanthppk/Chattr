import React from 'react';
import { PageLayout } from './PageLayout';

interface PageProps {
  onNavigate: (path: string) => void;
  onStartChat: () => void;
}

export const MeetNewPeoplePage: React.FC<PageProps> = ({ onNavigate, onStartChat }) => {
  return (
    <PageLayout
      title="Meet New People Online | Chattr."
      description="Meet new people online through interest-based random chat. Discover diverse perspectives, share hobbies, and connect without dating pressure."
      canonicalPath="/meet-new-people"
      breadcrumbs={[
        { name: 'Home', path: '/' },
        { name: 'Meet New People', path: '/meet-new-people' }
      ]}
      h1="Meet New People Through Random Chat"
      badge="Global Perspectives"
      onNavigate={onNavigate}
      onStartChat={onStartChat}
    >
      <section className="space-y-4">
        <h2 className="font-headline-sm text-headline-sm text-text-primary font-bold">
          Connecting Beyond Geographic and Social Bubbles
        </h2>
        <p>
          Most of our everyday communication takes place inside familiar circles: coworkers, classmates, family, and existing social media networks. Over time, these algorithms tend to reinforce similar opinions, tastes, and perspectives.
        </p>
        <p>
          Meeting new people through random chat breaks that cycle. A conversation on Chattr. could connect you with a student in Tokyo, an artist in Montreal, or a software engineer in Berlin. You gain exposure to life experiences and cultural viewpoints you might never otherwise encounter.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-headline-sm text-headline-sm text-text-primary font-bold">
          Conversations Centered on Curiosity, Not Dating Pressure
        </h2>
        <p>
          Chattr. is explicitly designed as a conversational platform, not a dating service. By eliminating photos, physical appearance ratings, and romantic matchmaking algorithms, interactions remain grounded in mutual intellect, creative ideas, and shared interests.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-5 rounded-xl bg-surface border border-border-subtle/80 space-y-2">
            <h3 className="font-body-md text-body-md font-semibold text-text-primary flex items-center gap-1.5">
              <span className="material-symbols-outlined text-secondary text-[18px]">psychology</span>
              Intellectual Curiosity
            </h3>
            <p className="font-body-sm text-body-sm text-text-secondary">
              Talk about history, philosophy, technological futures, or creative pursuits without pretense.
            </p>
          </div>
          <div className="p-5 rounded-xl bg-surface border border-border-subtle/80 space-y-2">
            <h3 className="font-body-md text-body-md font-semibold text-text-primary flex items-center gap-1.5">
              <span className="material-symbols-outlined text-secondary text-[18px]">palette</span>
              Niche Passions
            </h3>
            <p className="font-body-sm text-body-sm text-text-secondary">
              Have an obscure interest? Type it in our hobby finder and discover someone who shares that exact enthusiasm.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-headline-sm text-headline-sm text-text-primary font-bold">
          Healthy Boundaries for Digital Encounters
        </h2>
        <p>
          When meeting new people online, maintain healthy digital habits:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Respect Differences:</strong> People come from diverse backgrounds with varying worldviews. Approach disagreements with civility.</li>
          <li><strong>Protect Your Privacy:</strong> Enjoy the dialogue without feeling compelled to exchange private contact information.</li>
          <li><strong>Depart Politely:</strong> You can conclude any chat simply by saying goodbye or tapping Skip when it's time to move on.</li>
        </ul>
      </section>
    </PageLayout>
  );
};
