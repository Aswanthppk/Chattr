import React from 'react';
import { PageLayout } from './PageLayout';

interface PageProps {
  onNavigate: (path: string) => void;
  onStartChat: () => void;
}

export const PrivacyPage: React.FC<PageProps> = ({ onNavigate, onStartChat }) => {
  return (
    <PageLayout
      title="Privacy Policy | Chattr."
      description="Read the Chattr. Privacy Policy. Understand our zero-retention architecture, ephemeral messaging protocols, and data protection practices."
      canonicalPath="/privacy"
      breadcrumbs={[
        { name: 'Home', path: '/' },
        { name: 'Privacy Policy', path: '/privacy' }
      ]}
      h1="Privacy Policy"
      badge="Legal & Privacy"
      onNavigate={onNavigate}
      onStartChat={onStartChat}
    >
      <section className="space-y-4">
        <p className="text-caption text-text-muted">Last Updated: September 2026</p>
        <h2 className="font-headline-sm text-headline-sm text-text-primary font-bold">
          1. The Ephemeral Principle
        </h2>
        <p>
          Chattr. is architected from the ground up around data minimization and ephemerality. Unlike traditional messaging platforms and social networks that maintain permanent archives of your text history and media uploads, Chattr. does not retain chat transcripts on any permanent storage medium.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-headline-sm text-headline-sm text-text-primary font-bold">
          2. Information We Do Not Collect
        </h2>
        <p>
          To maintain strict user anonymity, we deliberately avoid gathering:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Real names, national identifiers, or government IDs.</li>
          <li>Email addresses, phone numbers, or passwords.</li>
          <li>Contacts, social media graphs, or address books.</li>
          <li>Precise GPS location coordinates.</li>
          <li>Saved chat transcripts, text archives, or shared file attachments.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-headline-sm text-headline-sm text-text-primary font-bold">
          3. Technical Information Used for Routing
        </h2>
        <p>
          To operate the live WebSocket matchmaking queue and prevent platform abuse (such as automated bot floods or DDoS attacks), our servers process transient network identifiers (IP addresses and socket IDs) strictly in memory. These transient data points are never linked to personal profiles and are flushed upon connection termination.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-headline-sm text-headline-sm text-text-primary font-bold">
          4. Cookies and Local Storage
        </h2>
        <p>
          Chattr. does not use invasive advertising cookies or cross-site tracking pixels. We use standard browser session storage solely to maintain your temporary pseudonym and client-side block list during your active visit.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-headline-sm text-headline-sm text-text-primary font-bold">
          5. Contacting the Data Controller
        </h2>
        <p>
          If you have questions regarding this Privacy Policy or wish to inquire about our ephemeral architecture, please reach out via our{' '}
          <a
            href="/contact"
            onClick={(e) => { e.preventDefault(); onNavigate('/contact'); }}
            className="text-secondary hover:text-primary font-medium underline underline-offset-2"
          >
            Contact page
          </a>.
        </p>
      </section>
    </PageLayout>
  );
};
