import React, { useEffect } from 'react';

export interface MetaManagerProps {
  title: string;
  description: string;
  canonicalPath: string;
  ogType?: 'website' | 'article';
  jsonLd?: object | object[];
}

const DOMAIN = 'https://chattr.app';

export const MetaManager: React.FC<MetaManagerProps> = ({
  title,
  description,
  canonicalPath,
  ogType = 'website',
  jsonLd
}) => {
  useEffect(() => {
    // 1. Update Document Title
    document.title = title;

    // Helper to update or create meta tag
    const setMetaTag = (attribute: 'name' | 'property', key: string, content: string) => {
      let element = document.querySelector(`meta[${attribute}="${key}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 2. Standard Meta Tags
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'robots', 'index, follow, max-image-preview:large');

    // 3. Canonical Link
    const cleanPath = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`;
    const canonicalUrl = `${DOMAIN}${cleanPath === '/' ? '/' : cleanPath}`;
    
    let canonicalTag = document.querySelector('link[rel="canonical"]');
    if (!canonicalTag) {
      canonicalTag = document.createElement('link');
      canonicalTag.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.setAttribute('href', canonicalUrl);

    // 4. Open Graph Tags
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:site_name', 'Chattr.');
    setMetaTag('property', 'og:image', `${DOMAIN}/og-image.svg`);

    // 5. Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', `${DOMAIN}/og-image.svg`);

    // 6. Structured Data (JSON-LD)
    const scriptId = 'json-ld-seo-schema';
    let scriptElement = document.getElementById(scriptId) as HTMLScriptElement | null;
    
    if (jsonLd) {
      if (!scriptElement) {
        scriptElement = document.createElement('script');
        scriptElement.id = scriptId;
        scriptElement.type = 'application/ld+json';
        document.head.appendChild(scriptElement);
      }
      scriptElement.text = JSON.stringify(jsonLd);
    } else if (scriptElement) {
      scriptElement.remove();
    }
  }, [title, description, canonicalPath, ogType, jsonLd]);

  return null;
};
