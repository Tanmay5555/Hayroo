# 📡 REST API Specification — ApexBazaar

**Document Version:** 1.0.0  
**Status:** Under Review / Ratified  
**Author:** Lead Backend Architect & API Standards Committee  
**Base URL:** `https://api.apexbazaar.com/api/v1` (Production) / `http://localhost:4000/api/v1` (Local)  
**Protocol:** RESTful over HTTPS with OpenAPI / Swagger 3.0 Documentation  

---

## 1. Global API Standards & Conventions

### 1.1 Response Envelope Structure
All API responses conform to a strict, standardized JSON envelope structure:

#### Success Envelope (`2xx`)
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "totalItems": 1420,
    "totalPages": 71,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

#### Error Envelope (`4xx` / `5xx`)
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Requested quantity of 3 exceeds available stock of 1 for SKU 'IPH15-BLK-256'.",
    "details": [
      {
        "field": "quantity",
        "issue": "Requested quantity unavailable"
      }
    ],
    "timestamp": "2026-11-01T10:15:30.124Z",
    "traceId": "req_8f1d2e9c-3a4b-4c5d-6e7f-8a9b0c1d2e3f"
  }
}
```

### 1.2 Global Error Dictionary
| HTTP Status | Error Code | Description |
| :--- | :--- | :--- |
| **400 Bad Request** | `VALIDATION_FAILED` | Payload failed DTO class-validator / Zod schema checks. |
| **401 Unauthorized** | `TOKEN_EXPIRED` / `INVALID_TOKEN` | Bearer token missing, expired, or signature invalid. |
| **403 Forbidden** | `FORBIDDEN_RESOURCE` | Authenticated role lacks permission to perform action. |
| **404 Not Found** | `RESOURCE_NOT_FOUND` | Target entity ID does not exist in the database. |
| **409 Conflict** | `RESOURCE_ALREADY_EXISTS` | Unique constraint violated (e.g. duplicate phone, GSTIN). |
| **422 Unprocessable**| `INSUFFICIENT_STOCK` | Business rule violated (e.g. out of stock during checkout). |
| **429 Too Many Req** | `RATE_LIMIT_EXCEEDED` | Request throttled by Redis token bucket policy. |
| **500 Server Error** | `INTERNAL_SERVER_ERROR` | Unhandled runtime exception logged to Sentry. |

---

## 2. Public & Customer Endpoints

### 2.1 Authentication & Identity

#### `POST /auth/phone/otp-request`
- **Auth:** Public
- **Request Body:**
  ```json
  {
    "phoneNumber": "+919876543210"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "message": "6-digit OTP sent via SMS",
      "expiresInSeconds": 300
    }
  }
  ```

#### `POST /auth/phone/otp-verify`
- **Auth:** Public
- **Request Body:**
  ```json
  {
    "phoneNumber": "+919876543210",
    "otp": "582914"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "accessToken": "eyJhbGciOiJSUzI1NiIs...",
      "refreshToken": "7c9f8a1e2d3b4c5...",
      "user": {
        "id": "usr_9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "phoneNumber": "+919876543210",
        "fullName": "Rohan Sharma",
        "role": "CUSTOMER"
      }
    }
  }
  ```

#### `POST /auth/refresh`
- **Auth:** Public (Requires valid Refresh Token)
- **Request Body:**
  ```json
  {
    "refreshToken": "7c9f8a1e2d3b4c5..."
  }
  ```
- **Response (200 OK):** Returns newly rotated `accessToken` and single-use `refreshToken`.

---

### 2.2 Product Catalog & Search Discovery

#### `GET /categories`
- **Auth:** Public
- **Query Params:** None (returns full 4-level nested category tree cached at Cloudflare edge).
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "cat_electronics",
        "name": "Electronics",
        "slug": "electronics",
        "subcategories": [
          {
            "id": "cat_audio",
            "name": "Audio & Headphones",
            "slug": "audio-headphones",
            "subcategories": []
          }
        ]
      }
    ]
  }
  ```

