import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

const BASE_URL = 'https://jjtransfersmadeira.com';
const SITE_NAME = 'JJ Transfers Madeira';

export function useSEO({ title, description, keywords, image, url, type = 'website' }: SEOProps) {
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

    const setLink = (rel: string, href: string) => {
      let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
    };

    // Standard meta
    setMeta('description', description);
    if (keywords) setMeta('keywords', keywords);

    // Canonical
    setLink('canonical', url ? `${BASE_URL}${url}` : BASE_URL);

    // Open Graph
    setMeta('og:type', type, true);
    setMeta('og:site_name', SITE_NAME, true);
    setMeta('og:title', title, true);
    setMeta('og:description', description, true);
    setMeta('og:url', url ? `${BASE_URL}${url}` : BASE_URL, true);
    if (image) setMeta('og:image', image, true);

    // Twitter
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    if (image) setMeta('twitter:image', image);
  }, [title, description, keywords, image, url, type]);
}
