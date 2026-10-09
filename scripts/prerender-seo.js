import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, '..', 'dist');

function buildHeaderHtml() {
  return `
    <header class="sticky top-0 z-40 bg-surface/85 backdrop-blur-md border-b border-border-subtle/80">
      <div class="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="/" class="flex items-center gap-2 group">
          <img src="/icons/chattr-icon-96x96.png" alt="Chattr. Logo" class="w-7 h-7 rounded-full shadow-sm object-cover transition-transform duration-300 group-hover:scale-105 shrink-0" />
          <span class="font-headline-sm text-headline-sm text-text-primary font-bold tracking-tight">
            Chattr<span class="text-secondary">.</span>
          </span>
        </a>
        <div class="flex items-center gap-3">
          <a href="/safety" class="hidden sm:inline-block font-body-sm text-body-sm text-text-secondary hover:text-text-primary transition-colors px-2 py-1">
            Safety
          </a>
          <a href="/" class="h-9 px-4 rounded-full bg-primary text-on-primary font-caption text-caption font-medium flex items-center gap-1.5 shadow-sm hover:opacity-95 transition-all cursor-pointer">
            <span>Start Random Chat</span>
            <span class="material-symbols-outlined text-[15px]">arrow_forward</span>
          </a>
        </div>
      </div>
    </header>
  `.trim();
}

function buildFooterHtml() {
  return `
    <footer class="mt-auto border-t border-border-subtle bg-surface/60 py-12 px-6">
      <div class="max-w-4xl mx-auto space-y-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div class="space-y-3 md:col-span-1">
            <div class="flex items-center gap-2">
              <img src="/icons/chattr-icon-96x96.png" alt="Chattr. Icon" class="w-6 h-6 rounded-full" />
              <span class="font-headline-sm text-headline-sm text-text-primary font-bold">Chattr.</span>
            </div>
            <p class="font-body-sm text-body-sm text-text-secondary leading-relaxed">
              Spontaneous, real-time random text and video chat connecting curious minds across the world.
            </p>
          </div>
          <div>
            <h4 class="font-label-sm text-label-sm font-semibold text-text-primary mb-3 uppercase tracking-wider">Chat Modes</h4>
            <ul class="space-y-2 font-body-sm text-body-sm text-text-secondary">
              <li><a href="/random-chat" class="hover:text-primary transition-colors">Random Chat</a></li>
              <li><a href="/random-chat-with-strangers" class="hover:text-primary transition-colors">Chat With Strangers</a></li>
              <li><a href="/chat-with-strangers" class="hover:text-primary transition-colors">Text Conversations</a></li>
              <li><a href="/meet-new-people" class="hover:text-primary transition-colors">Meet New People</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-label-sm text-label-sm font-semibold text-text-primary mb-3 uppercase tracking-wider">Guides & Trust</h4>
            <ul class="space-y-2 font-body-sm text-body-sm text-text-secondary">
              <li><a href="/how-random-chat-works" class="hover:text-primary transition-colors">How It Works</a></li>
              <li><a href="/safety" class="hover:text-primary transition-colors">Safety Guidelines</a></li>
              <li><a href="/community-guidelines" class="hover:text-primary transition-colors">Community Rules</a></li>
              <li><a href="/contact" class="hover:text-primary transition-colors">Contact Us</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-label-sm text-label-sm font-semibold text-text-primary mb-3 uppercase tracking-wider">Legal</h4>
            <ul class="space-y-2 font-body-sm text-body-sm text-text-secondary">
              <li><a href="/privacy" class="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" class="hover:text-primary transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div class="pt-6 border-t border-border-subtle/60 flex flex-col sm:flex-row items-center justify-between text-caption text-caption text-text-muted gap-4">
          <p>© 2026 Chattr. Ephemeral Realtime Chat. All rights reserved.</p>
          <p class="flex items-center gap-1">
            <span>Built for privacy & spontaneous human connection.</span>
          </p>
        </div>
      </div>
    </footer>
  `.trim();
}