#### `GET /search`
- **Auth:** Public
- **Query Params:** `q`, `category`, `brand`, `minPrice`, `maxPrice`, `rating`, `page`, `limit`, `sort`
- **Sample Request:** `GET /search?q=wireless+headphones&brand=Sony&minPrice=5000&maxPrice=30000&sort=price:asc`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "hits": [
        {
          "id": "prod_sony_wh1000xm5",
          "title": "Sony WH-1000XM5 Wireless Noise Canceling Headphones",
          "slug": "sony-wh-1000xm5-wireless-headphones",
          "brand": "Sony",
          "ratingAverage": 4.8,
          "ratingCount": 2410,
          "minPrice": 26990.00,
          "mrp": 34990.00,
          "primaryImage": "https://cdn.apexbazaar.com/products/sony-wh-1.webp",
          "inStock": true,
          "seller": {
            "businessName": "CloudAudio Direct",
            "ratingAverage": 4.9
          }
        }
      ],
      "facets": {
        "brand": { "Sony": 42, "Bose": 18, "Sennheiser": 12 },
        "dynamicSpecs.connectivity": { "Bluetooth 5.2": 60, "Bluetooth 5.3": 12 }
      }
    },
    "meta": { "totalHits": 72, "processingTimeMs": 14 }
  }
  ```

#### `GET /search/autocomplete`
- **Auth:** Public
- **Query Params:** `q=sam`
- **Response (200 OK):** Returns top query completions, matching brand chips, and direct product suggestions.

---

### 2.3 Shopping Cart Engine

#### `GET /cart`
- **Auth:** Authenticated (`CUSTOMER`) or Guest Session Header (`X-Guest-Cart-ID`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "cartId": "crt_8f9e0d1c-2b3a-4c5d-6e7f-8a9b0c1d2e3f",
      "itemsBySeller": [
        {
          "sellerId": "sel_tech_direct",
          "businessName": "TechDirect Retail",
          "estimatedDelivery": "2026-11-03",
          "freeShippingThreshold": 999.00,
          "sellerSubtotal": 26990.00,
          "sellerShippingFee": 0.00,
          "items": [
            {
              "itemId": "item_1234",
              "productVariantId": "var_sony_blk",
              "title": "Sony WH-1000XM5 - Black",
              "sku": "SONY-WH5-BLK",
              "quantity": 1,
              "unitPrice": 26990.00,
              "totalPrice": 26990.00,
              "stockAvailable": 14
            }
          ]
        }
      ],
      "summary": {
        "subtotal": 26990.00,
        "shippingTotal": 0.00,
        "discountTotal": 1000.00,
        "taxEstimated": 4117.11,
        "grandTotal": 25990.00
      }
    }
  }
  ```

#### `POST /cart/items`
- **Auth:** Optional (`CUSTOMER`)
- **Request Body:**
  ```json
  {
    "productVariantId": "var_sony_blk",
    "quantity": 1
  }
  ```

---

### 2.4 Checkout & Split Order Processing

#### `POST /orders/checkout-summary`
- **Auth:** Bearer Token (`CUSTOMER`)
- **Request Body:**
  ```json
  {
    "shippingAddressId": "addr_9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "couponCode": "APEXFEST10"
  }
  ```
- **Response (200 OK):** Full tax breakdown (CGST/SGST/IGST), vendor sub-order partition previews, and final payable amount.

#### `POST /orders/create-payment-intent`
- **Auth:** Bearer Token (`CUSTOMER`)
- **Request Body:**
  ```json
  {
    "shippingAddressId": "addr_9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "paymentMethod": "RAZORPAY_UPI",
    "couponCode": "APEXFEST10"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "gatewayOrderId": "order_rzp_Live981240182",
      "amount": 2599000,
      "currency": "INR",
      "razorpayKey": "rzp_live_abc12345678"
    }
  }
  ```

#### `POST /orders/confirm`
- **Auth:** Bearer Token (`CUSTOMER`)
- **Headers:** `Idempotency-Key: <UUID>`
- **Request Body:**
  ```json
  {
    "gatewayOrderId": "order_rzp_Live981240182",
    "gatewayPaymentId": "pay_Live871234123",
    "gatewaySignature": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "masterOrderNumber": "APX-202611-98124",
      "subOrders": [
        {
          "subOrderNumber": "APX-202611-98124-S1",
          "sellerBusinessName": "TechDirect Retail",
          "itemsCount": 1,
          "subtotal": 25990.00,
          "status": "CONFIRMED"
        }
      ]
    }
  }
  ```

---

## 3. Seller / Vendor Endpoints (`/seller/...`)

All endpoints in this group require Bearer Token with role `SELLER`.

### 3.1 KYC & Store Profile

#### `POST /seller/kyc/submit`
- **Request Body:**
  ```json
  {
    "gstinNumber": "29AABCU9603R1ZX",
    "panNumber": "AABCU9603R",
    "bankAccountNumber": "981234567890",
    "bankIfscCode": "HDFC0000128",
    "bankAccountName": "TechDirect Retail Private Limited",
    "businessAddress": {
      "street": "100 Feet Road, Indiranagar",
      "city": "Bangalore",
      "state": "Karnataka",
      "postalCode": "560038"
    },
    "documentProofUrls": [
      "https://s3.apexbazaar.internal/kyc/gst_cert.pdf",
      "https://s3.apexbazaar.internal/kyc/pan_card.jpg"
    ]
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "kycStatus": "PENDING_VERIFICATION",
      "submittedAt": "2026-11-01T12:00:00.000Z"
    }
  }
  ```

