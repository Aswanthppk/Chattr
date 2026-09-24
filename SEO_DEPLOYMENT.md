# Chattr. — Google Search Console & Production Deployment Playbook

This document outlines the step-by-step procedure for deploying **Chattr.** to production, configuring Google Search Console (GSC), verifying ownership, submitting sitemaps, and monitoring indexation performance.

---

## 1. Production Configuration Summary

- **Production Domain**: `https://chattr.app` (or your registered custom domain)
- **Canonical Format**: `https://chattr.app/` (HTTPS, non-www, strictly enforced)
- **Sitemap Location**: `https://chattr.app/sitemap.xml`
- **Robots.txt Location**: `https://chattr.app/robots.txt`
- **RSS/Feeds**: N/A (Dynamic chat web application)
- **Contact / Webmaster**: `support@chattr.app`

---

## 2. Pre-Deployment Verification Checklist

Before pointing production traffic:
1. [x] **Production Bundle**: Ensure `npm run build` generates clean assets into `dist/`.
2. [x] **Static Assets**: Verify `sitemap.xml`, `robots.txt`, and `og-image.png` exist in `dist/` and `public/`.
3. [x] **Canonical URLs**: Verify canonical tags point to the exact production domain.
4. [x] **Open Graph & Twitter Cards**: Confirm social preview tags are populated.
5. [x] **Structured Data**: Validate JSON-LD schemas with Google Rich Results Test (no errors).
6. [x] **Mobile Responsiveness**: Confirm layout operates seamlessly across mobile viewports (375px to 430px).

---

## 3. Post-Deployment Step-by-Step Actions

Follow these exact steps after your live site is accessible on the internet:

### Step 1: Deploy Production Website
Deploy your application to your chosen hosting provider (e.g., Render, Railway, Vercel, or custom VPS). Ensure HTTPS is active and HTTP automatically redirects to HTTPS.

### Step 2: Open Google Search Console
Navigate to [search.google.com/search-console](https://search.google.com/search-console) and sign in with your primary Google account.

### Step 3: Add Domain or URL Prefix Property
- **Recommended**: Choose **Domain property** (`chattr.app`) to cover all subdomains and protocol variants.
- **Alternative**: Choose **URL prefix** (`https://chattr.app/`).

### Step 4: Verify Domain Ownership
Select one of the verification methods:
- **DNS TXT Record (Recommended for Domain Property)**: Copy the `google-site-verification=...` string from Google Search Console, go to your domain registrar (Cloudflare, Namecheap, GoDaddy), and add a TXT record for `@`.
- **HTML Tag (For URL Prefix)**: Copy the verification `<meta name="google-site-verification" content="..." />` tag and add it to `index.html`.
- **HTML File**: Upload the designated Google HTML file to your `public/` directory.

### Step 5: Submit the XML Sitemap
1. In the Google Search Console sidebar, click **Sitemaps** under *Indexing*.
2. In the "Add a new sitemap" input, enter `sitemap.xml`.
3. Click **Submit**.
4. Confirm the status turns green (**"Success"**), with 11 discovered pages.

### Step 6: Inspect Homepage URL
1. In the top search bar ("Inspect any URL in..."), paste `https://chattr.app/` and hit Enter.
2. Click **Test Live URL**.
3. Verify that Google can fetch the page, view rendered screenshots, and detect the `SoftwareApplication`, `Organization`, `WebSite`, and `FAQPage` schemas.

### Step 7: Request Indexing for Homepage
Click **Request Indexing** on the inspection results page to prioritize initial crawling.

### Step 8: Inspect Key Content & Safety Pages
Perform URL inspection and indexing requests for the top priority pages:
- `https://chattr.app/random-chat`
- `https://chattr.app/chat-with-strangers`
- `https://chattr.app/how-random-chat-works`
- `https://chattr.app/safety`

### Step 9: Monitor Indexing Reports
Over the subsequent 48 to 72 hours, review the **Pages** report in Search Console to verify:
- All 11 pages are marked as **Indexed**.
- Zero pages are marked with crawl errors or accidental `noindex`.
- Mobile usability report displays **0 issues**.

### Step 10: Track Search Performance & Query Trends
Under the **Performance** tab:
- Track impressions, clicks, click-through rates (CTR), and average positions for key queries (`random chat`, `chat with strangers`, `talk to strangers online`, `meet new people`).
- Use search query trends to refine page copy and answer emerging user questions in the FAQ.
