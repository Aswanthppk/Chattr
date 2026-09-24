import React from 'react';
import { PageLayout } from './PageLayout';

interface PageProps {
  onNavigate: (path: string) => void;
  onStartChat: () => void;
}

export const CommunityGuidelinesPage: React.FC<PageProps> = ({ onNavigate, onStartChat }) => {
  return (
    <PageLayout
      title="Community Guidelines | Chattr."
      description="Explore the Chattr. Community Guidelines. Learn our rules on respect, non-harassment, anti-spam, and responsible communication."
      canonicalPath="/community-guidelines"
      breadcrumbs={[
        { name: 'Home', path: '/' },
        { name: 'Community Guidelines', path: '/community-guidelines' }
      ]}
      h1="Community Guidelines"
      badge="Safety & Respect"
      onNavigate={onNavigate}
      onStartChat={onStartChat}
    >
      <section className="space-y-4">
        <h2 className="font-headline-sm text-headline-sm text-text-primary font-bold">
          Our Standard of Mutual Respect
        </h2>
        <p>
          Chattr. brings together diverse individuals from across the globe with unique viewpoints, backgrounds, and languages. To keep random chat an enjoyable and safe experience for everyone, we ask all participants to abide by these clear guidelines.
        </p>
      </section>

      <section className="space-y-6">
        <div className="bg-surface rounded-xl p-6 border border-border-subtle/80 space-y-2">
          <h3 className="font-body-md text-body-md font-semibold text-text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-state-success text-[20px]">thumb_up</span>
            Treat Others With Dignity
          </h3>
          <p className="font-body-sm text-body-sm text-text-secondary">
            Approach every encounter with kindness and curiosity. Remember that behind every pseudonym is a real human being with feelings and perspectives.
          </p>
        </div>

        <div className="bg-surface rounded-xl p-6 border border-border-subtle/80 space-y-2">
          <h3 className="font-body-md text-body-md font-semibold text-text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-error text-[20px]">block</span>
            Zero Tolerance for Harassment & Hate
          </h3>
          <p className="font-body-sm text-body-sm text-text-secondary">
            Racism, misogyny, homophobia, transphobia, religious intolerance, and targeted bullying are strictly prohibited and will lead to an immediate ban.
          </p>
        </div>

        <div className="bg-surface rounded-xl p-6 border border-border-subtle/80 space-y-2">
          <h3 className="font-body-md text-body-md font-semibold text-text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-state-warning text-[20px]">report</span>
            No Inappropriate or Exploitative Content
          </h3>
          <p className="font-body-sm text-body-sm text-text-secondary">
            Sharing sexually explicit material, promoting non-consensual imagery, or distributing predatory communications will be met with immediate network exclusion.
          </p>
        </div>

        <div className="bg-surface rounded-xl p-6 border border-border-subtle/80 space-y-2">
          <h3 className="font-body-md text-body-md font-semibold text-text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">campaign</span>
            No Commercial Advertising or Spam
          </h3>
          <p className="font-body-sm text-body-sm text-text-secondary">
            Do not copy-paste automated marketing scripts, promote affiliate links, or solicit commercial services. Chattr. is dedicated to personal human conversations.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-headline-sm text-headline-sm text-text-primary font-bold">
          Enforcement & Moderation
        </h2>
        <p>
          We rely on both automated traffic filtering and community reporting to identify abusive actors. If you encounter someone violating these rules, please use the in-app <strong>Report</strong> and <strong>Block</strong> features immediately.
        </p>
      </section>
    </PageLayout>
  );
};
