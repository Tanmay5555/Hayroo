# 🤖 Model Context Protocol (MCP) Specification — ApexBazaar

**Document Version:** 1.0.0  
**Status:** Under Review / Ratified  
**Author:** AI Architecture & Platform Integrations Squad  
**Protocol Standard:** Model Context Protocol (MCP) Specification (JSON-RPC 2.0)  
**Supported Transports:** `stdio` (Local CLI agents) & Server-Sent Events (`SSE`) over HTTPS  

---

## 1. Overview & Architectural Role of MCP

The **Model Context Protocol (MCP)** provides a secure, structured interface allowing external and internal Large Language Model (LLM) agents (such as Google Gemini, Anthropic Claude, OpenAI, and internal shopping assistants) to safely query and interact with the ApexBazaar marketplace without direct database or unmonitored API access.

```mermaid
flowchart LR
    subgraph AgentClients ["AI Agent Consumers"]
        ShopBot["Consumer Shopping Assistant"]
        SellerCopilot["Seller Listing Copilot"]
        SupportAgent["Tier-1 Customer Support Bot"]
        IDEAgent["Developer IDE / Antigravity Agent"]
    end

    subgraph MCPServer ["ApexBazaar MCP Gateway (:4001)"]
        Guard["MCP Scope & Auth Guard (Bearer API Key)"]
        Sanitizer["PII Sanitizer & Prompt Injection Shield"]
        Router["JSON-RPC 2.0 Dispatcher"]
    end

    subgraph CoreBackend ["ApexBazaar Core Services"]
        SearchSvc["Meilisearch (Catalog Discovery)"]
        OrderSvc["Order & Fulfillment Service"]
        SellerSvc["Seller Analytics & Ledger"]
        SupportSvc["Dispute & Return Service"]
    end

    ShopBot --> Guard
    SellerCopilot --> Guard
    SupportAgent --> Guard
    IDEAgent --> Guard

    Guard --> Sanitizer
    Sanitizer --> Router
    
    Router --> SearchSvc
    Router --> OrderSvc
    Router --> SellerSvc
    Router --> SupportSvc
```

### Core Design Principles
1. **Read-Heavy, Zero Direct Writes for Consumer Agents:** Consumer-facing tools are strictly read-only. Financial transactions (checkout, payments, refunds) cannot be executed via MCP tools without an explicit human-in-the-loop interactive token authorization.
2. **Aggressive PII Redaction:** Customer names, full home addresses, phone numbers, and payment details are scrubbed or masked (e.g. `+91 ***** *3210`) before returning payloads to agent contexts.
3. **Prompt Injection Hardening:** All user-supplied text returned from products, reviews, or seller descriptions is wrapped in defensive boundary delimiters (`<user_data>...</user_data>`) to protect host agents from indirect prompt injection attacks.

---

## 2. Authentication & Authorization Boundaries

All MCP connections must authenticate via an HTTP `Authorization` header containing a scoped MCP API Key:
```http
Authorization: Bearer mcp_live_sec_8f9e0d1c2b3a4c5d...
```

### Granular MCP Scopes
| Scope Identifier | Permitted Operations | Permitted Consumer Roles |
| :--- | :--- | :--- |
| `mcp:catalog:read` | Query catalog, faceted search, product specifications | Public Shoppers, External Shopping Assistants |
| `mcp:orders:read` | Inspect status of specific order given verification proof | Authenticated Customers, Support Bots |
| `mcp:seller:analytics`| Fetch SKU sales telemetry, low stock, escrow projections | Verified Sellers, Seller Copilots |
| `mcp:support:disputes`| Retrieve return timelines, defect photos, carrier tracking | Internal Customer Support AI Agents |

---

## 3. Exposed MCP Tools Specification

### 3.1 Tool 1: `product_search`
- **Scope:** `mcp:catalog:read`
- **Description:** Performs high-speed semantic and faceted searches against the live ApexBazaar catalog. Returns structured product cards, variant prices, seller ratings, and stock status.

#### Tool Schema Definition
```json
{
  "name": "product_search",
  "description": "Search the ApexBazaar catalog across categories, brands, price limits, and dynamic attributes.",
  "parameters": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "Natural language or keyword search query (e.g. 'Sony noise cancelling headphones under 25000')."
      },
      "categorySlug": {
        "type": "string",
        "description": "Optional category filter slug (e.g. 'electronics', 'fashion', 'grocery')."
      },
      "minPrice": {
        "type": "number",
        "description": "Minimum price in INR."
      },
      "maxPrice": {
        "type": "number",
        "description": "Maximum price in INR."
      },
      "brand": {
        "type": "string",
        "description": "Specific brand name (e.g. 'Sony', 'Apple', 'Nike')."
      },
      "limit": {
        "type": "integer",
        "default": 5,
        "maximum": 10,
        "description": "Number of results to return (kept small to preserve LLM context window)."
      }
    },
    "required": ["query"]
  }
}
```

