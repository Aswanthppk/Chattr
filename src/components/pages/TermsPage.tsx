import React from 'react';
import { PageLayout } from './PageLayout';

interface PageProps {
  onNavigate: (path: string) => void;
  onStartChat: () => void;
}

export const TermsPage: React.FC<PageProps> = ({ onNavigate, onStartChat }) => {
  return (
    <PageLayout
      title="Terms of Service | Chattr."
      description="Read the Terms of Service for using Chattr. Learn about acceptable use, user obligations, intellectual property, and service limitations."
      canonicalPath="/terms"
      breadcrumbs={[
        { name: 'Home', path: '/' },
        { name: 'Terms of Service', path: '/terms' }
      ]}
      h1="Terms of Service"
      badge="Legal Agreement"
      onNavigate={onNavigate}
      onStartChat={onStartChat}
    >
      <section className="space-y-4">
        <p className="text-caption text-text-muted">Effective Date: September 2026</p>
        <h2 className="font-headline-sm text-headline-sm text-text-primary font-bold">
          1. Acceptance of Terms
        </h2>
        <p>
          By accessing or using the Chattr. web application, you agree to be bound by these Terms of Service and our Community Guidelines. If you do not agree to these terms, you must discontinue using the platform immediately.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-headline-sm text-headline-sm text-text-primary font-bold">
          2. Eligibility & Age Requirements
        </h2>
        <p>
          Chattr. is intended for users who are at least 18 years of age (or the age of majority in your jurisdiction). The platform is not intended for or directed toward children under 13 years of age.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-headline-sm text-headline-sm text-text-primary font-bold">
          3. Prohibited Conduct
        </h2>
        <p>
          You agree not to engage in any of the following activities on Chattr.:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Transmitting unsolicited commercial promotions, advertising, or spam.</li>
          <li>Engaging in harassment, stalking, hate speech, defamation, or threats of violence.</li>
          <li>Sharing sexually explicit, abusive, or non-consensual media.</li>
          <li>Distributing malware, phishing URLs, or automated bot scripts.</li>
          <li>Attempting to interfere with the network security or matchmaking operations of the service.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-headline-sm text-headline-sm text-text-primary font-bold">
          4. Disclaimer of Warranties
        </h2>
        <p>
          Chattr. is provided on an "as is" and "as available" basis without warranties of any kind. We do not guarantee uninterrupted availability, error-free operation, or that fellow users will behave courteously at all times. Users are urged to exercise personal judgment and maintain safe digital boundaries.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-headline-sm text-headline-sm text-text-primary font-bold">
          5. Termination
        </h2>
        <p>
          We reserve the right to ban, rate-limit, or restrict IP addresses and socket clients that violate these terms or compromise community safety.
        </p>
      </section>
    </PageLayout>
  );
};
