# Production Readiness Audit & Implementation Report

**Project:** Hayroo / ApexBazaar Marketplace (`frontend/` + `backend/`)  
**Audit Scope:** Phases 1–14 Full-Stack Architecture, Security, Frontend/Backend Optimization, Database Reliability, Testing, & Deployment Readiness  
**Overall Launch Status:** **Conditioned / Staging-Ready — Codebase hardened and automated tests/builds passing; live launch blocked on Production Environment Configuration (`Pending – Developer`) and Manual Live-Browser Visual Verification (`Needs Verification`).**

---

## 1. Executive Summary

This audit transformed the existing full-stack marketplace from a local development prototype containing mock auth/payment fallbacks, schema mismatches, client-trusted pricing, and unsplit bundles into a hardened application ready for staging and controlled production rollout.

- **Security & Access Control:** Closed critical privilege-escalation vectors (`ADMIN` role injection), removed hardcoded OTP/payment/Firebase mock bypasses in `NODE_ENV=production`, eliminated client-side price tampering, fixed IDOR gaps across orders/payments/seller labels/returns/products, blocked `.svg` stored-XSS uploads, and added strict CORS whitelisting, rate limiting, and recursive query sanitization.
- **Functional & Data Integrity Bugs Fixed:** Fixed ESM `.env` loading order (`import 'dotenv/config'` hoisted bug), implemented missing Zustand auth/cart methods (`updateProfile`, `addAddress`, `removeCoupon`), corrected `User`/`Address`/`Coupon` MongoDB schema field mismatches, fixed Account order endpoint (`/orders`), and removed fake dashboard fallback metrics across Admin, Seller, and Delivery portals.
- **Database & Performance:** Added MongoDB compound indexes on `Product`, `Order`, and `SellerLedger`, enforced atomic stock decrements (`$gte`), disabled `MongoMemoryServer` fallback in production, and split frontend routes with `React.lazy` + `Suspense` (main entry chunk reduced to `159.27 kB` / `29.86 kB` gzip).
- **Automated Verification (post-final changes):** Backend Jest suite passes **27 / 27 tests** (`4.987 s`) and Vite production build passes with **0 errors** (`927ms`).

---

## 2. Security Audit Findings & Remediations