---

### 3.2 Product & Dynamic Variant Management

#### `POST /seller/products`
- **Request Body:**
  ```json
  {
    "categoryId": "cat_audio",
    "title": "ProSound ANC Wireless Earbuds",
    "brand": "ProSound",
    "hsnCode": "85183000",
    "description": "True wireless earbuds with 42dB active noise cancellation.",
    "highlights": ["42dB ANC", "36-Hour Battery", "IPX5 Water Resistant"],
    "variants": [
      {
        "sku": "PS-EAR-BLK",
        "title": "Midnight Black",
        "price": 3499.00,
        "mrp": 5999.00,
        "costPrice": 1800.00,
        "initialStock": 50,
        "attributes": {
          "color": "Midnight Black",
          "batteryLifeHours": 36,
          "bluetoothVersion": "5.3",
          "waterResistance": "IPX5"
        },
        "images": ["https://cdn.apexbazaar.com/products/ps-black-1.webp"]
      }
    ]
  }
  ```
- **Response (201 Created):** Returns created product entity with auto-indexed Meilisearch ID.

---

### 3.3 Fulfillment & Shipping Label Generation

#### `POST /seller/orders/:subOrderId/generate-label`
- **Description:** Calls Shiprocket/Delhivery API to generate AWB and shipping label PDF with barcode.
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "subOrderId": "sub_9a8b7c6d",
      "trackingNumber": "AWB-DEL-9812410291",
      "carrierName": "Delhivery Express",
      "shippingLabelUrl": "https://cdn.apexbazaar.com/labels/AWB-DEL-9812410291.pdf",
      "pickupScheduledDate": "2026-11-02T10:00:00.000Z",
      "status": "LABEL_GENERATED"
    }
  }
  ```

---

### 3.4 Escrow Ledger & Payouts

#### `GET /seller/ledger`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "currentBalance": 142850.00,
      "unsettledEscrowBalance": 48200.00,
      "recentTransactions": [
        {
          "id": "led_12345",
          "referenceType": "ORDER_CREDIT",
          "referenceId": "APX-202611-98124-S1",
          "amount": 23391.00,
          "balanceAfter": 142850.00,
          "description": "Net credit after 10% platform commission and 1% TCS",
          "createdAt": "2026-11-01T14:30:00.000Z"
        }
      ]
    }
  }
  ```

---

## 4. Delivery Partner Endpoints (`/delivery/...`)

All endpoints require Bearer Token with role `DELIVERY_PARTNER`.

#### `GET /delivery/manifest`
- **Description:** Returns today's assigned package run-sheet sorted by optimal delivery route.
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "totalAssigned": 18,
      "deliveredCount": 7,
      "pendingCount": 11,
      "packages": [
        {
          "shipmentId": "shp_8f1d2e9c",
          "orderNumber": "APX-202611-98124-S1",
          "recipientName": "Rohan Sharma",
          "recipientPhone": "+919876543210",
          "deliveryAddress": "Flat 402, Green Acres Apt, Indiranagar, Bangalore",
          "pincode": "560038",
          "paymentType": "PREPAID",
          "collectibleAmount": 0.00
        }
      ]
    }
  }
  ```

#### `POST /delivery/shipments/:shipmentId/verify-otp-delivery`
- **Request Body:**
  ```json
  {
    "deliveryOtp": "4912"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "status": "DELIVERED",
      "deliveredAt": "2026-11-02T16:42:10.000Z",
      "message": "Delivery completed and verified via customer OTP."
    }
  }
  ```

---

## 5. Super Admin Endpoints (`/admin/...`)

All endpoints require Bearer Token with role `ADMIN`.

#### `POST /admin/sellers/:sellerProfileId/kyc-decision`
- **Request Body:**
  ```json
  {
    "decision": "APPROVED",
    "customCommissionPercent": 8.50,
    "rejectionReason": null
  }
  ```
- **Response (200 OK):** Returns updated seller profile with store activated for public trade.

#### `GET /admin/analytics/overview`
- **Query Params:** `startDate=2026-10-01&endDate=2026-10-31`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "grossMerchandiseValue": 48291000.00,
      "platformCommissionEarned": 4829100.00,
      "totalOrdersCompleted": 14210,
      "averageOrderValue": 3398.00,
      "activeVerifiedSellers": 412,
      "overallReturnRatePercent": 2.4
    }
  }
  ```