function buildPageLayout(opts) {
  const { title, description, badge, h1, breadcrumbs, contentHtml } = opts;

  const breadcrumbListHtml = breadcrumbs.map((crumb, idx) => {
    const isLast = idx === breadcrumbs.length - 1;
    return `
      <li class="flex items-center gap-2">
        ${idx > 0 ? '<span class="text-border-subtle">/</span>' : ''}
        ${isLast
          ? `<span class="text-text-secondary font-medium" aria-current="page">${crumb.name}</span>`
          : `<a href="${crumb.path}" class="hover:text-primary transition-colors">${crumb.name}</a>`
        }
      </li>
    `;
  }).join('');

  return `
    <div class="w-full min-h-screen bg-background text-text-primary flex flex-col font-sans selection:bg-[#e3dfff] selection:text-[#5146d0]">
      ${buildHeaderHtml()}
      <main class="flex-1 w-full max-w-3xl mx-auto px-6 pt-10 pb-16">
        <nav aria-label="Breadcrumbs" class="mb-6">
          <ol class="flex items-center gap-2 font-caption text-caption text-text-muted">
            ${breadcrumbListHtml}
          </ol>
        </nav>
        <header class="space-y-3 pb-8 border-b border-border-subtle">
          <div class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-label-sm font-semibold">
            ${badge}
          </div>
          <h1 class="font-display-hero-mobile text-display-hero-mobile sm:text-headline-lg font-bold text-text-primary tracking-tight">
            ${h1}
          </h1>
          <p class="font-body-lg text-body-lg text-text-secondary leading-relaxed">
            ${description}
          </p>
        </header>
        <article class="pt-8 space-y-10 font-body-md text-body-md text-text-secondary leading-relaxed">
          ${contentHtml}
        </article>
        <div class="mt-16 bg-surface rounded-2xl p-8 border border-border-subtle/80 shadow-sm text-center space-y-4">
          <h3 class="font-headline-sm text-headline-sm text-text-primary font-bold">
            Start a random conversation now
          </h3>
          <p class="font-body-sm text-body-sm text-text-secondary max-w-md mx-auto">
            Experience spontaneous, privacy-first conversations. Select your favorite hobbies or connect freely with someone new in seconds.
          </p>
          <div class="pt-2 flex justify-center">
            <a href="/" class="h-12 px-8 rounded-full bg-primary text-on-primary font-body-md text-body-md font-semibold flex items-center gap-2 shadow-md hover:opacity-95 transition-all cursor-pointer">
              <span>Start Random Chat</span>
              <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
            </a>
          </div>
        </div>
      </main>
      ${buildFooterHtml()}
    </div>
  `.trim();
}