| Area | Finding | Fix Implemented | File(s) |
|---|---|---|---|
| **JWT Secrets** | Hardcoded fallback signing secrets allowed token forgery if env vars were missing | Blocked fallback secrets when `NODE_ENV=production`; reads env dynamically; hardened `clearAuthCookies` cookie flags (`httpOnly`, `secure`, `sameSite: 'lax'`) | [backend/utils/jwt.js](file:///d:/Hayroo/backend/utils/jwt.js) |
| **Role Privilege Escalation** | Public `/auth/register` and `/auth/firebase-login` accepted privileged roles (`ADMIN`, `SUPPORT_STAFF`, `DELIVERY_PARTNER`) | Restricted self-registration to `CUSTOMER` and `SELLER` only; added regression tests | [authController.js](file:///d:/Hayroo/backend/controllers/authController.js) |
| **Mock Auth & OTP Bypasses** | Hardcoded OTP (`582914`/`123456`), Firebase mock `verifyIdToken`, and delivery OTP (`4912`/`1234`) accepted universally | Disabled all mock/static OTP fallbacks in `production`; uses `crypto.randomInt` + `otpExpiresAt` verification | [firebase.js](file:///d:/Hayroo/backend/config/firebase.js), [authController.js](file:///d:/Hayroo/backend/controllers/authController.js), [deliveryController.js](file:///d:/Hayroo/backend/controllers/deliveryController.js) |
| **Payment & Pricing Tampering** | `checkoutSummary`/`confirmOrder` trusted client-sent item prices; Razorpay signature allowed non-timing-safe comparison and mock bypass | Recomputes authoritative prices from DB `Product` records and DB `Coupon` rules; enforces `crypto.timingSafeEqual` + order ownership in `verifyPayment`; disables Razorpay mock in `production` | [orderController.js](file:///d:/Hayroo/backend/controllers/orderController.js), [razorpayService.js](file:///d:/Hayroo/backend/services/razorpayService.js), [paymentController.js](file:///d:/Hayroo/backend/controllers/paymentController.js) |
| **IDOR Access Control** | Order read/cancel, shipping label creation, return verification, product update/delete, and AI order lookup lacked strict ownership checks | Enforced `user` / `seller` / `ADMIN` ownership validation across all resource controllers and `geminiChatService` | [orderController.js](file:///d:/Hayroo/backend/controllers/orderController.js), [sellerController.js](file:///d:/Hayroo/backend/controllers/sellerController.js), [returnController.js](file:///d:/Hayroo/backend/controllers/returnController.js), [productController.js](file:///d:/Hayroo/backend/controllers/productController.js), [geminiChatService.js](file:///d:/Hayroo/backend/services/geminiChatService.js) |
| **Mass Assignment & Data Leak** | Product update spread raw `req.body`; public product detail exposed seller `currentBalance` | Enforced `ALLOWED_PRODUCT_UPDATE_FIELDS` allowlist and removed `currentBalance` from public product queries | [productController.js](file:///d:/Hayroo/backend/controllers/productController.js) |
| **File Upload XSS** | `.svg` image uploads allowed potential script injection | Removed `.svg` from upload allowlist; enforced strict raster extension + MIME match (`jpeg`, `jpg`, `png`, `webp`) and `X-Content-Type-Options: nosniff` on `/uploads` | [uploadMiddleware.js](file:///d:/Hayroo/backend/middleware/uploadMiddleware.js), [backend/app.js](file:///d:/Hayroo/backend/app.js) |
| **ReDoS & NoSQL Injection** | Unescaped regex search inputs; query objects not sanitized | Added `escapeRegex` helper, clamped pagination (`1 <= limit <= 100`), sanitized `req.body`, `req.params`, and `req.query` recursively | [productController.js](file:///d:/Hayroo/backend/controllers/productController.js), [backend/app.js](file:///d:/Hayroo/backend/app.js) |
| **CORS, Rate Limit & Headers** | Permissive CORS / missing rate limits / verbose internal errors | Configured `trust proxy`, strict prod `CORS_ORIGINS`/`CLIENT_URL` whitelist, `express-rate-limit` (`200/min` API, `30/15min` auth), Swagger toggle (`ENABLE_SWAGGER`), and production error masking | [backend/app.js](file:///d:/Hayroo/backend/app.js), [errorMiddleware.js](file:///d:/Hayroo/backend/middleware/errorMiddleware.js) |

---

## 3. Functional Bugs Fixed & Reliability Improvements

### Backend
- **ESM `.env` Initialization Order ([backend/index.js](file:///d:/Hayroo/backend/index.js)):** Moved `import 'dotenv/config'` to line 1 so imported config modules read `.env` variables properly. Disabled sample data auto-seeding in `production` and added HTTP `requestTimeout` (30s), `headersTimeout` (35s), `SIGTERM`/`SIGINT` graceful shutdown, and fatal error handlers.
- **Database & Concurrency ([backend/config/db.js](file:///d:/Hayroo/backend/config/db.js), [orderController.js](file:///d:/Hayroo/backend/controllers/orderController.js)):** Blocked ephemeral `MongoMemoryServer` fallback in `production`, set `maxPoolSize: 20`, implemented atomic stock decrements with partial-failure rollback, awaited seller ledger `$inc` updates, and restored stock on order cancellation.
- **Schema Mismatches Fixed:**
  - [userController.js](file:///d:/Hayroo/backend/controllers/userController.js): Mapped `fullName`, `phoneNumber`, `avatarUrl`, `addressLine1`, `postalCode` to match `User.js` schema so profile/address updates actually persist.
  - [cartController.js](file:///d:/Hayroo/backend/controllers/cartController.js): Fixed coupon validation fields (`minOrderAmount`, `discountPercent`, `maxDiscountAmount`, `expiresAt`) and enforced integer cart quantities (`1–99`).
  - [reviewController.js](file:///d:/Hayroo/backend/controllers/reviewController.js): Fixed `req.user.fullName`, rating bounds (`1–5`), and case-insensitive `ADMIN` check.
  - [adminController.js](file:///d:/Hayroo/backend/controllers/adminController.js) & [adminRoutes.js](file:///d:/Hayroo/backend/routes/adminRoutes.js): Removed fake `4829100` fallback GMV and added `PATCH /api/v1/admin/orders/:id/status`.

### Database Indexes Added
- [Product.js](file:///d:/Hayroo/backend/models/Product.js): Compound indexes for active category/price/rating sorting and seller product lists.
- [Order.js](file:///d:/Hayroo/backend/models/Order.js): Compound indexes for customer order history, vendor sub-order status, delivery manifest, and AWB tracking lookups.
- [SellerLedger.js](file:///d:/Hayroo/backend/models/SellerLedger.js): Compound index on `{ seller: 1, status: 1, createdAt: -1 }`.

### Frontend
- **API Client & Auth State ([axios.js](file:///d:/Hayroo/frontend/src/api/axios.js), [useAuthStore.js](file:///d:/Hayroo/frontend/src/store/useAuthStore.js)):** Fixed token lookup (`apexbazaar_token` || `hayroo_token`), set 15s request timeout, fixed refresh token route (`/auth/refresh`), implemented `updateProfile` and `addAddress`, and normalized `fullName`/`phoneNumber`.
- **Cart & Wishlist ([useCartStore.js](file:///d:/Hayroo/frontend/src/store/useCartStore.js), [CartDrawer.jsx](file:///d:/Hayroo/frontend/src/components/CartDrawer.jsx), [useWishlistStore.js](file:///d:/Hayroo/frontend/src/store/useWishlistStore.js)):** Implemented `removeCoupon()`, aligned free shipping threshold (`999`) with backend checkout calculation, guarded `/wishlist` API requests behind auth tokens, and triggered wishlist fetch on signed-in user changes.
- **Dashboard & Account Fixes ([AccountPage.jsx](file:///d:/Hayroo/frontend/src/pages/AccountPage.jsx), [AdminPage.jsx](file:///d:/Hayroo/frontend/src/pages/AdminPage.jsx), [SellerPage.jsx](file:///d:/Hayroo/frontend/src/pages/SellerPage.jsx), [DeliveryPage.jsx](file:///d:/Hayroo/frontend/src/pages/DeliveryPage.jsx)):** Fixed `/orders/my-orders` -> `/orders`, mapped real API metric paths, and replaced unauthenticated mock fallbacks with proper role/auth gating.
- **Code Splitting ([frontend/src/App.jsx](file:///d:/Hayroo/frontend/src/App.jsx)):** Converted page routes to `React.lazy` with `<Suspense>` fallback.

---

## 4. Verification Results (Observed After Final Code & Dependency Updates)

| Check | Command | Outcome | Exact Metrics / Notes |
|---|---|---|---|
| **Backend API & Security Suite** | `npm test` | **Passed** | **1 suite passed, 27 / 27 tests passed** in `4.987 s` (includes new Describe block `10. Security Hardening, IDOR Protection & Profile/Admin Fixes`; uses `MongoMemoryServer` when local MongoDB `27017` is absent) |
| **Frontend Production Build** | `npm run build` | **Passed** | `vite v8.3.8`, `1917 modules transformed`, built in `927ms`, **0 errors**. Entry JS `dist/assets/index-C4Oh242M.js`: `159.27 kB` (`29.86 kB` gzip); CSS: `51.75 kB` (`9.76 kB` gzip); vendor chunks + per-route lazy chunks generated |
| **Frontend Linter** | `npm run lint` | **Exited 1 (Pre-existing lint rules)** | `89 problems (12 errors, 77 warnings)`: `12` pre-existing `react-hooks/set-state-in-effect` errors from React 19 / `eslint-plugin-react-hooks` v7 rules plus `77` unused import / hook-dependency warnings |
| **Dependency Vulnerability Fix** | `npm audit fix` (non-force) | **Partial Fix** | `added 59, removed 2, changed 51 packages`; **`29` vulnerabilities remain** (`3 low, 21 moderate, 5 high`), all gated behind breaking major upgrades (`firebase`, `jest`, `eslint`, `zod`) |
| **Git Secrets Check** | `git ls-files *env*` | **Passed** | Only `.env.example` is tracked; no `.env` files with secrets are tracked in Git |
| **Live Browser UI / Theme Verification** | Chrome DevTools Subagent | **Blocked** | Automated browser connection failed locally because Chrome remote debugging (`DevToolsActivePort`) was unavailable; manual visual sign-off required before launch |

---

## 5. Remaining Risks & Architectural Notes

1. **Phone OTP SMS Delivery in Production:** In non-production mode, `requestPhoneOtp` logs/returns a dev hint; in `NODE_ENV=production` the hint is suppressed, and a live SMS provider (e.g., Firebase Phone Auth on frontend or Twilio/MSG91 in `authController.js`) must be wired before relying on backend phone OTP login.
2. **Ephemeral Upload Storage (`/uploads`):** Uploaded product images are stored locally on disk in `backend/uploads/`. On container hosts with ephemeral disks (Render/Railway/Fly), migrate upload storage to S3, Cloudflare R2, or Supabase Storage.
3. **In-Memory Rate Limiter:** `express-rate-limit` uses single-instance memory storage. If scaling beyond 1 backend node, attach a Redis store (`rate-limit-redis`).
4. **Prisma / Redis / MCP Env Entries:** `backend/.env.example` includes `DATABASE_URL`, `DIRECT_URL`, `REDIS_*`, and `MCP_SERVER_API_KEY` from the starter workspace template, whereas active Express controllers currently run on MongoDB/Mongoose + optional Firebase Admin + Supabase client sync.
5. **Pre-existing ESLint Errors & Major Dependency Upgrades:** `npm run lint` still reports 12 `react-hooks/set-state-in-effect` errors, and `npm audit` retains 29 advisories requiring major dependency bumps.

---

## 6. Developer Action Items

| # | Action Item | Priority | Status |
|---|---|---|---|
| 1 | Security hardening, IDOR checks, pricing/stock atomicity, schema alignment, and backend tests | High | **Completed** |
| 2 | Frontend bug fixes, mock-fallback removal, and `React.lazy` code splitting | High | **Completed** |
| 3 | Provision production MongoDB Atlas URI (`MONGODB_URI`), automated backups, and initial `ADMIN` account | Critical | **Pending – Developer** |
| 4 | Generate & configure production JWT secrets (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`) and CORS (`CLIENT_URL`, `CORS_ORIGINS`, `NODE_ENV=production`, `ENABLE_SWAGGER=false`) | Critical | **Pending – Developer** |
| 5 | Configure live Razorpay (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`), Firebase Auth, Supabase, and Gemini keys | Critical | **Pending – Developer** |
| 6 | Set `VITE_API_URL` & client Firebase/Analytics env vars in frontend hosting and deploy | High | **Pending – Developer** |
| 7 | Wire SMS provider for backend phone OTP (or restrict phone login to Firebase Phone Auth UI) & durable object storage for uploads | High | **Pending – Developer** |
| 8 | Live Chrome browser QA across desktop/tablet/mobile in Light & Dark modes | High | **Needs Verification** (Blocked in headless automation) |
| 9 | Upgrade major deps (`firebase`, `jest`, `eslint`, `zod`) & clean up 12 `react-hooks/set-state-in-effect` ESLint errors | Medium | **Pending – Developer** |

---

### Step-by-Step Developer Instructions for Pending Items

#### Item 3 — Production MongoDB Atlas & Backups
- **Why needed:** `MongoMemoryServer` fallback is disabled when `NODE_ENV=production`; production requires persistent ACID/indexed MongoDB hosting and backups.
- **Where to go:** [MongoDB Atlas](https://cloud.mongodb.com) -> **Create Cluster** -> **Database Access** -> **Network Access** -> **Backup**.
- **Keys to copy & where to paste:** Copy the `mongodb+srv://...` Driver URI and set it as `MONGODB_URI` in your backend hosting provider's Environment Variables panel. Enable Continuous Backup / Daily Snapshots in Atlas.
- **Verification:** Deploy backend and check `GET https://your-api-domain/health` returns `"database": "connected"`.

#### Item 4 — JWT Secrets, CORS & Production Flags
- **Why needed:** `backend/utils/jwt.js` refuses fallback secrets when `NODE_ENV=production`, and `backend/app.js` enforces strict CORS origins.
- **Where to run:** Any local terminal with Node.js:
  ```bash
  node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
  ```
  Run twice to create two distinct secrets.
- **Where to paste:** In your backend host Environment Variables:
  - `NODE_ENV=production`
  - `JWT_ACCESS_SECRET=<first generated hex>`
  - `JWT_REFRESH_SECRET=<second generated hex>`
  - `CLIENT_URL=https://yourdomain.com`
  - `CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com`
  - `ENABLE_SWAGGER=false`
- **Verification:** Log in via `/api/v1/auth/login` from your deployed frontend domain without CORS or 500 errors.

#### Item 5 — Live Payment (Razorpay), Firebase Auth, Supabase & Gemini Keys
- **Why needed:** Live checkout verification requires real Razorpay keys (`paymentController.js`), Google/OAuth requires Firebase (`firebase.js`), and AI chat requires Gemini (`geminiChatService.js`).
- **Where to go:**
  1. [Razorpay Dashboard](https://dashboard.razorpay.com) -> **Account & Settings -> API Keys** (Live Mode) -> copy Key ID & Key Secret into `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.
  2. [Firebase Console](https://console.firebase.google.com) -> **Project Settings -> Service Accounts -> Generate new private key** -> paste `project_id`, `client_email`, `private_key` (with `\n` newlines preserved) into `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`; copy Web App config into frontend `VITE_FIREBASE_*`.
  3. [Google AI Studio](https://aistudio.google.com/app/apikey) -> create key -> paste into `GEMINI_API_KEY`.
- **Verification:** Complete a low-value test checkout in Razorpay and trigger BazaarGuide AI chat on the deployed site.

#### Item 6 — Frontend Build Environment (`VITE_API_URL`) & Hosting
- **Why needed:** Frontend Axios client (`frontend/src/api/axios.js`) uses `VITE_API_URL` baked at build time.
- **Where to go:** Frontend host (Vercel / Netlify / Cloudflare Pages) -> **Project Settings -> Environment Variables**.
- **Where to paste:** Set `VITE_API_URL=https://api.yourdomain.com/api/v1` (plus optional `VITE_GA4_MEASUREMENT_ID`, `VITE_META_PIXEL_ID`, `VITE_FIREBASE_*`, `VITE_SUPABASE_*`).
- **Verification:** Trigger a fresh production build (`npm run build`) and confirm network requests target the production API domain over HTTPS.

#### Item 7 — SMS Gateway & Persistent Media Storage
- **Why needed:** Local `backend/uploads/` is non-persistent on ephemeral cloud containers, and `requestPhoneOtp` intentionally suppresses OTP hints in `production`.
- **Where to act:** Integrate Twilio/MSG91 inside `requestPhoneOtp` ([authController.js](file:///d:/Hayroo/backend/controllers/authController.js)) or authenticate phone users through Firebase Phone Auth (`/auth/firebase-login`), and point product/avatar uploads in [uploadMiddleware.js](file:///d:/Hayroo/backend/middleware/uploadMiddleware.js) to S3 / Supabase Storage / Cloudinary.
- **Verification:** Upload a product image as a Seller, redeploy container, and verify image URL still loads (`HTTP 200`).

#### Item 8 — Manual Live Browser UI & Theme Verification
- **Why needed:** Automated Chrome DevTools attachment was blocked in this environment (`DevToolsActivePort` inactive).
- **Where to test:** Open the built frontend (`npm run dev` locally or staging URL) in desktop Chrome (~1440px) and DevTools mobile/tablet viewports (~390px, ~768px).
- **Verification:** Toggle Light/Dark modes across Home, Products, Product Detail, Cart Drawer, Checkout, Account, Seller, Delivery, and Admin pages; verify zero console errors, readable contrast, and complete navigation/auth/checkout flows.

#### Item 9 — ESLint & Major Package Upgrades
- **Why needed:** `npm run lint` fails with `12` React Compiler hook lint errors (`react-hooks/set-state-in-effect`) and `npm audit` retains `29` advisories behind breaking major versions.
- **Where to act:** Refactor synchronous `setState` inside `useEffect` in flagged files (`CookieBanner.jsx`, `Navbar.jsx`, `SellerPage.jsx`, etc.) and run major updates (`firebase`, `jest`, `eslint`, `zod`) in a dedicated branch.
- **Verification:** Confirm `npm run lint`, `npm test`, and `npm run build` all exit `0`.

