import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const BASE_URL = 'https://jjtransfersmadeira.com';
const SITE_NAME = 'JJ Transfers Madeira';
const DEFAULT_IMAGE = `${BASE_URL}/assets/og-cover.jpg`;

export function useSEO({ title, description, keywords, image, url, type = 'website', jsonLd }: SEOProps) {
  useEffect(() => {
    // Title
    document.title = title;

    const setMeta = (nameOrProp: string, content: string, isProp = false) => {
      const attr = isProp ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${nameOrProp}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, nameOrProp);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    const setLink = (rel: string, href: string, extraAttrs?: Record<string, string>) => {
      const selector = extraAttrs
        ? `link[rel="${rel}"][hreflang="${extraAttrs.hreflang || ''}"]`
        : `link[rel="${rel}"]:not([hreflang])`;
      let el = document.querySelector(selector) as HTMLLinkElement | null;
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
      if (extraAttrs) {
        Object.entries(extraAttrs).forEach(([k, v]) => el!.setAttribute(k, v));
      }
    };

    const fullUrl = url ? `${BASE_URL}${url}` : BASE_URL;
    const ogImage = image || DEFAULT_IMAGE;

    // Standard meta
    setMeta('description', description);
    if (keywords) setMeta('keywords', keywords);
    setMeta('robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');

    // Canonical
    setLink('canonical', fullUrl);

    // Hreflang (PT + EN + x-default)
    setLink('alternate', fullUrl, { hreflang: 'pt' });
    setLink('alternate', fullUrl, { hreflang: 'en' });
    setLink('alternate', fullUrl, { hreflang: 'x-default' });

    // Open Graph
    setMeta('og:type', type, true);
    setMeta('og:site_name', SITE_NAME, true);
    setMeta('og:title', title, true);
    setMeta('og:description', description, true);
    setMeta('og:url', fullUrl, true);
    setMeta('og:image', ogImage, true);
    setMeta('og:image:width', '1200', true);
    setMeta('og:image:height', '630', true);
    setMeta('og:locale', 'pt_PT', true);
    setMeta('og:locale:alternate', 'en_GB', true);

    // Twitter
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    setMeta('twitter:image', ogImage);

    // JSON-LD structured data
    if (jsonLd) {
      const existing = document.getElementById('dynamic-jsonld');
      if (existing) existing.remove();

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'dynamic-jsonld';
      const data = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      script.textContent = JSON.stringify(data.length === 1 ? data[0] : data);
      document.head.appendChild(script);
    }

    return () => {
      const el = document.getElementById('dynamic-jsonld');
      if (el) el.remove();
    };
  }, [title, description, keywords, image, url, type, jsonLd]);
}
