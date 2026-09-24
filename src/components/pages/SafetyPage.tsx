import React from 'react';
import { PageLayout } from './PageLayout';

interface PageProps {
  onNavigate: (path: string) => void;
  onStartChat: () => void;
}

export const SafetyPage: React.FC<PageProps> = ({ onNavigate, onStartChat }) => {
  return (
    <PageLayout
      title="Safety Guidelines – Chat Safely With Strangers | Chattr."
      description="Learn essential safety practices for random chat. Understand our anti-abuse features, blocking tools, ephemeral data policies, and personal boundary recommendations."
      canonicalPath="/safety"
      breadcrumbs={[
        { name: 'Home', path: '/' },
        { name: 'Safety', path: '/safety' }
      ]}
      h1="Chat Safely With New People"
      badge="Trust & Safety Guidelines"
      onNavigate={onNavigate}
      onStartChat={onStartChat}
    >
      <section className="space-y-4">
        <h2 className="font-headline-sm text-headline-sm text-text-primary font-bold">
          Our Commitment to Digital Safety
        </h2>
        <p>
          At Chattr., we design every feature with user safety, privacy, and autonomy as the highest priorities. While random chat provides a wonderful opportunity for spontaneous conversations, meeting people online always demands healthy digital hygiene and smart personal boundaries.
        </p>
      </section>

      {/* Core Rules for Safe Chatting */}
      <section className="space-y-6">
        <h2 className="font-headline-sm text-headline-sm text-text-primary font-bold">
          Essential Safety Rules
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-surface rounded-xl p-6 border border-border-subtle/80 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-text-primary font-body-md text-body-md">
              <span className="material-symbols-outlined text-state-warning text-[20px]">password</span>
              <span>1. Guard Passwords & Financial Data</span>
            </div>
            <p className="font-body-sm text-body-sm text-text-secondary leading-relaxed">
              Never disclose passwords, two-factor authentication codes, credit card numbers, cryptocurrency wallet keys, or bank details. Chattr. staff will never ask for this information.
            </p>
          </div>

          <div className="bg-surface rounded-xl p-6 border border-border-subtle/80 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-text-primary font-body-md text-body-md">
              <span className="material-symbols-outlined text-state-warning text-[20px]">home_pin</span>
              <span>2. Keep Real-World Details Private</span>
            </div>
            <p className="font-body-sm text-body-sm text-text-secondary leading-relaxed">
              Avoid sharing your physical address, current GPS location, place of employment, educational institution, phone number, or personal social media handles.
            </p>
          </div>

          <div className="bg-surface rounded-xl p-6 border border-border-subtle/80 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-text-primary font-body-md text-body-md">
              <span className="material-symbols-outlined text-secondary text-[20px]">no_meeting_room</span>
              <span>3. Do Not Meet in Person</span>
            </div>
            <p className="font-body-sm text-body-sm text-text-secondary leading-relaxed">
              Do not arrange real-world meetings with strangers based solely on random online conversations. Maintain conversations within the safe, ephemeral confines of the app.
            </p>
          </div>

          <div className="bg-surface rounded-xl p-6 border border-border-subtle/80 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-text-primary font-body-md text-body-md">
              <span className="material-symbols-outlined text-state-warning text-[20px]">link_off</span>
              <span>4. Beware of Suspicious Links</span>
            </div>
            <p className="font-body-sm text-body-sm text-text-secondary leading-relaxed">
              Never click on external URLs, download unexpected attachments, or visit unfamiliar websites sent by strangers, as they may lead to phishing scams or malicious software.
            </p>
          </div>
        </div>
      </section>

      {/* In-App Safety Features */}
      <section className="space-y-4">
        <h2 className="font-headline-sm text-headline-sm text-text-primary font-bold">
          Built-in Protection Tools
        </h2>
        <p>
          We provide several real-time controls directly inside the chat interface to protect your peace of mind:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Instant Skip:</strong> Located prominently in the top bar. You can exit any conversation with a single tap and immediately search for another person.
          </li>
          <li>
            <strong>Permanent Block:</strong> Tapping "Block User" instantly adds the user to your client-side exclusion list. Our server will never pair you with that individual again.
          </li>
          <li>
            <strong>Abuse Reporting:</strong> If someone violates community guidelines, you can file a quick report. Repeatedly reported sockets are removed from the live matchmaking queue.
          </li>
          <li>
            <strong>Ephemeral Memory:</strong> Chattr. does not write chat transcripts to a database. Once a session ends, the dialogue is deleted permanently.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-headline-sm text-headline-sm text-text-primary font-bold">
          Community Conduct
        </h2>
        <p>
          Harassment, hate speech, threats, sexual exploitation, spamming, and non-consensual graphic content are strictly prohibited. For a full breakdown of expected behavior, please review our{' '}
          <a
            href="/community-guidelines"
            onClick={(e) => { e.preventDefault(); onNavigate('/community-guidelines'); }}
            className="text-secondary hover:text-primary font-medium underline underline-offset-2"
          >
            Community Guidelines
          </a>.
        </p>
      </section>
    </PageLayout>
  );
};
