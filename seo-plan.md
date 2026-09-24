# Chattr. — Comprehensive SEO Strategy & Architecture Plan

## 1. Executive Summary & Search Intent Strategy

**Chattr.** is an ephemeral, real-time random chat application designed around the Google Stitch aesthetic: minimalist, distraction-free, privacy-preserving, and instant. 

The goal of this SEO strategy is to make **Chattr.** organic search discoverable for people searching to talk to new people online, without polluting or altering the core chat application experience.

### 1.1 Target Search Intent Categories
1. **Informational & Discovery Intent**: Users seeking to understand what random chat is, how modern anonymous or pseudonym-based matchmaking works, and how to use it safely.
2. **Transactional & Direct Connect Intent**: Users actively searching to start a conversation right now (*"random chat with strangers"*, *"talk to strangers online"*).
3. **Safety & Privacy Intent**: Users concerned about digital footprint, data privacy, and safe conduct when interacting with strangers online.

### 1.2 Target Keywords Hierarchy

| Keyword Tier | Target Search Queries | Primary Target Landing Pages |
| :--- | :--- | :--- |
| **Primary** | `random chat`, `random chat app`, `random chat with strangers` | `/`, `/random-chat`, `/random-chat-with-strangers` |
| **Secondary** | `chat with strangers`, `talk to strangers online`, `random online chat` | `/chat-with-strangers`, `/how-random-chat-works` |
| **Long-Tail** | `meet new people online`, `chat with new people`, `anonymous random chat`, `random stranger chat` | `/meet-new-people`, `/safety` |
| **Trust & Compliance** | `random chat safety`, `safe chat with strangers`, `chat community rules` | `/safety`, `/community-guidelines`, `/privacy`, `/terms` |

*Note: Keyword stuffing is strictly forbidden. All content is engineered for genuine human utility, clarity, and scannability.*

---

## 2. Project Architecture & Technical Constraints

- **Framework**: React 18 with TypeScript, Vite bundler, Tailwind CSS.
- **Backend / Realtime**: Node.js, Express, Socket.IO.
- **Routing**: Client-side path-based history routing with pushState support, supplemented with build-time static HTML prerendering for search engine crawlers and social scrapers.
- **Rendering Strategy**: Hybrid Client-Side Rendering (CSR) with pre-rendered static HTML shells containing distinct SEO metadata, semantic markup, and JSON-LD structured data for every public indexable route.
- **Hosting / Deployment**: Node.js server (`server.js`) serving static files and WebSockets, or static export on platforms like Vercel/Netlify with backend deployed on Render/Railway.

---

## 3. Information Architecture & Page Structure

```
https://chattr.app/
├── / (Homepage: Hero App + Editorial Guides + FAQ + Social Proof)
├── /random-chat (Dedicated Intent: Random Chat & Matchmaking)
├── /random-chat-with-strangers (Dedicated Intent: Spontaneous Encounters)
├── /chat-with-strangers (Dedicated Intent: Starting Conversations without Profiles)
├── /meet-new-people (Dedicated Intent: Shared Passions & Mutual Topics)
├── /how-random-chat-works (Step-by-step onboarding & mechanics guide)
├── /safety (Comprehensive safety, privacy & anti-abuse documentation)
├── /community-guidelines (User conduct, moderation, respect guidelines)
├── /privacy (Ephemeral data policies, no-retention guarantee)
├── /terms (Terms of Service, acceptable use)
├── /contact (Contact and report escalation touchpoint)
├── /sitemap.xml (XML Sitemap of all 11 canonical indexable URLs)
└── /robots.txt (Crawl instructions & sitemap declaration)
```

---

## 4. Metadata & Social Sharing Specification

Every public route has unique, non-duplicated metadata:
- **Title Tag**: Strict length discipline (<60 chars), brand suffix `| Chattr.`.
- **Meta Description**: 140–155 characters summarizing value proposition without generic keyword spam.
- **Canonical URL**: Self-referencing absolute URL with consistent trailing-slash handling.
- **Open Graph (OG)**: `og:title`, `og:description`, `og:url`, `og:type` (`website` or `article`), `og:site_name`, `og:image`.
- **Twitter / X Cards**: `summary_large_image`, `twitter:title`, `twitter:description`, `twitter:image`.
- **Favicon & Apple Touch Icons**: SVG / WebP icons matching the Stitch visual identity.

---

## 5. Structured Data (JSON-LD) Specification

1. **Homepage (`/`)**:
   - `WebSite`: Name, URL, description, potentialAction (search).
   - `Organization`: Chattr., URL, logo, contact points.
   - `SoftwareApplication`: Genuine applicationCategory (`SocialNetworkingApplication`), operatingSystem (`Web`), browserRequirements, zero fake review/rating spam.
   - `FAQPage`: Exactly mirrors the 8 visible questions and answers in DOM.
2. **Dedicated Pages (`/random-chat`, `/safety`, etc.)**:
   - `BreadcrumbList`: Root -> Topic hierarchy.
   - `WebPage` / `Article`: Name, description, publisher.

---

## 6. Internal Linking & Crawl Budget Strategy

- **Header / Navigation**: Minimalist brand logo linking to `/` with quick navigation to `/random-chat`, `/how-random-chat-works`, and `/safety`.
- **Homepage Editorial Sections**: Direct contextual links to deeper guides (e.g. safety section links to `/safety`, how it works links to `/how-random-chat-works`).
- **Footer**: Structured footer with categorized links to Product, Guides, and Legal/Safety.
- **Content Pages**: High-contrast, prominent "Start Random Chat" CTA that seamlessly initiates the application flow on any device.

---

## 7. Performance & Core Web Vitals (CWV)

- **Largest Contentful Paint (LCP)**: Font preconnect to Google Fonts (`Geist`), inline SVG or optimized CSS for the glass orb hero catalyst.
- **Cumulative Layout Shift (CLS)**: Fixed aspect ratio on cards, explicit dimensions on all elements, zero dynamic ad shifts.
- **Interaction to Next Paint (INP)**: Zero heavy blocking third-party tracking scripts.
- **Bundle Optimization**: Code-split route components so the initial bundle remains lightweight (<75 kB gzip).

---

## 8. Indexing Rules & Robot Directives

| Route / State | Indexable? | Directives |
| :--- | :--- | :--- |
| Public Static Pages (`/`, `/random-chat`, etc.) | **YES** | `index, follow, max-image-preview:large` |
| Active Chat Session | **NO** | `noindex, nofollow` |
| Internal Socket / API routes | **NO** | Disallowed in `robots.txt` |
| Error / 404 pages | **NO** | `noindex, follow` |
