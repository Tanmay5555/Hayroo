/**
 * Cookie-Consent Gated Analytics Utility for Hayroo E-Commerce
 * 
 * Complies strictly with privacy standards (GDPR / Indian DPDP Act 2023).
 * No external tracking scripts are loaded or executed until the user explicitly accepts cookies.
 * 
 * Configuration Placeholders:
 * - Google Analytics 4: [GA4_MEASUREMENT_ID: G-XXXXXXXXXX]
 * - Meta Pixel: [META_PIXEL_ID: XXXXXXXXXXXXXXX]
 */

const GA4_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID || 'G-XXXXXXXXXX'; // [GA4_MEASUREMENT_ID: G-XXXXXXXXXX]
const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID || 'XXXXXXXXXXXXXXX'; // [META_PIXEL_ID: XXXXXXXXXXXXXXX]
const CONSENT_STORAGE_KEY = 'hayroo_cookie_consent';

/**
 * Check if the user has provided explicit cookie consent.
 * @returns {boolean}
 */
export function hasAnalyticsConsent() {
  if (typeof window === 'undefined') return false;
  try {
    const consent = localStorage.getItem(CONSENT_STORAGE_KEY);
    return consent === 'accepted';
  } catch {
    return false;
  }
}

/**
 * Dynamically initialize Google Analytics 4 and Meta Pixel only after consent is granted.
 */
export function initAnalyticsIfConsented() {
  if (typeof window === 'undefined') return;
  if (!hasAnalyticsConsent()) {
    console.debug('[Analytics] Consent not granted. Tracking scripts deferred.');
    return;
  }

  // Initialize GA4 if not already loaded and if configured
  if (GA4_ID && GA4_ID !== 'G-XXXXXXXXXX' && !window.gtag) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA4_ID, {
      send_page_view: false, // Managed manually per route
      anonymize_ip: true,
    });
    console.info(`[Analytics] Google Analytics 4 initialized (${GA4_ID})`);
  }

  // Initialize Meta Pixel if not already loaded and if configured
  if (META_PIXEL_ID && META_PIXEL_ID !== 'XXXXXXXXXXXXXXX' && !window.fbq) {
    !(function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */

    if (window.fbq) {
      window.fbq('init', META_PIXEL_ID);
      console.info(`[Analytics] Meta Pixel initialized (${META_PIXEL_ID})`);
    }
  }
}

/**
 * Send custom analytics event to configured providers (GA4, Meta, and Dev Logger).
 * @param {string} eventName
 * @param {Object} eventParams
 */
function sendEvent(eventName, eventParams = {}) {
  // Always log in development environment for debugging and transparency
  if (import.meta.env.DEV) {
    console.log(`%c[Analytics Event: ${eventName}]`, 'color: #047857; font-weight: bold;', eventParams);
  }

  // Stop here if the user hasn't consented
  if (!hasAnalyticsConsent()) return;

  // Google Analytics 4
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, eventParams);
  }

  // Meta Pixel Ecommerce Events Mapping
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    if (eventName === 'page_view') {
      window.fbq('track', 'PageView');
    } else if (eventName === 'view_item') {
      window.fbq('track', 'ViewContent', {
        content_name: eventParams.item_name,
        content_ids: [eventParams.item_id],
        content_type: 'product',
        value: eventParams.value,
        currency: eventParams.currency || 'INR',
      });
    } else if (eventName === 'add_to_cart') {
      window.fbq('track', 'AddToCart', {
        content_name: eventParams.item_name,
        content_ids: [eventParams.item_id],
        content_type: 'product',
        value: eventParams.value,
        currency: eventParams.currency || 'INR',
      });
    } else if (eventName === 'begin_checkout') {
      window.fbq('track', 'InitiateCheckout', {
        value: eventParams.value,
        currency: eventParams.currency || 'INR',
        num_items: eventParams.items?.length || 1,
      });
    } else if (eventName === 'purchase') {
      window.fbq('track', 'Purchase', {
        value: eventParams.value,
        currency: eventParams.currency || 'INR',
        content_type: 'product',
        order_id: eventParams.transaction_id,
      });
    }
  }
}

/**
 * Track route / page navigation.
 * @param {string} path - URL path
 * @param {string} title - Page title
 */
export function trackPageView(path, title) {
  sendEvent('page_view', {
    page_path: path || window.location.pathname,
    page_title: title || document.title,
    page_location: window.location.href,
  });
}

/**
 * Track product view.
 * @param {Object} product
 */
export function trackViewItem(product) {
  if (!product) return;
  sendEvent('view_item', {
    currency: 'INR',
    value: Number(product.price) || 0,
    items: [
      {
        item_id: product._id || product.id || product.slug,
        item_name: product.title || product.name,
        item_category: product.category,
        item_brand: product.brand,
        price: Number(product.price) || 0,
        quantity: 1,
      },
    ],
  });
}

/**
 * Track addition of an item to the shopping cart.
 * @param {Object} product
 * @param {number} quantity
 */
export function trackAddToCart(product, quantity = 1) {
  if (!product) return;
  const numPrice = typeof product.price === 'number'
    ? product.price
    : (parseFloat(String(product.price).replace(/,/g, '')) || 0);

  sendEvent('add_to_cart', {
    currency: 'INR',
    value: numPrice * quantity,
    items: [
      {
        item_id: product._id || product.id || product.slug,
        item_name: product.title || product.name,
        item_category: product.category,
        item_brand: product.brand,
        price: numPrice,
        quantity,
      },
    ],
  });
}

/**
 * Track removal of an item from the shopping cart.
 * @param {Object} product
 */
export function trackRemoveFromCart(product) {
  if (!product) return;
  const numPrice = typeof product.price === 'number'
    ? product.price
    : (parseFloat(String(product.price).replace(/,/g, '')) || 0);

  sendEvent('remove_from_cart', {
    currency: 'INR',
    value: numPrice * (product.quantity || 1),
    items: [
      {
        item_id: product._id || product.id || product.slug,
        item_name: product.title || product.name,
        price: numPrice,
        quantity: product.quantity || 1,
      },
    ],
  });
}

/**
 * Track start of the checkout funnel.
 * @param {Array} items
 * @param {number} subtotal
 */
export function trackBeginCheckout(items = [], subtotal = 0) {
  sendEvent('begin_checkout', {
    currency: 'INR',
    value: subtotal,
    items: items.map((item) => ({
      item_id: item.product || item._id || item.id,
      item_name: item.title || item.name,
      item_category: item.category,
      price: item.price,
      quantity: item.quantity,
    })),
  });
}

/**
 * Track completed purchase.
 * @param {Object} order
 */
export function trackPurchase(order) {
  if (!order) return;
  sendEvent('purchase', {
    transaction_id: order.orderId || order._id || `ORD_${Date.now()}`,
    value: order.grandTotal || order.totalAmount || 0,
    tax: order.tax || 0,
    shipping: order.shippingFee || 0,
    currency: 'INR',
    coupon: order.couponCode || '',
    items: (order.items || []).map((item) => ({
      item_id: item.product || item._id,
      item_name: item.title || item.name,
      price: item.price,
      quantity: item.quantity,
    })),
  });
}
