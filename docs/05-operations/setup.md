# ⚙️ DevOps, Local Setup & CI/CD Deployment Guide — ApexBazaar

**Document Version:** 1.0.0  
**Status:** Under Review / Ratified  
**Author:** Lead DevOps & Cloud Infrastructure Architect  
**Target Environments:** Local Docker, AWS ECS Fargate, Railway Production  

---

## 1. System Prerequisites

Before initializing the ApexBazaar environment, ensure the following tooling is installed on the host machine:

| Dependency | Minimum Version | Recommended Tooling |
| :--- | :--- | :--- |
| **Node.js** | `v20.12.0` or `v22.x` LTS | `nvm` or `fnm` for version switching |
| **Package Manager** | `npm v10+` or `pnpm v9+` | `pnpm` for fast monorepo workspace caching |
| **Docker Engine** | `v24.0+` | Docker Desktop (Windows/macOS) or Docker Engine (Linux) |
| **Docker Compose** | `v2.20+` | Bundled with modern Docker distributions |
| **Git** | `v2.40+` | Configured with SSH/GPG signing keys |

---

## 2. Environment Configuration (`.env.example`)

ApexBazaar uses a centralized, type-safe environment configuration validated via Zod at application startup. Create a local `.env` file from the reference below:

```bash
# ==============================================================================
# APEXBAZAAR CORE RUNTIME CONFIGURATION
# ==============================================================================
NODE_ENV=development
PORT=4000
API_BASE_URL=http://localhost:4000/api/v1
WEB_APP_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# ==============================================================================
# DATABASE (POSTGRESQL 16, SUPABASE & PGBOUNCER)
# ==============================================================================
# PgBouncer connection pooled URL for standard application queries
DATABASE_URL="postgresql://apex_user:apex_secure_pass@localhost:6432/apexbazaar_db?schema=public&pgbouncer=true"
# Direct connection URL used exclusively for Prisma CLI migrations
DIRECT_URL="postgresql://apex_user:apex_secure_pass@localhost:5432/apexbazaar_db?schema=public"

# Supabase Cloud Configuration
SUPABASE_URL="https://your-project-ref.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# ==============================================================================
# IN-MEMORY CACHE & JOB QUEUES (REDIS 7)
# ==============================================================================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=apex_redis_secret
REDIS_DB=0

# ==============================================================================
# SEARCH ENGINE (MEILISEARCH)
# ==============================================================================
MEILI_HOST=http://localhost:7700
MEILI_MASTER_KEY=apex_meili_master_key_1234567890

# ==============================================================================
# AUTHENTICATION & SECURITY (JWT)
# ==============================================================================
JWT_ACCESS_SECRET="apex_jwt_access_super_secret_key_2026_replace_in_prod"
JWT_ACCESS_EXPIRY=900 # 15 minutes (in seconds)
JWT_REFRESH_SECRET="apex_jwt_refresh_super_secret_key_2026_replace_in_prod"
JWT_REFRESH_EXPIRY=604800 # 7 days (in seconds)

# ==============================================================================
# PAYMENT GATEWAY (RAZORPAY & STRIPE)
# ==============================================================================
RAZORPAY_KEY_ID=rzp_test_YourTestKeyId1234
RAZORPAY_KEY_SECRET=YourRazorpaySecretKey5678
RAZORPAY_WEBHOOK_SECRET=YourWebhookSecretSigningKey
STRIPE_SECRET_KEY=sk_test_YourStripeSecretKey
STRIPE_WEBHOOK_SECRET=whsec_YourStripeWebhookSecret

# ==============================================================================
# 3PL LOGISTICS (SHIPROCKET & DELHIVERY)
# ==============================================================================
SHIPROCKET_API_EMAIL=logistics@apexbazaar.com
SHIPROCKET_API_PASSWORD=YourShiprocketPassword
SHIPROCKET_WEBHOOK_TOKEN=YourShiprocketWebhookToken
DELHIVERY_API_TOKEN=YourDelhiveryClientToken

# ==============================================================================
# COMMUNICATIONS (TWILIO / GUPSHUP / AWS SES)
# ==============================================================================
SMS_PROVIDER=GUPSHUP # GUPSHUP or TWILIO
GUPSHUP_USER_ID=YourGupshupUserId
GUPSHUP_PASSWORD=YourGupshupPassword
TWILIO_ACCOUNT_SID=AC_YourTwilioAccountSid
TWILIO_AUTH_TOKEN=YourTwilioAuthToken
TWILIO_PHONE_NUMBER=+1234567890
AWS_SES_REGION=ap-south-1
AWS_SES_ACCESS_KEY=AKIA_YourSesAccessKey
AWS_SES_SECRET_KEY=YourSesSecretKey
EMAIL_FROM_ADDRESS=support@apexbazaar.com

# ==============================================================================
# STORAGE & CDN (AWS S3 & CLOUDINARY)
# ==============================================================================
AWS_S3_REGION=ap-south-1
AWS_S3_BUCKET_PUBLIC=media.apexbazaar.com
AWS_S3_BUCKET_SECURE_KYC=secure-kyc.apexbazaar.com
CLOUDINARY_CLOUD_NAME=apexbazaar-media
CLOUDINARY_API_KEY=YourCloudinaryApiKey
CLOUDINARY_API_SECRET=YourCloudinaryApiSecret

# ==============================================================================
# FIREBASE SUITE (AUTH, FIRESTORE, STORAGE)
# ==============================================================================
FIREBASE_PROJECT_ID=apexbazaar-prod
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@apexbazaar-prod.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=apexbazaar-prod.appspot.com

# Client Vite Firebase Credentials
VITE_FIREBASE_API_KEY=AIzaSyA_YourFirebaseClientApiKey
VITE_FIREBASE_AUTH_DOMAIN=apexbazaar-prod.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=apexbazaar-prod
VITE_FIREBASE_STORAGE_BUCKET=apexbazaar-prod.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890

# ==============================================================================
# AI AGENTS & LLM (GOOGLE GEMINI)
# ==============================================================================
GEMINI_API_KEY=AIzaSy_YourGeminiApiKey
MCP_SERVER_API_KEY=mcp_live_sec_8f9e0d1c2b3a4c5d6e7f8a9b0c1d2e3f
```

