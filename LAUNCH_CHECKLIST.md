# Hayroo E-Commerce: Production Launch & Deployment Guide

This document provides the complete, pre-flight checklist and deployment instructions for launching the **Hayroo** online store to production.

---

## 1. Global Rules & Brand Standards Audit

| Category | Requirement | Audit Result | Status |
| :--- | :--- | :--- | :--- |
| **Color Palette** | Emerald green (`#047857`), Warm cream (`#FFFBEB`), Accent (`#A7F3D0`), Text (`#14231D`), Card (`#FFFFFF` / `#162820`) | Strictly applied via CSS variables across light & dark modes | PASS |
| **Gradients** | NO purple, indigo, or violet gradients anywhere | 0 occurrences in all active components and styles | PASS |
| **Buttons & Badges** | Strictly 4px to 8px rounded corners (`--radius-sm`, `--radius-md`, `--radius-lg`); NO pill shapes | 0 pill buttons or badges (`rounded-full` is restricted to typing dots/spinners) | PASS |
| **Typography & Copy** | NO em dashes (`—`) anywhere in the copy | 0 occurrences across all `.jsx`, `.js`, `.css`, and `.html` files | PASS |
| **Icons** | NO emojis as UI icons; use Lucide SVG icons | 100% authentic Lucide vector icons | PASS |
| **Social Proof** | NO fake review counters, fake sales counters, or fake user metrics | Authentic review submission or marked `[add real data]` placeholders | PASS |
| **Builder Tags** | NO "Made with AI", "Powered by", or builder watermarks | 0 builder watermarks | PASS |

---

## 2. Production Build Verification

- **Bundler:** Vite v8 (powered by Rolldown)
- **Transform Count:** 2,305 modules transformed
- **Build Duration:** ~635 ms
- **Chunk Optimization:** Split into cached vendor bundles:
  - `dist/assets/vendor-react-*.js` (~79 kB gzipped)
  - `dist/assets/vendor-deps-*.js` (~64 kB gzipped)
  - `dist/assets/vendor-forms-*.js` (~24 kB gzipped)
  - `dist/assets/index-*.js` (~47 kB gzipped)
  - `dist/assets/index-*.css` (~14 kB gzipped)
- **Status:** Exit code 0, 0 errors, 0 warnings.

---

## 3. Custom Domain & DNS Configuration

To map your custom domain (e.g., `hayroo.store`) to your production deployment:

### Recommended DNS Records (Cloudflare, Namecheap, GoDaddy, Google Domains)

| Type | Host / Name | Value / Target | TTL | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **A** | `@` (root) | `76.76.21.21` *(or your server IP)* | Auto / 300 | Primary root apex resolution |
| **CNAME** | `www` | `cname.vercel-dns.com` *(or `hayroo.store`)* | Auto / 300 | Subdomain redirect |
| **CNAME** | `api` | `your-backend.onrender.com` | Auto / 300 | Separate backend API domain (optional) |
| **TXT** | `@` | `v=spf1 include:... ~all` | Auto | Email deliverability & SPF |

---

## 4. SSL/TLS & HTTPS Redirection

1. **Automatic SSL:** If using Vercel, Netlify, or Cloudflare, TLS 1.3 certificates (Let's Encrypt / DigiCert) are provisioned automatically upon DNS verification.
2. **HSTS Enforcement:** Ensure HTTP Strict Transport Security is enabled (`max-age=31536000; includeSubDomains; preload`).
3. **HTTP to HTTPS Redirect:** All port 80 traffic must permanently redirect (`301`) to `https://hayroo.store`.

---

## 5. Hosting Deployment Options

### Option A: Vercel (Recommended for Frontend)
1. Import repository on [Vercel](https://vercel.com).
2. Framework Preset: **Vite**.
3. Build Command: `npm run build`.
4. Output Directory: `dist`.
5. Set Environment Variables:
   - `VITE_API_URL`: `/api/v1` (if proxied) or `https://api.hayroo.store/api/v1`.
   - `VITE_GA4_MEASUREMENT_ID`: `G-XXXXXXXXXX`.
   - `VITE_META_PIXEL_ID`: `XXXXXXXXXXXXXXX`.

### Option B: VPS (Ubuntu 24.04 / Nginx + PM2)
If hosting on a virtual server, use the following sample Nginx reverse proxy block:

```nginx
server {
    listen 80;
    server_name hayroo.store www.hayroo.store;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name hayroo.store www.hayroo.store;

    ssl_certificate /etc/letsencrypt/live/hayroo.store/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/hayroo.store/privkey.pem;

    root /var/www/hayroo/dist;
    index index.html;

    # Static assets caching
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, no-transform, immutable";
    }

    # SPA routing fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API reverse proxy
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 6. Payment Gateway (Razorpay Live Mode) Transition

1. Navigate to [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Complete KYC and activate **Live Mode**.
3. Generate Live API Keys:
   - Replace `RAZORPAY_KEY_ID` with `rzp_live_...`
   - Replace `RAZORPAY_KEY_SECRET` with your Live Secret.
4. Enable webhook endpoint in Razorpay Dashboard pointing to:
   `https://hayroo.store/api/v1/payments/razorpay/webhook`
   with events: `order.paid`, `payment.authorized`, `payment.failed`.

---

## 7. SEO, Analytics & Tracking Verification

- [x] **robots.txt:** Available at `https://hayroo.store/robots.txt`
- [x] **sitemap.xml:** Available at `https://hayroo.store/sitemap.xml`
- [x] **Open Graph & Twitter Cards:** Configured with valid preview image and descriptions.
- [x] **Schema.org Microdata:**
  - Organization schema with Bengaluru postal address & customer care line.
  - WebSite schema with Google Sitelinks search action.
  - Product schema with INR price currency, stock availability, and manufacturer warranty.
  - FAQPage schema with expandable accordions.
- [x] **Cookie Consent:** Non-blocking banner; third-party tracking is strictly gated until user clicks "Accept".
- [x] **Marketing Attribution:** Session-persisted UTM capture forwards `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, and `utm_content` to completed orders.
