import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, '..', 'dist');

const PAGES = [
  {
    path: 'random-chat',
    title: 'Random Chat – Meet Someone New Online | Chattr.',
    description: 'Connect instantly with real people worldwide through random chat. Choose your interests, join the queue, and start a spontaneous conversation in seconds.',
    canonical: 'https://chattr.app/random-chat',
    h1: 'Random Chat'
  },
  {
    path: 'random-chat-with-strangers',
    title: 'Random Chat With Strangers Online | Chattr.',
    description: 'Talk to strangers online responsibly through ephemeral random chat. Experience spontaneous encounters, interest-based pairing, and complete user privacy.',
    canonical: 'https://chattr.app/random-chat-with-strangers',
    h1: 'Random Chat With Strangers'
  },
  {
    path: 'chat-with-strangers',
    title: 'Chat With Strangers Online | Chattr.',
    description: 'Chat with new people online without creating a complicated social profile. Enjoy instant, low-friction, and privacy-preserving text conversations.',
    canonical: 'https://chattr.app/chat-with-strangers',
    h1: 'Chat With New People Online'
  },
  {
    path: 'meet-new-people',
    title: 'Meet New People Online | Chattr.',
    description: 'Meet new people online through interest-based random chat. Discover diverse perspectives, share hobbies, and connect without dating pressure.',
    canonical: 'https://chattr.app/meet-new-people',
    h1: 'Meet New People Through Random Chat'
  },
  {
    path: 'how-random-chat-works',
    title: 'How Random Chat Works – Step-by-Step Guide | Chattr.',
    description: 'Understand how Chattr matches you with active people online in real time. Learn about our radar matchmaking, custom hobby filters, and ephemeral rooms.',
    canonical: 'https://chattr.app/how-random-chat-works',
    h1: 'How Random Chat Works'
  },
  {
    path: 'safety',
    title: 'Safety Guidelines – Chat Safely With Strangers | Chattr.',
    description: 'Learn essential safety practices for random chat. Understand our anti-abuse features, blocking tools, ephemeral data policies, and personal boundary recommendations.',
    canonical: 'https://chattr.app/safety',
    h1: 'Chat Safely With New People'
  },
  {
    path: 'privacy',
    title: 'Privacy Policy | Chattr.',
    description: 'Read the Chattr. Privacy Policy. Understand our zero-retention architecture, ephemeral messaging protocols, and data protection practices.',
    canonical: 'https://chattr.app/privacy',
    h1: 'Privacy Policy'
  },
  {
    path: 'terms',
    title: 'Terms of Service | Chattr.',
    description: 'Read the Terms of Service for using Chattr. Learn about acceptable use, user obligations, intellectual property, and service limitations.',
    canonical: 'https://chattr.app/terms',
    h1: 'Terms of Service'
  },
  {
    path: 'community-guidelines',
    title: 'Community Guidelines | Chattr.',
    description: 'Explore the Chattr. Community Guidelines. Learn our rules on respect, non-harassment, anti-spam, and responsible communication.',
    canonical: 'https://chattr.app/community-guidelines',
    h1: 'Community Guidelines'
  },
  {
    path: 'contact',
    title: 'Contact Us | Chattr.',
    description: 'Get in touch with the Chattr. team. Send feedback, report safety concerns, or submit technical inquiries.',
    canonical: 'https://chattr.app/contact',
    h1: 'Contact Chattr.'
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
    pageHtml = pageHtml.replace(
      /<title>.*?<\/title>/,
      `<title>${page.title}</title>`
    );

    // Replace Meta Description
    pageHtml = pageHtml.replace(
      /<meta name="description" content=".*?" \/>/,
      `<meta name="description" content="${page.description}" />`
    );

    // Replace Canonical
    pageHtml = pageHtml.replace(
      /<link rel="canonical" href=".*?" \/>/,
      `<link rel="canonical" href="${page.canonical}" />`
    );

    // Replace Open Graph title and desc
    pageHtml = pageHtml.replace(
      /<meta property="og:title" content=".*?" \/>/,
      `<meta property="og:title" content="${page.title}" />`
    );
    pageHtml = pageHtml.replace(
      /<meta property="og:description" content=".*?" \/>/,
      `<meta property="og:description" content="${page.description}" />`
    );
    pageHtml = pageHtml.replace(
      /<meta property="og:url" content=".*?" \/>/,
      `<meta property="og:url" content="${page.canonical}" />`
    );

    // Replace Twitter title and desc
    pageHtml = pageHtml.replace(
      /<meta name="twitter:title" content=".*?" \/>/,
      `<meta name="twitter:title" content="${page.title}" />`
    );
    pageHtml = pageHtml.replace(
      /<meta name="twitter:description" content=".*?" \/>/,
      `<meta name="twitter:description" content="${page.description}" />`
    );

    fs.writeFileSync(path.join(pageDir, 'index.html'), pageHtml, 'utf8');
    console.log(`[SEO Prerender] Generated: dist/${page.path}/index.html`);
  }

  console.log('[SEO Prerender] Successfully generated 10 static SEO route targets!');
}

prerender();