#### Sample Response Output
```json
{
  "totalHits": 14,
  "products": [
    {
      "id": "prod_sony_wh1000xm5",
      "title": "Sony WH-1000XM5 Wireless Noise Canceling Headphones",
      "brand": "Sony",
      "category": "Audio & Headphones",
      "priceINR": 26990.00,
      "mrpINR": 34990.00,
      "discountPercent": 23,
      "rating": 4.8,
      "reviewCount": 2410,
      "inStock": true,
      "seller": "CloudAudio Direct (4.9 ⭐)",
      "topSpecs": {
        "batteryLife": "30 Hours",
        "anc": "Industry-Leading Dual Processor ANC",
        "bluetooth": "5.2"
      },
      "pdpUrl": "https://apexbazaar.com/products/sony-wh-1000xm5-wireless-headphones"
    }
  ]
}
```

---

### 3.2 Tool 2: `order_status_check`
- **Scope:** `mcp:orders:read`
- **Description:** Retrieves real-time fulfillment status, 3PL carrier tracking, and estimated delivery dates for an order.
- **Security Guardrail:** Requires **both** `orderNumber` and the customer's `last4PhoneDigits` to prevent unauthenticated order scanning.

#### Tool Schema Definition
```json
{
  "name": "order_status_check",
  "description": "Check the delivery status, carrier tracking, and vendor sub-orders for an existing customer order.",
  "parameters": {
    "type": "object",
    "properties": {
      "orderNumber": {
        "type": "string",
        "description": "The unique master order number (e.g. 'APX-202611-98124')."
      },
      "last4PhoneDigits": {
        "type": "string",
        "pattern": "^[0-9]{4}$",
        "description": "Last 4 digits of the phone number used during checkout for identity verification."
      }
    },
    "required": ["orderNumber", "last4PhoneDigits"]
  }
}
```

#### Sample Response Output
```json
{
  "orderNumber": "APX-202611-98124",
  "status": "PARTIALLY_SHIPPED",
  "placedAt": "2026-11-01T10:15:00.000Z",
  "totalAmountINR": 25990.00,
  "subOrders": [
    {
      "subOrderNumber": "APX-202611-98124-S1",
      "seller": "CloudAudio Direct",
      "status": "IN_TRANSIT",
      "carrier": "Delhivery Express",
      "awbNumber": "DEL-9812410291",
      "estimatedDelivery": "2026-11-03",
      "items": [
        {
          "title": "Sony WH-1000XM5 - Black",
          "quantity": 1
        }
      ]
    }
  ]
}
```

---

### 3.3 Tool 3: `seller_analytics_telemetry`
- **Scope:** `mcp:seller:analytics`
- **Description:** Exposes operational health metrics to seller AI assistants, including sales run-rates, out-of-stock SKU alerts, and projected escrow payout schedules.

#### Tool Schema Definition
```json
{
  "name": "seller_analytics_telemetry",
  "description": "Fetch real-time sales telemetry, low stock warnings, and pending escrow balances for the authenticated seller.",
  "parameters": {
    "type": "object",
    "properties": {
      "timeHorizonDays": {
        "type": "integer",
        "enum": [7, 30, 90],
        "default": 30,
        "description": "Historical reporting period in days."
      }
    }
  }
}
```

#### Sample Response Output
```json
{
  "sellerBusinessName": "TechDirect Retail",
  "reportingPeriodDays": 30,
  "grossSalesINR": 482500.00,
  "netEarningsINR": 434250.00,
  "ordersCount": 142,
  "unsettledEscrowBalanceINR": 48200.00,
  "lowStockAlerts": [
    {
      "sku": "PS-EAR-BLK",
      "productTitle": "ProSound ANC Wireless Earbuds",
      "currentStock": 2,
      "reorderRecommendation": 50
    }
  ],
  "nextScheduledPayout": {
    "amountINR": 18450.00,
    "releaseDate": "2026-11-04"
  }
}
```

---

## 4. Security Boundaries & Rate Limiting

### 4.1 Rate Limits for MCP Endpoints
- **Public / Shopping Assistant:** 30 tool calls per minute per API key.
- **Support & Internal Bot:** 120 tool calls per minute per API key.
- Throttled requests return standard JSON-RPC error code `-32000` (`Rate limit exceeded`).

### 4.2 Indirect Prompt Injection Mitigation
All string fields returned from user-generated content (reviews, product descriptions, customer inquiries) are sanitized:
- HTML/script tags stripped.
- Control characters and zero-width spaces removed.
- Payloads wrapped in structured XML tags:
  ```xml
  <catalog_result>
    <title>Sony WH-1000XM5</title>
    <seller_description>Authentic brand new sealed unit.</seller_description>
  </catalog_result>
  ```

