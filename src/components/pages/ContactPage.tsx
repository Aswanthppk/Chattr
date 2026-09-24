import React, { useState } from 'react';
import { PageLayout } from './PageLayout';

interface PageProps {
  onNavigate: (path: string) => void;
  onStartChat: () => void;
}

export const ContactPage: React.FC<PageProps> = ({ onNavigate, onStartChat }) => {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('general');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmitted(true);
  };

  return (
    <PageLayout
      title="Contact Us | Chattr."
      description="Get in touch with the Chattr. team. Send feedback, report safety concerns, or submit technical inquiries."
      canonicalPath="/contact"
      breadcrumbs={[
        { name: 'Home', path: '/' },
        { name: 'Contact', path: '/contact' }
      ]}
      h1="Contact Chattr."
      badge="Support & Feedback"
      onNavigate={onNavigate}
      onStartChat={onStartChat}
    >
      <section className="space-y-4">
        <p>
          We welcome your feedback, bug reports, and safety inquiries. Because Chattr. does not store user accounts or personal profiles, please provide as much context as possible when reaching out regarding a technical issue or general suggestion.
        </p>
      </section>

      <section className="bg-surface rounded-2xl p-6 sm:p-8 border border-border-subtle/80 shadow-sm space-y-6">
        {submitted ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-12 h-12 rounded-full bg-state-success/15 text-state-success mx-auto flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">check_circle</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-text-primary font-bold">
              Message Received
            </h3>
            <p className="font-body-sm text-body-sm text-text-secondary max-w-sm mx-auto">
              Thank you for reaching out. We review all community correspondence and will respond if further information is required.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="contactEmail" className="font-label-sm text-label-sm font-semibold text-text-primary">
                Your Email (optional)
              </label>
              <input
                id="contactEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full h-11 px-3 rounded-lg bg-surface-container-low border border-border-subtle text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-secondary/30"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="contactSubject" className="font-label-sm text-label-sm font-semibold text-text-primary">
                Inquiry Category
              </label>
              <select
                id="contactSubject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full h-11 px-3 rounded-lg bg-surface-container-low border border-border-subtle text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary/30"
              >
                <option value="general">General Feedback & Ideas</option>
                <option value="safety">Trust & Safety Escalation</option>
                <option value="technical">Technical Bug Report</option>
                <option value="privacy">Privacy & Legal Inquiry</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="contactMessage" className="font-label-sm text-label-sm font-semibold text-text-primary">
                Message Details
              </label>
              <textarea
                id="contactMessage"
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your inquiry or feedback..."
                className="w-full p-3 rounded-lg bg-surface-container-low border border-border-subtle text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-secondary/30"
              />
            </div>

            <button
              type="submit"
              className="h-11 px-6 rounded-full bg-primary text-on-primary font-body-sm text-body-sm font-semibold hover:opacity-95 active:scale-95 transition-all cursor-pointer"
            >
              Send Message
            </button>
          </form>
        )}
      </section>

      <section className="space-y-2 pt-4">
        <h3 className="font-body-md text-body-md font-semibold text-text-primary">Direct Contact</h3>
        <p className="font-body-sm text-body-sm text-text-secondary">
          You can also reach our administrative desk directly via email at <code className="bg-surface-container px-1.5 py-0.5 rounded text-xs text-text-primary">support@chattr.app</code>.
        </p>
      </section>
    </PageLayout>
  );
};
