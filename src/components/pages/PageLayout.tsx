import React from 'react';
import { MetaManager } from '../seo/MetaManager';
import { Footer } from '../seo/Footer';

interface BreadcrumbItem {
  name: string;
  path: string;
}

interface PageLayoutProps {
  title: string;
  description: string;
  canonicalPath: string;
  breadcrumbs: BreadcrumbItem[];
  h1: string;
  badge?: string;
  onNavigate: (path: string) => void;
  onStartChat: () => void;
  children: React.ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  description,
  canonicalPath,
  breadcrumbs,
  h1,
  badge = 'Guide',
  onNavigate,
  onStartChat,
  children
}) => {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': breadcrumbs.map((crumb, idx) => ({
      '@type': 'ListItem',
      'position': idx + 1,
      'name': crumb.name,
      'item': `https://chattr.app${crumb.path === '/' ? '' : crumb.path}`
    }))
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    onNavigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full min-h-screen bg-background text-text-primary flex flex-col font-sans selection:bg-[#e3dfff] selection:text-[#5146d0]">
      <MetaManager
        title={title}
        description={description}
        canonicalPath={canonicalPath}
        jsonLd={breadcrumbSchema}
      />

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-surface/85 backdrop-blur-md border-b border-border-subtle/80">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <a
            href="/"
            onClick={(e) => handleLinkClick(e, '/')}
            className="flex items-center gap-2 group"
          >
            <img
              src="/icons/chattr-icon-96x96.png"
              alt="Chattr. Logo"
              className="w-7 h-7 rounded-full shadow-sm object-cover transition-transform duration-300 group-hover:scale-105 shrink-0"
            />
            <span className="font-headline-sm text-headline-sm text-text-primary font-bold tracking-tight">
              Chattr<span className="text-secondary">.</span>
            </span>
          </a>

          <div className="flex items-center gap-3">
            <a
              href="/safety"
              onClick={(e) => handleLinkClick(e, '/safety')}
              className="hidden sm:inline-block font-body-sm text-body-sm text-text-secondary hover:text-text-primary transition-colors px-2 py-1"
            >
              Safety
            </a>
            <button
              type="button"
              onClick={onStartChat}
              className="h-9 px-4 rounded-full bg-primary text-on-primary font-caption text-caption font-medium flex items-center gap-1.5 shadow-sm hover:opacity-95 active:scale-95 transition-all cursor-pointer"
            >
              <span>Start Random Chat</span>
              <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-6 pt-10 pb-16">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumbs" className="mb-6">
          <ol className="flex items-center gap-2 font-caption text-caption text-text-muted">
            {breadcrumbs.map((crumb, idx) => (
              <li key={crumb.path} className="flex items-center gap-2">
                {idx > 0 && <span className="text-border-subtle">/</span>}
                {idx === breadcrumbs.length - 1 ? (
                  <span className="text-text-secondary font-medium" aria-current="page">
                    {crumb.name}
                  </span>
                ) : (
                  <a
                    href={crumb.path}
                    onClick={(e) => handleLinkClick(e, crumb.path)}
                    className="hover:text-primary transition-colors"
                  >
                    {crumb.name}
                  </a>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {/* Hero Header of Article */}
        <header className="space-y-3 pb-8 border-b border-border-subtle">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-label-sm font-semibold">
            {badge}
          </div>
          <h1 className="font-display-hero-mobile text-display-hero-mobile sm:text-headline-lg font-bold text-text-primary tracking-tight">
            {h1}
          </h1>
          <p className="font-body-lg text-body-lg text-text-secondary leading-relaxed">
            {description}
          </p>
        </header>

        {/* Body Sections */}
        <article className="pt-8 space-y-10 font-body-md text-body-md text-text-secondary leading-relaxed">
          {children}
        </article>

        {/* Bottom CTA Box */}
        <div className="mt-16 bg-surface rounded-2xl p-8 border border-border-subtle/80 shadow-sm text-center space-y-4">
          <h3 className="font-headline-sm text-headline-sm text-text-primary font-bold">
            Start a random conversation now
          </h3>
          <p className="font-body-sm text-body-sm text-text-secondary max-w-md mx-auto">
            Experience spontaneous, privacy-first conversations. Select your favorite hobbies or connect freely with someone new in seconds.
          </p>
          <div className="pt-2 flex justify-center">
            <button
              type="button"
              onClick={onStartChat}
              className="h-12 px-8 rounded-full bg-primary text-on-primary font-body-md text-body-md font-semibold flex items-center gap-2 shadow-md hover:opacity-95 active:scale-95 transition-all cursor-pointer"
            >
              <span>Start Random Chat</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </main>

      {/* Structured Footer */}
      <Footer onNavigate={onNavigate} />
    </div>
  );
};
