/**
 * UTM Parameter Tracker for Hayroo E-Commerce
 * Captures marketing campaign parameters (utm_source, utm_medium, utm_campaign,
 * utm_term, utm_content, gclid, fbclid) and persists them in sessionStorage
 * so they can be attributed to completed purchases and analytics events.
 */

const UTM_STORAGE_KEY = 'hayroo_utm_attribution';
const UTM_FIELDS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'];

/**
 * Capture UTM query parameters from the current URL if present.
 * Persists attribution across page transitions in the user's session.
 */
export function captureUtmParameters() {
  if (typeof window === 'undefined') return;

  try {
    const params = new URLSearchParams(window.location.search);
    const hasUtm = UTM_FIELDS.some((field) => params.has(field));

    if (hasUtm) {
      const attribution = {
        utm_source: params.get('utm_source') || '',
        utm_medium: params.get('utm_medium') || '',
        utm_campaign: params.get('utm_campaign') || '',
        utm_term: params.get('utm_term') || '',
        utm_content: params.get('utm_content') || '',
        gclid: params.get('gclid') || '',
        fbclid: params.get('fbclid') || '',
        referrer: document.referrer || 'direct',
        landing_page: window.location.pathname + window.location.search,
        captured_at: new Date().toISOString(),
      };

      // Store in sessionStorage (primary) and localStorage (backup for cross-tab sessions)
      sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(attribution));
      try {
        localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(attribution));
      } catch {
        // localStorage might be unavailable or disabled
      }
    }
  } catch (err) {
    console.debug('Error capturing UTM parameters:', err);
  }
}

/**
 * Retrieve the current session's UTM attribution parameters.
 * @returns {Object} Stored attribution parameters or empty object.
 */
export function getUtmParameters() {
  if (typeof window === 'undefined') return {};

  try {
    const sessionData = sessionStorage.getItem(UTM_STORAGE_KEY);
    if (sessionData) {
      return JSON.parse(sessionData);
    }

    const localData = localStorage.getItem(UTM_STORAGE_KEY);
    if (localData) {
      return JSON.parse(localData);
    }
  } catch (err) {
    console.debug('Error reading UTM parameters:', err);
  }

  return {};
}

/**
 * Clear stored UTM parameters after an order has been successfully placed.
 */
export function clearUtmParameters() {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(UTM_STORAGE_KEY);
    localStorage.removeItem(UTM_STORAGE_KEY);
  } catch {
    // Ignore clear errors
  }
}
