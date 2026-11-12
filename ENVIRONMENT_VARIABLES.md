# Environment Variables Reference

This document lists all environment variables used across the **Hayroo / ApexBazaar** frontend (`frontend/`) and backend (`backend/`) applications.

> **Security Rule:** Never commit real `.env` files, private keys, database passwords, or live payment/API secrets to Git. Only commit `.env.example` templates with placeholder values. Keep real production credentials strictly inside your hosting provider's secret/environment configuration UI.

---

## Variable Inventory

| Variable Name | Location | Purpose | Required | Example | Source | Deployment Location |
|---|---|---|---|---|---|---|
| `VITE_API_URL` | Frontend | Base path or origin URL for backend REST API requests in Axios (`frontend/src/api/axios.js`) | Yes | `/api/v1` or `https://api.yourdomain.com/api/v1` | Backend deployment URL | Frontend Host (Vercel / Netlify / Cloudflare Pages build env) |
| `VITE_SUPABASE_URL` | Frontend | Public Supabase project URL for client SDK initialization | Optional | `https://yourprojectref.supabase.co` | Supabase Dashboard -> Project Settings -> API | Frontend Host build env |
| `VITE_SUPABASE_ANON_KEY` | Frontend | Public Supabase anonymous key (safe for browser use with RLS enabled) | Optional | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Supabase Dashboard -> Project Settings -> API | Frontend Host build env |
| `VITE_FIREBASE_API_KEY` | Frontend | Firebase Web App public API key for Google/Phone client auth | Optional (Yes if using Firebase Auth) | `AIzaSyA_YourFirebaseClientApiKey` | Firebase Console -> Project Settings -> General -> Your apps | Frontend Host build env |
| `VITE_FIREBASE_AUTH_DOMAIN` | Frontend | Firebase Auth domain for OAuth redirects/popups | Optional (Yes if using Firebase Auth) | `your-project.firebaseapp.com` | Firebase Console -> Project Settings -> Your apps | Frontend Host build env |
| `VITE_FIREBASE_PROJECT_ID` | Frontend | Firebase project identifier | Optional (Yes if using Firebase Auth) | `your-project-id` | Firebase Console -> Project Settings | Frontend Host build env |
| `VITE_FIREBASE_STORAGE_BUCKET` | Frontend | Firebase Cloud Storage bucket domain | Optional | `your-project-id.appspot.com` | Firebase Console -> Project Settings | Frontend Host build env |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Frontend | Firebase Cloud Messaging sender ID | Optional | `123456789012` | Firebase Console -> Project Settings | Frontend Host build env |
| `VITE_FIREBASE_APP_ID` | Frontend | Firebase Web App unique ID | Optional (Yes if using Firebase Auth) | `1:123456789012:web:abcdef1234567890` | Firebase Console -> Project Settings | Frontend Host build env |
| `VITE_GA4_MEASUREMENT_ID` | Frontend | Google Analytics 4 tracking ID loaded when cookie consent is granted | Optional | `G-XXXXXXXXXX` | Google Analytics Admin -> Data Streams | Frontend Host build env |
| `VITE_META_PIXEL_ID` | Frontend | Meta (Facebook) Pixel ID loaded when cookie consent is granted | Optional | `123456789012345` | Meta Events Manager -> Data Sources | Frontend Host build env |
| `NODE_ENV` | Backend | Runtime environment mode (`development`, `test`, `production`). Enforces strict secrets, CORS whitelist, masked errors, and disables dev mocks/seeding in `production` | Yes | `production` | Server / Hosting config | Backend Host (Render / Railway / Fly.io / VPS) |
| `PORT` | Backend | HTTP port Express listens on | Yes | `5000` (or platform-injected port) | Hosting platform / Server config | Backend Host |
| `CLIENT_URL` | Backend | Primary frontend origin allowed by CORS (`backend/app.js`) | Yes (in prod) | `https://yourdomain.com` | Frontend deployment domain | Backend Host |
| `CORS_ORIGINS` | Backend | Comma-separated list of additional allowed browser origins for CORS (`backend/app.js`) | Recommended in prod | `https://yourdomain.com,https://www.yourdomain.com` | Frontend domains / custom subdomains | Backend Host |
| `ENABLE_SWAGGER` | Backend | Controls mounting `/api-docs` OpenAPI UI (mounted unless explicitly set to `'false'`; set `ENABLE_SWAGGER=false` in production) | Optional | `false` | Operations policy | Backend Host |
| `MONGODB_URI` | Backend | Primary MongoDB Atlas/cluster connection string used by Mongoose (`backend/config/db.js`) | Yes | `mongodb+srv://user:password@cluster.mongodb.net/hayroo?retryWrites=true&w=majority` | MongoDB Atlas -> Connect -> Drivers | Backend Host (Secret) |
| `JWT_ACCESS_SECRET` | Backend | Secret key for signing short-lived JWT access tokens (`backend/utils/jwt.js`). Backend refuses to sign/verify in `production` if missing or placeholder | Yes | `64-char-random-hex-string` | Generate locally (`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`) | Backend Host (Secret) |
| `JWT_REFRESH_SECRET` | Backend | Separate secret key for signing JWT refresh tokens (`backend/utils/jwt.js`). Must differ from `JWT_ACCESS_SECRET` | Yes | `64-char-different-random-hex-string` | Generate locally (`crypto.randomBytes(48).toString('hex')`) | Backend Host (Secret) |
| `JWT_ACCESS_EXPIRY` | Backend | Access token lifetime in seconds (`backend/utils/jwt.js` defaults to `900` = 15 min) | Optional | `900` | Security policy | Backend Host |
| `JWT_REFRESH_EXPIRY` | Backend | Refresh token lifetime in seconds (`backend/utils/jwt.js` defaults to `604800` = 7 days) | Optional | `604800` | Security policy | Backend Host |
| `FIREBASE_PROJECT_ID` | Backend | Firebase Admin SDK project ID for verifying Firebase ID tokens (`backend/config/firebase.js`) | Optional (Yes if Firebase login is enabled) | `your-project-id` | Firebase Console -> Service Accounts JSON | Backend Host |
| `FIREBASE_CLIENT_EMAIL` | Backend | Firebase Service Account email for Admin SDK verification | Optional (Yes if Firebase login is enabled) | `firebase-adminsdk@your-project.iam.gserviceaccount.com` | Firebase Console -> Service Accounts -> Generate New Private Key | Backend Host (Secret) |
| `FIREBASE_PRIVATE_KEY` | Backend | Firebase Service Account RSA private key (`\n` escaped when stored as single-line env var) | Optional (Yes if Firebase login is enabled) | `"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"` | Firebase Console -> Service Accounts -> Generate New Private Key | Backend Host (Secret) |
| `FIREBASE_STORAGE_BUCKET` | Backend | Firebase Storage bucket name used by Admin SDK | Optional | `your-project.appspot.com` | Firebase Console -> Storage | Backend Host |
| `SUPABASE_URL` | Backend | Supabase project URL for optional catalog/order sync (`backend/config/supabase.js`) | Optional | `https://yourprojectref.supabase.co` | Supabase Dashboard -> Project Settings -> API | Backend Host |
| `SUPABASE_ANON_KEY` | Backend | Supabase anon fallback key in backend client (`backend/config/supabase.js`) | Optional | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Supabase Dashboard -> Project Settings -> API | Backend Host |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend | Privileged Supabase service-role key for server-side catalog/order syncing (`backend/config/supabase.js`). Never expose to frontend | Optional | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Supabase Dashboard -> Project Settings -> API | Backend Host (Secret) |
| `RAZORPAY_KEY_ID` | Backend | Razorpay merchant API Key ID (`rzp_live_...` for production, `rzp_test_...` for staging) (`backend/services/razorpayService.js`) | Yes for online payments | `rzp_live_YourKeyId` | Razorpay Dashboard -> Settings -> API Keys | Backend Host |
| `RAZORPAY_KEY_SECRET` | Backend | Razorpay secret key used for order creation & HMAC-SHA256 payment signature verification | Yes for online payments | `YourRazorpayLiveSecret` | Razorpay Dashboard -> Settings -> API Keys | Backend Host (Secret) |
| `RAZORPAY_WEBHOOK_SECRET` | Backend | Webhook signing secret template entry in `backend/.env.example` (for future webhook endpoints) | Optional (not yet wired in active route handlers) | `YourWebhookSecretSigningKey` | Razorpay Dashboard -> Settings -> Webhooks | Backend Host (Secret) |
| `GEMINI_API_KEY` | Backend | Google Gemini API key powering the BazaarGuide AI shopping assistant (`backend/services/geminiChatService.js`) | Optional (graceful fallback if omitted) | `AIzaSy_YourGeminiApiKey` | Google AI Studio -> API Keys | Backend Host (Secret) |
| `API_BASE_URL` | Backend `.env.example` | Documented base URL for API metadata/clients (`backend/.env.example`) | Optional | `https://api.yourdomain.com/api/v1` | Backend domain | Backend Host |
| `DATABASE_URL` | Backend `prisma/schema.prisma` | PostgreSQL pooled connection string referenced by optional `backend/prisma/schema.prisma` (active runtime controllers use MongoDB/Mongoose) | Optional (if using Prisma tools) | `postgresql://user:pass@host:6543/postgres?pgbouncer=true` | Supabase / Postgres provider | Backend Host (Secret) |
| `DIRECT_URL` | Backend `prisma/schema.prisma` | Direct PostgreSQL URL referenced by optional `backend/prisma/schema.prisma` migrations | Optional (if using Prisma tools) | `postgresql://user:pass@host:5432/postgres` | Supabase / Postgres provider | Backend Host (Secret) |
| `REDIS_HOST` / `REDIS_PORT` / `REDIS_PASSWORD` / `REDIS_DB` | Backend `.env.example` | Redis template variables present in `backend/.env.example` (not currently read by active Express code; rate limiting uses in-memory store unless upgraded to Redis store) | Optional (Future scaling) | `localhost` / `6379` / `secret` / `0` | Managed Redis provider | Backend Host |
| `MCP_SERVER_API_KEY` | Backend `.env.example` | Template entry in `backend/.env.example` (not referenced in active Express routes) | Optional | `mcp_live_replace_me` | Internal tooling | Backend Host (Secret) |

---

## Templates

- Root / Backend example template: [backend/.env.example](file:///d:/Hayroo/backend/.env.example)
- Frontend example template: [frontend/.env.example](file:///d:/Hayroo/frontend/.env.example)

Copy `.env.example` to `.env` only for local development. In production, configure every variable directly through your deployment platform's environment manager.
