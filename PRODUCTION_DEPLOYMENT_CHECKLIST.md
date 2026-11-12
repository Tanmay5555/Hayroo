# Production Deployment Checklist

Use this checklist before promoting **Hayroo / ApexBazaar** to a live production environment.

> Legend: `[x]` = Implemented and verified in codebase/CLI | `[ ]` = Pending developer/operations execution before launch

---

## 1. Security & Secrets Hygiene

- [x] Hardcoded JWT fallback secrets blocked when `NODE_ENV=production` ([backend/utils/jwt.js](file:///d:/Hayroo/backend/utils/jwt.js))
- [x] Firebase mock token verification fallback disabled when `NODE_ENV=production` ([backend/config/firebase.js](file:///d:/Hayroo/backend/config/firebase.js))
- [x] Hardcoded demo auth OTP (`582914`/`123456`) and delivery OTP (`4912`/`1234`) bypasses disabled when `NODE_ENV=production` ([authController.js](file:///d:/Hayroo/backend/controllers/authController.js), [deliveryController.js](file:///d:/Hayroo/backend/controllers/deliveryController.js))
- [x] Razorpay mock payment/signature bypass disabled in `production` and timing-safe HMAC comparison enforced ([razorpayService.js](file:///d:/Hayroo/backend/services/razorpayService.js), [paymentController.js](file:///d:/Hayroo/backend/controllers/paymentController.js))
- [x] Self-registration privilege escalation blocked (`ADMIN`, `SUPPORT_STAFF`, `DELIVERY_PARTNER` cannot self-register via `/auth/register` or `/auth/firebase-login`)
- [x] Ownership / IDOR checks enforced on order read/cancel, payment verification, shipping label generation, return requests/refunds, and product edit/delete
- [x] SVG uploads blocked (stored XSS prevention) and upload MIME/extension allowlist restricted to `jpeg`, `jpg`, `png`, `webp` ([uploadMiddleware.js](file:///d:/Hayroo/backend/middleware/uploadMiddleware.js))
- [x] Express rate limiting enabled (`apiLimiter` 200 req/min on `/api/v1`, `authLimiter` 30 req/15min on auth routes) & recursive NoSQL `$`/`.` sanitization applied to `body`, `params`, and `query` ([backend/app.js](file:///d:/Hayroo/backend/app.js))
- [x] Verified via `git ls-files *env*` that `.env` files are NOT tracked in Git (only `.env.example` is tracked)
- [ ] Generate cryptographically strong production `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` (distinct 48+ byte random hex strings) and set in production host
- [ ] Configure real production `RAZORPAY_KEY_ID` (`rzp_live_*`) & `RAZORPAY_KEY_SECRET` (and replace any local test keys)
- [ ] Configure real production Firebase Admin credentials (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`) and frontend `VITE_FIREBASE_*` keys if Google/Phone login is enabled
- [ ] Configure production `GEMINI_API_KEY` if BazaarGuide AI chat is enabled (or leave unset to use safe non-AI catalog lookup fallback)
- [ ] Explicitly disable Swagger UI in production (`ENABLE_SWAGGER=false`)

---

## 2. Database & Data Integrity

- [x] Ephemeral `MongoMemoryServer` fallback disabled when `NODE_ENV=production` so production never boots with empty/ephemeral in-memory data ([backend/config/db.js](file:///d:/Hayroo/backend/config/db.js))
- [x] Compound database indexes added on `Product`, `Order`, and `SellerLedger` models for catalog search, seller order dashboards, and payout ledger lookups
- [x] Server-side authoritative pricing & atomic conditional stock decrements (`stock: { $gte: quantity }`) with rollback implemented in `confirmOrder` and stock restoration on `cancelOrder` ([orderController.js](file:///d:/Hayroo/backend/controllers/orderController.js))
- [x] Auto-seeding of sample users/products disabled when `NODE_ENV=production` ([backend/index.js](file:///d:/Hayroo/backend/index.js))
- [ ] Provision production MongoDB Atlas cluster (M10+ recommended for production SLA), configure IP allowlist / VPC peering, and set `MONGODB_URI`
- [ ] Enable automated daily snapshots & point-in-time recovery (PITR) on MongoDB Atlas and run one test restore verification
- [ ] Provision initial production `ADMIN` account safely via controlled database/CLI seed script (never via public registration)
- [ ] Plan durable object storage (Supabase Storage / S3 / Cloudinary / persistent volume) for `/uploads` if deploying backend on ephemeral container filesystems (e.g., Render/Railway free/ephemeral disks)

---

## 3. Backend API & Process Stability

- [x] ESM environment initialization fixed (`import 'dotenv/config'` at line 1 of [backend/index.js](file:///d:/Hayroo/backend/index.js))
- [x] HTTP `requestTimeout` (30s) & `headersTimeout` (35s) configured along with `SIGTERM`/`SIGINT` graceful shutdown and `unhandledRejection`/`uncaughtException` handlers
- [x] Structured JSON error logging with `correlationId` (`x-correlation-id`) and masked 500 error details in `production` ([errorMiddleware.js](file:///d:/Hayroo/backend/middleware/errorMiddleware.js))
- [x] Backend Jest integration & security test suite passes (`npm test`: **27/27 tests passing** after final edits)
- [ ] Configure `CLIENT_URL` and `CORS_ORIGINS` to match exact HTTPS production frontend domain(s)
- [ ] Configure multi-instance Redis rate-limiter store if scaling backend horizontally across multiple instances (current rate limiter is single-process memory)
- [ ] Confirm SMS gateway integration if phone OTP login is offered in production (current `requestPhoneOtp` stores secure cryptographic OTP in DB and returns masked/dev hint only outside `production`—wire an SMS provider such as Twilio/MSG91/Firebase Phone Auth before turning on native backend SMS OTP in live production)

---

## 4. Frontend Build, Optimization & Quality

- [x] Route-level code splitting via `React.lazy` & `Suspense` implemented ([frontend/src/App.jsx](file:///d:/Hayroo/frontend/src/App.jsx))
- [x] Client token storage mismatch, refresh endpoint path, missing `updateProfile`/`addAddress`/`removeCoupon` methods, coupon field mismatch, and Account/Admin/Seller/Delivery data bugs fixed
- [x] Production Vite build (`npm run build`) completes cleanly in `927ms` (`0` errors; entry JS `159.27 kB` / `29.86 kB` gzip)
- [ ] Resolve or triage pre-existing frontend ESLint errors (`npm run lint` reports `12` `react-hooks/set-state-in-effect` errors and `77` warnings across pre-existing components/pages)
- [ ] Perform manual live-browser QA pass in Chrome across desktop, tablet, and mobile viewports in both **Light Mode** (`#FAF9F6`) and **Dark Mode** (`#0D0F0E`)
- [ ] Set `VITE_API_URL` in frontend hosting build environment to the live HTTPS backend `/api/v1` base URL (or configure reverse-proxy `/api/v1` rewrite)

---

## 5. Dependencies, Hosting & Monitoring

- [x] Executed non-breaking `npm audit fix` (`added 59, removed 2, changed 51 packages`)
- [ ] Review remaining `29` `npm audit` vulnerabilities (`3 low, 21 moderate, 5 high`) requiring breaking major version bumps (`firebase`, `jest`, `eslint`, `zod`) in a scheduled dependency upgrade PR
- [ ] Configure HTTPS / TLS certificates and force HTTPS redirect at CDN/reverse proxy (Cloudflare / Vercel / Nginx / Render)
- [ ] Configure external uptime monitoring targeting `GET /health` (expects HTTP `200` and `"database": "connected"`)
- [ ] Set up centralized log aggregation (Datadog, Logtail/Better Stack, Papertrail, or cloud host log drain) ingesting stdout/stderr JSON error logs
- [ ] Run end-to-end production smoke tests after deploy: `/health`, catalog browse/search, login/signup, cart + coupon, Razorpay test payment (`VERIFY`), seller label generation, admin dashboard access, and cookie consent analytics
