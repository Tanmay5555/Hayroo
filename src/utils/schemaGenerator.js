/**
 * Schema.org JSON-LD Structured Data Generators for Hayroo
 * Provides valid microdata markup for Google Search, Rich Results, and Knowledge Graph.
 */

const SITE_URL = 'https://hayroo.store';
const BRAND_NAME = 'Hayroo';
const LOGO_URL = 'https://hayroo.store/favicon-512x512.png';

/**
 * Generate Organization structured data.
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: BRAND_NAME,
    legalName: 'Hayroo Retail Private Limited',
    url: SITE_URL,
    logo: LOGO_URL,
    description: 'Curated everyday electronics and dependable home essentials for every age.',
    email: 'support@hayroo.store',
    telephone: '+919876543210',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Brigade Gateway, Malleshwaram',
      addressLocality: 'Bengaluru',
      addressRegion: 'Karnataka',
      postalCode: '560055',
      addressCountry: 'IN',
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+919876543210',
        contactType: 'Customer Service',
        areaServed: 'IN',
        availableLanguage: ['English', 'Hindi'],
      },
    ],
  };
}

/**
 * Generate WebSite schema with Sitelinks SearchBox.
 */
export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: BRAND_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/products?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generate Product schema for product detail pages.
 * @param {Object} product
 */
export function generateProductSchema(product) {
  if (!product) return null;

  const numPrice = typeof product.price === 'number'
    ? product.price
    : (parseFloat(String(product.price).replace(/,/g, '')) || 0);

  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [product.imageLight || product.image || `${SITE_URL}/favicon.svg`];

  const inStock = product.stock === undefined || product.stock > 0;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title || product.name,
    image: images,
    description: product.description || `${product.title} available at Hayroo.`,
    sku: product.sku || product._id || product.id || product.slug,
    brand: {
      '@type': 'Brand',
      name: product.brand || BRAND_NAME,
    },
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/product/${product.slug || product._id || product.id}`,
      priceCurrency: 'INR',
      price: numPrice,
      priceValidUntil: '2027-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: BRAND_NAME,
      },
    },
    ...(product.rating && product.reviewsCount ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviewsCount,
      },
    } : {}),
  };
}

/**
 * Generate FAQPage schema for FAQ page.
 * @param {Array} faqs - Array of { question, answer }
 */
export function generateFaqSchema(faqs = []) {
  if (!faqs || faqs.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate BreadcrumbList schema.
 * @param {Array} items - Array of { name, url }
 */
export function generateBreadcrumbSchema(items = []) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}
