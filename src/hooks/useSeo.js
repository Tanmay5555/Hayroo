import { useEffect } from 'react';

const SITE_URL = 'https://hayroo.store';
const DEFAULT_IMAGE = 'https://hayroo.store/android-chrome-512x512.png';
const DEFAULT_DESC = 'Dependable everyday electronics and curated home essentials for every age. Fast delivery, 1-year warranty, and fair pricing.';

/**
 * Helper to update or create a meta tag by property or name
 */
function setMetaTag(attributeName, attributeValue, content) {
  if (typeof document === 'undefined') return;
  let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attributeName, attributeValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content || '');
}

/**
 * Helper to update or create canonical link tag
 */
function setCanonicalTag(url) {
  if (typeof document === 'undefined') return;
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

/**
 * Helper to inject or update JSON-LD script tag
 */
function setJsonLdScript(data, scriptId = 'seo-json-ld') {
  if (typeof document === 'undefined') return;
  let script = document.getElementById(scriptId);
  if (!data) {
    if (script) script.remove();
    return;
  }
  if (!script) {
    script = document.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    script.setAttribute('id', scriptId);
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
}

/**
 * Custom React hook for dynamic SEO meta management
 * @param {Object} options
 * @param {string} options.title - Page specific title
 * @param {string} options.description - Page meta description
 * @param {string} [options.canonicalPath] - Path relative to domain, e.g. /products
 * @param {string} [options.ogType='website'] - Open graph type ('website' | 'product' | 'article')
 * @param {string} [options.image] - Open graph preview image
 * @param {Object|Array} [options.jsonLd] - Schema.org JSON-LD object or array
 */
export function useSeo({
  title,
  description = DEFAULT_DESC,
  canonicalPath,
  ogType = 'website',
  image = DEFAULT_IMAGE,
  jsonLd,
}) {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    // Document Title
    const formattedTitle = title ? `${title} | Hayroo` : 'Hayroo | Quality Essentials for Every Age';
    document.title = formattedTitle;

    // Canonical URL
    const resolvedCanonical = canonicalPath 
      ? (canonicalPath.startsWith('http') ? canonicalPath : `${SITE_URL}${canonicalPath}`)
      : window.location.href.split('?')[0];
    setCanonicalTag(resolvedCanonical);

    // Meta Description
    setMetaTag('name', 'description', description);

    // Open Graph
    setMetaTag('property', 'og:title', formattedTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', resolvedCanonical);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:image', image);
    setMetaTag('property', 'og:site_name', 'Hayroo');
    setMetaTag('property', 'og:locale', 'en_US');

    // Twitter Card
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', formattedTitle);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', image);

    // Schema.org JSON-LD structured data
    setJsonLdScript(jsonLd);

    return () => {
      // Clean up dynamic JSON-LD on unmount
      const script = document.getElementById('seo-json-ld');
      if (script) script.remove();
    };
  }, [title, description, canonicalPath, ogType, image, jsonLd]);
}

export default useSeo;
