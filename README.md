# 🛍️ ApexBazaar — Enterprise Multi-Vendor E-Commerce Marketplace

[![Architecture](https://img.shields.io/badge/Architecture-Modular%20Monolith-blue.svg)](docs/02-architecture/architecture.md)
[![Database](https://img.shields.io/badge/Database-Supabase%20PostgreSQL%20%2B%20Firebase-indigo.svg)](docs/02-architecture/database.md)
[![Search](https://img.shields.io/badge/Search-Meilisearch%20(Sub--30ms)-red.svg)](docs/02-architecture/architecture.md)
[![Frontend](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite%20%2B%20Tailwind%204-cyan.svg)](docs/02-architecture/design.md)
[![Backend](https://img.shields.io/badge/Backend-NestJS%2010%20%2B%20BullMQ-green.svg)](docs/02-architecture/architecture.md)
[![Documentation](https://img.shields.io/badge/Documentation-Spec--First-orange.svg)](docs/)

**ApexBazaar** is an enterprise-grade, high-scale multi-vendor e-commerce marketplace platform architected to support **100,000+ SKUs across all product categories** and **10,000+ concurrent active shoppers**. Engineered under a strict **Documentation-First** methodology, the platform delivers a high-performance **Hybrid Supabase (PostgreSQL) + Firebase** cloud architecture: Supabase manages structured relational transactions, dynamic JSONB variant schemas, multi-seller split orders, and financial escrow ledgers, while Firebase provides carrier-grade Phone SMS OTP authentication, Cloud Storage for media assets and KYC proofs, and real-time Firestore collections for AI shopping chat and delivery driver telemetry.

---

## 📑 Complete Documentation Index

All architectural, security, design, and operational specifications are written and ratified before implementation. The documentation represents the single source of truth for the codebase.

| Section | Document | Summary Description |
| :--- | :--- | :--- |
| **01. Planning** | [**PRD (Product Requirements Document)**](docs/01-planning/prd.md) | Business goals, 5 ecosystem personas, user stories, functional & non-functional specifications, success metrics, and scope boundaries. |
| | [**Roadmap & Implementation Plan**](docs/01-planning/plan.md) | Phased delivery schedule (MVP, v1, v2), sprint milestones, engineering effort estimates, risk mitigation matrix, and release gates. |
| **02. Architecture** | [**System Architecture**](docs/02-architecture/architecture.md) | End-to-end Mermaid system topologies, modular monolith domain boundaries, event-driven async queues, caching, and horizontal scaling strategy. |
| | [**Design System & UI/UX**](docs/02-architecture/design.md) | Design tokens, responsive component specs, layouts for consumer storefront, seller vendor portal, admin moderation hub, and driver PWA. |
| | [**Database & Data Model**](docs/02-architecture/database.md) | Comprehensive PostgreSQL + Prisma ERD, JSONB attribute schemas, high-throughput indexes, migration workflows, and seed datasets. |
| **03. Security & APIs** | [**Authentication & Security**](docs/03-security-and-apis/authentication.md) | Phone OTP + JWT rotation, RBAC security matrix across 5 roles, seller KYC verification workflows, OWASP Top 10 defense, and Redis rate limiting. |
| | [**REST API Specification**](docs/03-security-and-apis/api.md) | Complete OpenAPI/REST endpoint contract grouped by persona, request/response JSON payloads, pagination standards, and error codes. |
| | [**Model Context Protocol (MCP)**](docs/03-security-and-apis/mcp.md) | External agent MCP tools, schema definitions for product discovery, order tracking, seller inventory telemetry, and auth boundaries. |
| **04. Features & Agents**| [**Feature Specifications**](docs/04-features-and-agents/feature.md) | Deep functional criteria and edge-case handling for cart, multi-seller split checkout, coupons, returns, disputes, and escrow releases. |
| | [**AI Agent Suite**](docs/04-features-and-agents/agent.md) | Architecture for conversational shopping assistant, 24/7 support bot, seller catalog listing helper, and anti-fraud fake review detector. |
| | [**Integrations & Webhooks**](docs/04-features-and-agents/integration.md) | Integration protocols for Razorpay/Stripe, Shiprocket/Delhivery 3PL logistics, SMS/WhatsApp/SES messaging, and Indian GST compliance. |
| **05. Operations** | [**Setup & Deployment Guide**](docs/05-operations/setup.md) | Environment setup, `.env.example`, Docker Compose orchestration, multi-stage CI/CD pipelines, and cloud hosting runbooks. |
| | [**Testing Strategy**](docs/05-operations/testing.md) | Unit, integration, Playwright E2E test suites, k6 load testing scripts, coverage thresholds, and regression smoke tests. |
| | [**Observability & Debugging**](docs/05-operations/debugging.md) | Structured logging (Winston), Sentry APM, Prometheus/Grafana dashboards, error diagnosis runbooks, and incident response runbooks. |

---

## 🛠️ Technology Stack

```mermaid
flowchart TD
    Client["Client Devices (Web, Mobile PWA)"] --> Cloudflare["Cloudflare CDN & WAF"]
    Cloudflare --> Nginx["Nginx Reverse Proxy & SSL Termination"]
    
    subgraph FrontendApp ["Frontend Application (React 19)"]
        ReactUI["Vite + React 19 + TypeScript"]
        StateLayer["Zustand (Client UI) + TanStack Query (Server Cache)"]
        Styling["Tailwind CSS v4 + Lucide Icons"]
    end
    Nginx --> FrontendApp

    subgraph BackendApp ["Modular Monolith Backend (NestJS 10)"]
        Gateway["REST API Gateway (OpenAPI / Helmet / RateLimiter)"]
        
        subgraph CoreModules ["Core Domain Modules"]
            AuthMod["Auth & RBAC Module"]
            CatMod["Catalog & Category Module"]
            CartMod["Cart & Split Checkout Module"]
            PayMod["Payment & Escrow Module"]
            LogMod["Shipment & Logistics Module"]
            VendMod["Seller Management Module"]
        end
        Gateway --> CoreModules
    end
    Nginx --> BackendApp

    subgraph DataTier ["Data & Async Layer"]
        PG[("PostgreSQL 16 (Prisma ORM + JSONB)")]
        RedisCache[("Redis 7 (Cache, Sessions, Rate Limits)")]
        Meili[("Meilisearch (Faceted Catalog Search)")]
        Bull["BullMQ (Async Job Queues)"]
    end
    
    CoreModules --> PG
    CoreModules --> RedisCache
    CoreModules --> Meili
    CoreModules --> Bull
    Bull --> RedisCache
```

### 1. Frontend Architecture
- **Framework & Runtime**: React 19, TypeScript 5.5, Vite 6.0.
- **Routing & Navigation**: React Router v7 with lazy-loaded route segments and prefetching.
- **State Management**: **Zustand** for lightweight client state (theme, cart drawer, modals) + **TanStack Query v5** for optimistic server-state caching, background revalidation, and mutation rollback.
- **Styling & UI**: Tailwind CSS v4, dynamic CSS variables for theme support, Lucide React iconography, WCAG 2.1 AA accessible patterns.
- **SEO & Social Metadata**: React Helmet Async + static XML sitemap generation for dynamic product and category pages.

### 2. Backend & API Services
- **Runtime & Framework**: Node.js 22 LTS, NestJS 10 (Modular Monolith architecture with strict domain boundaries ready for microservices decomposition).
- **Communication Protocol**: Type-safe REST APIs documented with OpenAPI / Swagger v3.
- **Validation & Transformation**: `class-validator`, `class-transformer`, and Zod validation schemas.
- **Authentication & Security**: Argon2id password hashing, rotating JWT Access/Refresh tokens, Redis-backed token revocation, Helmet HTTP headers, CORS whitelisting, and strict rate-limiting guards.

### 3. Data, Caching & Search Engine
- **Primary Relational DB**: PostgreSQL 16 managed via Prisma ORM with connection pooling (PgBouncer). Dynamic product specifications stored in high-performance `JSONB` with GIN indexing.
- **In-Memory Cache & Session Store**: Redis 7 cluster for session tracking, cart persistence, distributed locks (`redlock`), and high-speed API response caching.
- **Search & Discovery Engine**: **Meilisearch** cluster delivering sub-30ms response times, typo tolerance, synonyms, prefix search, and multi-facet filtering across millions of SKU variations.
- **Message Queues & Background Workers**: **BullMQ** on Redis for handling transactional emails/SMS, order event fan-out, inventory adjustments, and scheduled escrow payout releases.

### 4. Storage, Payments & Logistics
- **Object Storage & Media**: AWS S3 / Cloudflare R2 bucket with Cloudinary CDN integration for on-the-fly responsive WebP/AVIF generation.
- **Payment & Split Settlement**: **Razorpay** (UPI Intent, Cards, NetBanking, COD with OTP validation, Razorpay Route for automated marketplace commission split & escrow hold) + **Stripe Connect** international fallback.
- **Logistics & Tracking**: Hybrid integration with **Shiprocket & Delhivery APIs** for automated AWB generation and multi-carrier courier tracking, supplemented with an internal **Delivery Partner Web/PWA** interface.

---

## 👥 Ecosystem Roles & Permissions

ApexBazaar provides dedicated experiences and authorization boundaries for five key personas:

| Role | Key Capabilities & Interface | Primary Access Boundary |
| :--- | :--- | :--- |
| **1. Customer** | Search catalog, multi-vendor cart, split checkout, order tracking, cancellation/returns, reviews & questions. | Consumer Storefront (`/`) |
| **2. Seller / Vendor** | Business KYC onboarding, inventory management, dynamic variant pricing, order fulfillment, shipping labels, payout ledger. | Seller Portal (`/seller`) |
| **3. Super Admin** | Platform-wide analytics, category hierarchy management, seller approval, dispute arbitration, commission rules, audit logs. | Admin Hub (`/admin`) |
| **4. Support Staff** | Order history inspection, customer return/refund dispute resolution, ticket routing, customer outreach. | Support Desk (`/support`) |
| **5. Delivery Partner** | PWA run-sheet, package pickup confirmation, doorstep OTP verification, delivery failure reporting, payout logs. | Delivery PWA (`/delivery`) |

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Node.js**: `v20.x` or `v22.x` LTS
- **Docker Desktop**: `v24+` & **Docker Compose**: `v2.20+`
- **Package Manager**: `npm` or `pnpm` (`v9+`)

### 1. Clone & Setup Environment
```bash
# Clone the repository
git clone https://github.com/your-org/apexbazaar.git
cd apexbazaar

# Copy sample environment configuration
cp .env.example .env
```

### 2. Launch Supporting Infrastructure (Docker)
```bash
# Launch PostgreSQL, Redis, and Meilisearch
docker compose -f docker-compose.dev.yml up -d

# Verify all services are healthy
docker compose -f docker-compose.dev.yml ps
```

### 3. Install Dependencies & Seed Database
```bash
# Install root, backend, and frontend dependencies
npm install

# Apply database migrations via Prisma
npx prisma migrate dev --name init

# Seed initial categories, admin user, and sample multi-vendor products
npm run seed
```

### 4. Run Development Servers
```bash
# Run backend API server (NestJS on port 4000)
npm run start:dev:api

# Run frontend application (Vite on port 5173) in a separate terminal
npm run start:dev:web
```

Access the interfaces:
- **Storefront**: `http://localhost:5173`
- **Seller Portal**: `http://localhost:5173/seller`
- **Admin Hub**: `http://localhost:5173/admin`
- **Delivery Partner PWA**: `http://localhost:5173/delivery`
- **Swagger API Docs**: `http://localhost:4000/api/docs`
- **Meilisearch Dashboard**: `http://localhost:7700`

---

## 🔒 Security & Compliance Principles
1. **Zero Trust & Least Privilege**: Role-based access control (RBAC) enforced at both the API gateway and individual controller routes.
2. **Indian Tax & Regulatory Compliance**: Fully compliant with Indian GST rules (HSN/SAC codes, CGST/SGST/IGST breakdown), Digital Personal Data Protection (DPDP) Act 2023, and Consumer Protection (E-Commerce) Rules 2020.
3. **Financial Escrow Protection**: Seller payouts are secured in an escrow holding balance and automatically disbursed only after customer return/replacement windows close.

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for more details.