const PAGES = [
  {
    path: 'random-chat',
    title: 'Random Chat – Meet Someone New Online | Chattr.',
    description: 'Connect instantly with real people worldwide through random chat. Choose your interests, join the queue, and start a spontaneous conversation in seconds.',
    canonical: 'https://chattr.world/random-chat',
    h1: 'Random Chat',
    badge: 'Core Experience',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Random Chat', path: '/random-chat' }
    ],
    contentHtml: `
      <section class="space-y-4">
        <h2 class="font-headline-sm text-headline-sm text-text-primary font-bold">What is Random Chat on Chattr.?</h2>
        <p>Random chat on Chattr. is a streamlined real-time medium designed for spontaneous, one-on-one text and video conversations between two people online. While modern social networks emphasize permanent public personas, status updates, and curated follower graphs, Chattr. strips away the artificial noise to restore the joy of spontaneous dialogue.</p>
        <p>Whether you are looking to exchange thoughts on modern cinema, debate technological breakthroughs, practice a second language, or jump on a face-to-face video call across timezones, random chat provides a direct bridge to a real person anywhere in the world.</p>
      </section>
      <section class="space-y-4">
        <h2 class="font-headline-sm text-headline-sm text-text-primary font-bold">How Real-Time Matchmaking Operates</h2>
        <p>When you enter the matchmaking queue, our server analyzes active participants in real time. Matchmaking occurs dynamically based on interest resonance, chat mode selection (text or WebRTC video call), and ephemeral room instantiation.</p>
      </section>
      <section class="space-y-4">
        <h2 class="font-headline-sm text-headline-sm text-text-primary font-bold">Starting and Ending Conversations with Autonomy</h2>
        <p>A healthy random chat service must respect user autonomy. On Chattr., conversations never require commitments: click <strong>Skip</strong> to get matched with someone new or end your session with zero data stored.</p>
      </section>
      <section class="space-y-4">
        <h2 class="font-headline-sm text-headline-sm text-text-primary font-bold">Related Guides</h2>
        <div class="flex flex-wrap gap-3 pt-1">
          <a href="/random-chat-with-strangers" class="px-4 py-2 rounded-full bg-surface border border-border-subtle text-text-primary hover:border-secondary transition-colors font-body-sm text-body-sm font-medium">Random Chat with Strangers</a>
          <a href="/how-random-chat-works" class="px-4 py-2 rounded-full bg-surface border border-border-subtle text-text-primary hover:border-secondary transition-colors font-body-sm text-body-sm font-medium">How Random Chat Works</a>
          <a href="/safety" class="px-4 py-2 rounded-full bg-surface border border-border-subtle text-text-primary hover:border-secondary transition-colors font-body-sm text-body-sm font-medium">Safety Guidelines</a>
        </div>
      </section>
    `
  },
  {
    path: 'random-chat-with-strangers',
    title: 'Random Chat With Strangers Online | Chattr.',
    description: 'Talk to strangers online responsibly through ephemeral random chat. Experience spontaneous encounters, interest-based pairing, and complete user privacy.',
    canonical: 'https://chattr.world/random-chat-with-strangers',
    h1: 'Random Chat With Strangers',
    badge: 'Spontaneous Encounters',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Random Chat with Strangers', path: '/random-chat-with-strangers' }
    ],
    contentHtml: `
      <section class="space-y-4">
        <h2 class="font-headline-sm text-headline-sm text-text-primary font-bold">The Value of Spontaneous Encounters</h2>
        <p>Speaking with someone you have never met before can be one of the most refreshing ways to broaden your world. Unlike conventional social networks where interactions are shaped by mutual acquaintances and existing social circles, chatting with a stranger offers an unfiltered exchange of ideas without preconceived expectations.</p>
      </section>
      <section class="space-y-4">
        <h2 class="font-headline-sm text-headline-sm text-text-primary font-bold">Interest-Guided Conversations</h2>
        <p>While the word "stranger" might imply complete unpredictability, Chattr. allows you to anchor your chats in shared curiosity such as Creative Arts, Technology, Languages, or everyday thoughts.</p>
      </section>
      <section class="space-y-4">
        <h2 class="font-headline-sm text-headline-sm text-text-primary font-bold">Prioritizing Personal Boundaries & Control</h2>
        <p>Engaging in random chat with strangers should always happen on your own terms. We recommend using pseudonyms and never disclosing sensitive personal data.</p>
      </section>
    `
  },
  {
    path: 'chat-with-strangers',
    title: 'Chat With Strangers Online | Chattr.',
    description: 'Chat with new people online without creating a complicated social profile. Enjoy instant, low-friction, and privacy-preserving text conversations.',
    canonical: 'https://chattr.world/chat-with-strangers',
    h1: 'Chat With New People Online',
    badge: 'Profile-Free Experience',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Chat with Strangers', path: '/chat-with-strangers' }
    ],
    contentHtml: `
      <section class="space-y-4">
        <h2 class="font-headline-sm text-headline-sm text-text-primary font-bold">Why Remove the Permanent Profile?</h2>
        <p>On most platforms today, starting a simple conversation requires filling out elaborate profile bios, uploading curated photographs, and managing follower counts. Chattr. takes the opposite approach: profile-free, instant text and video conversations.</p>
      </section>
      <section class="space-y-4">
        <h2 class="font-headline-sm text-headline-sm text-text-primary font-bold">How to Initiate a Meaningful Dialogue</h2>
        <p>Ask open questions, lean on shared interests, or use built-in icebreaker prompts to jumpstart great discussions.</p>
      </section>
      <section class="space-y-4">
        <h2 class="font-headline-sm text-headline-sm text-text-primary font-bold">Zero Data Trails & Ephemeral Privacy</h2>
        <p>Your conversation stays between you and your partner. When either participant ends the session, the room socket closes and memory is flushed immediately.</p>
      </section>
    `
  },
  {
    path: 'meet-new-people',
    title: 'Meet New People Online | Chattr.',
    description: 'Meet new people online through interest-based random chat. Discover diverse perspectives, share hobbies, and connect without dating pressure.',
    canonical: 'https://chattr.world/meet-new-people',
    h1: 'Meet New People Through Random Chat',
    badge: 'Global Connections',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Meet New People', path: '/meet-new-people' }
    ],
    contentHtml: `
      <section class="space-y-4">
        <h2 class="font-headline-sm text-headline-sm text-text-primary font-bold">Meeting People Beyond Local Circles</h2>
        <p>Chattr. offers an easy, low-pressure environment for connecting with people across continents, cultures, and interests.</p>
      </section>
      <section class="space-y-4">
        <h2 class="font-headline-sm text-headline-sm text-text-primary font-bold">Interest Tag Matchmaking</h2>
        <p>Select up to five topics to find people who share your passions for gaming, cinema, tech, books, philosophy, or language exchange.</p>
      </section>
    `
  },
  {
    path: 'how-random-chat-works',
    title: 'How Random Chat Works – Step-by-Step Guide | Chattr.',
    description: 'Understand how Chattr matches you with active people online in real time. Learn about our radar matchmaking, custom hobby filters, and ephemeral rooms.',
    canonical: 'https://chattr.world/how-random-chat-works',
    h1: 'How Random Chat Works',
    badge: 'Technical & User Guide',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'How It Works', path: '/how-random-chat-works' }
    ],
    contentHtml: `
      <section class="space-y-4">
        <h2 class="font-headline-sm text-headline-sm text-text-primary font-bold">The Lifecycle of a Conversation</h2>
        <p>Chattr. is built with modern WebSockets and real-time event streaming to deliver an instantaneous, lag-free chat experience.</p>
      </section>
      <section class="space-y-4">
        <h2 class="font-headline-sm text-headline-sm text-text-primary font-bold">Step-by-Step Onboarding</h2>
        <p>1. Pick a Pseudonym → 2. Select Interests & Chat Mode → 3. Live Radar Matchmaking → 4. Real-Time Chat/Video → 5. Ephemeral Discard on Exit.</p>
      </section>
    `
  },
  {
    path: 'safety',
    title: 'Safety Guidelines – Chat Safely With Strangers | Chattr.',
    description: 'Learn essential safety practices for random chat. Understand our anti-abuse features, blocking tools, ephemeral data policies, and personal boundary recommendations.',
    canonical: 'https://chattr.world/safety',
    h1: 'Chat Safely With New People',
    badge: 'Trust & Safety',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Safety Guidelines', path: '/safety' }
    ],
    contentHtml: `
      <section class="space-y-4">
        <h2 class="font-headline-sm text-headline-sm text-text-primary font-bold">Essential Safety Principles</h2>
        <p>Your safety and peace of mind are paramount. Learn how to protect your identity, use client-side blocking tools, and report misconduct.</p>
      </section>
      <section class="space-y-4">
        <h2 class="font-headline-sm text-headline-sm text-text-primary font-bold">Protecting Your Digital Footprint</h2>
        <p>Never share financial information, exact locations, or personal credentials. Maintain healthy boundaries at all times.</p>
      </section>
    `
  },
  {
    path: 'privacy',
    title: 'Privacy Policy | Chattr.',
    description: 'Read the Chattr. Privacy Policy. Understand our zero-retention architecture, ephemeral messaging protocols, and data protection practices.',
    canonical: 'https://chattr.world/privacy',
    h1: 'Privacy Policy',
    badge: 'Legal & Privacy',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Privacy Policy', path: '/privacy' }
    ],
    contentHtml: `
      <section class="space-y-4">
        <p class="text-caption text-text-muted">Last Updated: September 2026</p>
        <h2 class="font-headline-sm text-headline-sm text-text-primary font-bold">1. The Ephemeral Principle</h2>
        <p>Chattr. is architected from the ground up around data minimization and ephemerality. We do not retain chat transcripts or record video/audio streams on any permanent storage medium.</p>
      </section>
      <section class="space-y-4">
        <h2 class="font-headline-sm text-headline-sm text-text-primary font-bold">2. Information We Do Not Collect</h2>
        <p>We do not collect real names, emails, phone numbers, contacts, GPS coordinates, or saved chat transcripts.</p>
      </section>
    `
  },
  {
    path: 'terms',
    title: 'Terms of Service | Chattr.',
    description: 'Read the Terms of Service for using Chattr. Learn about acceptable use, user obligations, intellectual property, and service limitations.',
    canonical: 'https://chattr.world/terms',
    h1: 'Terms of Service',
    badge: 'Legal Agreement',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Terms of Service', path: '/terms' }
    ],
    contentHtml: `
      <section class="space-y-4">
        <p class="text-caption text-text-muted">Effective Date: September 2026</p>
        <h2 class="font-headline-sm text-headline-sm text-text-primary font-bold">1. Acceptance of Terms</h2>
        <p>By accessing or using the Chattr. web application, you agree to be bound by these Terms of Service and our Community Guidelines.</p>
      </section>
      <section class="space-y-4">
        <h2 class="font-headline-sm text-headline-sm text-text-primary font-bold">2. Eligibility & Prohibited Conduct</h2>
        <p>Chattr. is intended for users 18 years of age or older. Commercial spam, harassment, hate speech, and illegal content are strictly prohibited.</p>
      </section>
    `
  },
  {
    path: 'community-guidelines',
    title: 'Community Guidelines | Chattr.',
    description: 'Explore the Chattr. Community Guidelines. Learn our rules on respect, non-harassment, anti-spam, and responsible communication.',
    canonical: 'https://chattr.world/community-guidelines',
    h1: 'Community Guidelines',
    badge: 'Conduct & Standards',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Community Guidelines', path: '/community-guidelines' }
    ],
    contentHtml: `
      <section class="space-y-4">
        <h2 class="font-headline-sm text-headline-sm text-text-primary font-bold">Building a Respectful Platform</h2>
        <p>Our community standards ensure every user enjoys safe, welcoming, and civil interactions.</p>
      </section>
      <section class="space-y-4">
        <h2 class="font-headline-sm text-headline-sm text-text-primary font-bold">Core Rules</h2>
        <p>1. Respect Mutual Boundaries → 2. Zero Tolerance for Harassment → 3. Ephemeral & Clean Communication.</p>
      </section>
    `
  },
  {
    path: 'contact',
    title: 'Contact Us | Chattr.',
    description: 'Get in touch with the Chattr. team. Send feedback, report safety concerns, or submit technical inquiries.',
    canonical: 'https://chattr.world/contact',
    h1: 'Contact Chattr.',
    badge: 'Support & Feedback',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Contact', path: '/contact' }
    ],
    contentHtml: `
      <section class="space-y-4">
        <p>We welcome your feedback, bug reports, and safety inquiries. Because Chattr. does not store user accounts or personal profiles, please provide as much context as possible when reaching out regarding a technical issue or general suggestion.</p>
        <p>Reach out directly via email at <code class="bg-surface-container px-1.5 py-0.5 rounded text-xs text-text-primary">support@chattr.world</code>.</p>
      </section>
    `
  }
];