---

## 3. Local Development Infrastructure (Docker Compose)

The local supporting services (PostgreSQL, PgBouncer, Redis, and Meilisearch) are orchestrated using `docker-compose.dev.yml`:

```yaml
version: '3.8'

services:
  # 1. Primary PostgreSQL 16 Instance
  postgres:
    image: postgres:16-alpine
    container_name: apex-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: apex_user
      POSTGRES_PASSWORD: apex_secure_pass
      POSTGRES_DB: apexbazaar_db
    ports:
      - "5432:5432"
    volumes:
      - apex_pg_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U apex_user -d apexbazaar_db"]
      interval: 5s
      timeout: 5s
      retries: 5

  # 2. PgBouncer Connection Pooler
  pgbouncer:
    image: edoburu/pgbouncer:v1.22.0
    container_name: apex-pgbouncer
    restart: unless-stopped
    environment:
      DB_USER: apex_user
      DB_PASSWORD: apex_secure_pass
      DB_HOST: postgres
      DB_NAME: apexbazaar_db
      POOL_MODE: transaction
      MAX_CLIENT_CONN: 500
      DEFAULT_POOL_SIZE: 25
    ports:
      - "6432:5432"
    depends_on:
      postgres:
        condition: service_healthy

  # 3. Redis 7 Cluster / Cache & BullMQ
  redis:
    image: redis:7-alpine
    container_name: apex-redis
    restart: unless-stopped
    command: redis-server --requirepass apex_redis_secret --maxmemory 512mb --maxmemory-policy volatile-lru
    ports:
      - "6379:6379"
    volumes:
      - apex_redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "apex_redis_secret", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

  # 4. Meilisearch Fast Search Engine
  meilisearch:
    image: getmeili/meilisearch:v1.10
    container_name: apex-meilisearch
    restart: unless-stopped
    environment:
      MEILI_MASTER_KEY: apex_meili_master_key_1234567890
      MEILI_ENV: development
    ports:
      - "7700:7700"
    volumes:
      - apex_meili_data:/meili_data
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--spider", "http://localhost:7700/health"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  apex_pg_data:
  apex_redis_data:
  apex_meili_data:
```

### 3.1 Step-by-Step Initial Setup
```bash
# 1. Start all data and storage engines
docker compose -f docker-compose.dev.yml up -d

# 2. Install workspace dependencies
npm install

# 3. Apply Prisma migrations and generate Prisma Client
npx prisma migrate dev --name init

# 4. Seed database with categories, admin credentials, and sample products
npm run seed

# 5. Launch NestJS backend server (Port 4000)
npm run start:dev:api

# 6. Launch React Vite frontend (Port 5173) in a second terminal
npm run start:dev:web
```

---

## 4. Production Multi-Stage Docker Builds

### 4.1 Backend API Multi-Stage Dockerfile (`apps/api/Dockerfile`)
```dockerfile
# Stage 1: Build & Prune
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build:api

# Stage 2: Production Dist
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

USER node
EXPOSE 4000
CMD ["node", "dist/main.js"]
```

### 4.2 Frontend Webapp Multi-Stage Dockerfile (`apps/web/Dockerfile`)
```dockerfile
# Stage 1: Build Static Assets
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build:web

# Stage 2: Serve via Nginx Alpine
FROM nginx:1.27-alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 5. CI/CD Deployment Pipeline (GitHub Actions)

The production pipeline enforces zero-regression test gates before triggering rolling deployments to AWS ECS:

```yaml
name: ApexBazaar Production Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  validate:
    name: Lint, Typecheck & Test
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: apex_user
          POSTGRES_PASSWORD: apex_secure_pass
          POSTGRES_DB: apexbazaar_test
        ports:
          - 5432:5432
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js 22 LTS
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Code Quality & Type Check
        run: |
          npm run lint
          npx tsc --noEmit

      - name: Run Prisma Migrations on Test DB
        env:
          DATABASE_URL: postgresql://apex_user:apex_secure_pass@localhost:5432/apexbazaar_test?schema=public
        run: npx prisma migrate deploy

      - name: Run Unit & Integration Tests
        env:
          DATABASE_URL: postgresql://apex_user:apex_secure_pass@localhost:5432/apexbazaar_test?schema=public
          REDIS_HOST: localhost
          REDIS_PORT: 6379
        run: npm run test:coverage

  deploy:
    name: Build Containers & Deploy to AWS ECS
    needs: validate
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-south-1

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build, Tag & Push API Container
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/apexbazaar-api:$IMAGE_TAG -f apps/api/Dockerfile .
          docker push $ECR_REGISTRY/apexbazaar-api:$IMAGE_TAG

      - name: Rolling Deployment to Amazon ECS
        run: |
          aws ecs update-service --cluster apexbazaar-prod-cluster --service api-service --force-new-deployment