function prerender() {
  const templatePath = path.join(distDir, 'index.html');
  if (!fs.existsSync(templatePath)) {
    console.error('dist/index.html not found. Run vite build first.');
    process.exit(1);
  }

  const baseHtml = fs.readFileSync(templatePath, 'utf8');

  for (const page of PAGES) {
    const pageDir = path.join(distDir, page.path);
    if (!fs.existsSync(pageDir)) {
      fs.mkdirSync(pageDir, { recursive: true });
    }

    let pageHtml = baseHtml;

    // Replace Title
    pageHtml = pageHtml.replace(/<title>.*?<\/title>/, `<title>${page.title}</title>`);

    // Replace Meta Description
    pageHtml = pageHtml.replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${page.description}" />`);

    // Replace Canonical
    pageHtml = pageHtml.replace(/<link rel="canonical" href=".*?" \/>/, `<link rel="canonical" href="${page.canonical}" />`);

    // Replace Open Graph title, desc, url
    pageHtml = pageHtml.replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${page.title}" />`);
    pageHtml = pageHtml.replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${page.description}" />`);
    pageHtml = pageHtml.replace(/<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="${page.canonical}" />`);

    // Replace Twitter title, desc
    pageHtml = pageHtml.replace(/<meta name="twitter:title" content=".*?" \/>/, `<meta name="twitter:title" content="${page.title}" />`);
    pageHtml = pageHtml.replace(/<meta name="twitter:description" content=".*?" \/>/, `<meta name="twitter:description" content="${page.description}" />`);

    // Build Page JSON-LD schema
    const jsonLdSchema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BreadcrumbList",
          "itemListElement": page.breadcrumbs.map((crumb, idx) => ({
            "@type": "ListItem",
            "position": idx + 1,
            "name": crumb.name,
            "item": `https://chattr.world${crumb.path === '/' ? '' : crumb.path}`
          }))
        },
        {
          "@type": "WebPage",
          "name": page.h1,
          "url": page.canonical,
          "description": page.description
        }
      ]
    };

    // Replace JSON-LD schema script
    const jsonLdScript = `<script type="application/ld+json">\n${JSON.stringify(jsonLdSchema, null, 2)}\n</script>`;
    pageHtml = pageHtml.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, jsonLdScript);

    // Inject Pre-rendered Static DOM into <div id="root">
    const prerenderedBody = buildPageLayout(page);
    pageHtml = pageHtml.replace('<div id="root"></div>', `<div id="root">${prerenderedBody}</div>`);

    fs.writeFileSync(path.join(pageDir, 'index.html'), pageHtml, 'utf8');
    console.log(`[SEO Prerender] Generated full static HTML: dist/${page.path}/index.html`);
  }

  // Generate 404.html for static host fallbacks
  let notFoundHtml = baseHtml;
  notFoundHtml = notFoundHtml.replace(/<title>.*?<\/title>/, '<title>404 – Page Not Found | Chattr.</title>');
  notFoundHtml = notFoundHtml.replace(
    /<meta name="description" content=".*?" \/>/,
    '<meta name="description" content="The page you are looking for does not exist on Chattr. Start a random chat with strangers or return to the homepage." />'
  );
  notFoundHtml = notFoundHtml.replace(
    /<meta name="robots" content=".*?" \/>/,
    '<meta name="robots" content="noindex, nofollow" />'
  );
  fs.writeFileSync(path.join(distDir, '404.html'), notFoundHtml, 'utf8');
  console.log('[SEO Prerender] Generated: dist/404.html (with noindex, nofollow)');

  console.log('[SEO Prerender] Successfully generated static SEO route targets and 404 fallback!');
}

prerender();
