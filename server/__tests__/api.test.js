import request from 'supertest';
import mongoose from 'mongoose';
import { jest, beforeAll, afterAll, describe, it, expect } from '@jest/globals';
import app from '../app.js';
import { connectDB } from '../config/db.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import User from '../models/User.js';
import SellerProfile from '../models/SellerProfile.js';
import Order from '../models/Order.js';
import { generateTokens } from '../utils/jwt.js';

let customerToken = '';
let sellerToken = '';
let adminToken = '';
let deliveryToken = '';
let testProductId = '';
let testSellerProfileId = '';
let createdSubOrderId = '';

jest.setTimeout(35000);

beforeAll(async () => {
  await connectDB();
  await User.deleteMany({});
  await SellerProfile.deleteMany({});
  await Product.deleteMany({});
  await Category.deleteMany({});
  await Order.deleteMany({});

  // 1. Seed Customer
  const customer = new User({
    fullName: 'Rohan Sharma',
    email: 'rohan@apexbazaar.com',
    phoneNumber: '+919876543210',
    role: 'CUSTOMER',
    isPhoneVerified: true,
    addresses: [
      {
        fullName: 'Rohan Sharma',
        phoneNumber: '+919876543210',
        addressLine1: '402 Green Acres',
        city: 'Bangalore',
        state: 'Karnataka',
        postalCode: '560038',
        isDefault: true,
      },
    ],
  });
  await customer.setPassword('password123');
  await customer.save();
  customerToken = generateTokens(customer).accessToken;

  // 2. Seed Seller
  const sellerUser = new User({
    fullName: 'Vikram Joshi',
    email: 'seller@apexbazaar.com',
    phoneNumber: '+919888800001',
    role: 'SELLER',
    isPhoneVerified: true,
  });
  await sellerUser.setPassword('seller123');
  await sellerUser.save();

  const sellerProfile = await SellerProfile.create({
    userId: sellerUser._id,
    businessName: 'Apex Electronics Direct',
    businessEmail: 'seller@apexbazaar.com',
    businessPhone: '+919888800001',
    storeSlug: 'apex-electronics',
    commissionPercent: 8.5,
    isApproved: true,
  });
  testSellerProfileId = sellerProfile._id.toString();
  sellerUser.sellerProfileId = sellerProfile._id;
  await sellerUser.save();
  sellerToken = generateTokens(sellerUser).accessToken;

  // 3. Seed Admin
  const admin = new User({
    fullName: 'Super Admin',
    email: 'admin@apexbazaar.com',
    phoneNumber: '+919999900001',
    role: 'ADMIN',
    isPhoneVerified: true,
  });
  await admin.setPassword('admin123');
  await admin.save();
  adminToken = generateTokens(admin).accessToken;

  // 4. Seed Delivery Partner
  const deliveryUser = new User({
    fullName: 'Amit Kumar',
    email: 'delivery@apexbazaar.com',
    phoneNumber: '+919999900002',
    role: 'DELIVERY_PARTNER',
    isPhoneVerified: true,
  });
  await deliveryUser.setPassword('delivery123');
  await deliveryUser.save();
  deliveryToken = generateTokens(deliveryUser).accessToken;

  // 5. Seed Category
  await Category.create({
    name: 'Electronics',
    slug: 'electronics',
    description: 'Noise Cancelling Headphones & Audio',
    icon: 'Headphones',
    commissionPercent: 8.5,
  });

  // 6. Seed Product
  const product = await Product.create({
    sellerId: sellerProfile._id,
    title: 'Sony WH-1000XM5 Wireless Headphones',
    slug: 'sony-wh-1000xm5-wireless-headphones',
    description: 'Industry-leading noise canceling headphones.',
    brand: 'Sony',
    hsnCode: '85183000',
    price: 26990,
    originalPrice: 34990,
    category: 'Electronics',
    imageLight: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
    stock: 25,
    rating: 4.8,
  });
  testProductId = product._id.toString();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('1. Platform Health Check', () => {
  it('GET /health returns 200 with ApexBazaar platform status', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.store).toContain('ApexBazaar');
    expect(res.body.rolesSupported).toContain('SELLER');
  });
});

describe('2. Multi-Method Authentication & RBAC', () => {
  it('POST /api/v1/auth/phone/otp-request sends OTP', async () => {
    const res = await request(app)
      .post('/api/v1/auth/phone/otp-request')
      .send({ phoneNumber: '+919876543210' });
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.expiresInSeconds).toBe(300);
  });

  it('POST /api/v1/auth/phone/otp-verify authenticates user and mints tokens', async () => {
    const res = await request(app)
      .post('/api/v1/auth/phone/otp-verify')
      .send({ phoneNumber: '+919876543210', otp: '582914' });
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.role).toEqual('CUSTOMER');
  });

  it('POST /api/v1/auth/login authenticates via password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'rohan@apexbazaar.com', password: 'password123' });
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('GET /api/v1/auth/me returns current user profile with role', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.user.fullName).toEqual('Rohan Sharma');
    expect(res.body.data.user.role).toEqual('CUSTOMER');
  });
});

describe('3. Dynamic Catalog, Search & Facets', () => {
  it('GET /api/v1/categories returns category tree', async () => {
    const res = await request(app).get('/api/v1/categories');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('GET /api/v1/products returns published products with seller details', async () => {
    const res = await request(app).get('/api/v1/products');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0].sellerId).toBeDefined();
  });

  it('GET /api/v1/search executes faceted query with facets', async () => {
    const res = await request(app).get('/api/v1/search?q=sony&minPrice=10000');
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.hits).toBeDefined();
    expect(res.body.data.facets.brand['Sony']).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/v1/search/autocomplete returns query suggestions', async () => {
    const res = await request(app).get('/api/v1/search/autocomplete?q=son');
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.suggestions.length).toBeGreaterThanOrEqual(1);
  });
});

describe('4. Multi-Vendor Cart Operations', () => {
  it('POST /api/v1/cart/items adds item and groups by vendor', async () => {
    const res = await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ productId: testProductId, quantity: 1 });

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.itemsBySeller).toBeDefined();
    expect(res.body.data.itemsBySeller.length).toBe(1);
    expect(res.body.data.summary.grandTotal).toBe(26990);
  });

  it('GET /api/v1/cart retrieves customer cart with multi-seller partition', async () => {
    const res = await request(app)
      .get('/api/v1/cart')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.itemsBySeller.length).toBe(1);
    expect(res.body.data.itemsBySeller[0].businessName).toBe('Apex Electronics Direct');
  });
});

describe('5. Multi-Seller Split Checkout & Payment Escrow', () => {
  it('POST /api/v1/orders/checkout-summary calculates tax and seller splits', async () => {
    const res = await request(app)
      .post('/api/v1/orders/checkout-summary')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        shippingAddress: { state: 'Karnataka' },
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.subOrdersPreview.length).toBe(1);
    expect(res.body.data.subOrdersPreview[0].taxType).toBe('CGST_SGST'); // Intrastate
    expect(res.body.data.subOrdersPreview[0].commissionAmount).toBeGreaterThan(0);
  });

  it('POST /api/v1/orders/confirm creates Master Order and Vendor Sub-Orders with escrow HELD', async () => {
    const res = await request(app)
      .post('/api/v1/orders/confirm')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        paymentMethod: 'Razorpay',
        gatewayOrderId: 'order_rzp_test_123',
        gatewayPaymentId: 'pay_test_456',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.data.orderId).toMatch(/^APX-/);
    expect(res.body.data.subOrders.length).toBe(1);

    const subOrder = res.body.data.subOrders[0];
    expect(subOrder.escrowStatus).toBe('HELD');
    expect(subOrder.sellerBusinessName).toBe('Apex Electronics Direct');
    createdSubOrderId = subOrder._id.toString();
  });
});

describe('6. Seller Operations & Fulfillment', () => {
  it('GET /api/v1/seller/orders retrieves seller segregated sub-orders', async () => {
    const res = await request(app)
      .get('/api/v1/seller/orders')
      .set('Authorization', `Bearer ${sellerToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0].escrowStatus).toBe('HELD');
  });

  it('POST /api/v1/seller/orders/:id/generate-label generates AWB and shipping label', async () => {
    const res = await request(app)
      .post(`/api/v1/seller/orders/${createdSubOrderId}/generate-label`)
      .set('Authorization', `Bearer ${sellerToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.trackingNumber).toMatch(/^AWB-DEL-/);
    expect(res.body.data.status).toBe('READY_FOR_PICKUP');
  });

  it('GET /api/v1/seller/ledger retrieves unsettled escrow balance', async () => {
    const res = await request(app)
      .get('/api/v1/seller/ledger')
      .set('Authorization', `Bearer ${sellerToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.unsettledEscrowBalance).toBeGreaterThan(0);
  });
});

describe('7. Delivery Partner Run-Sheet & Doorstep OTP Sign-Off', () => {
  it('GET /api/v1/delivery/manifest returns assigned courier run-sheet', async () => {
    const res = await request(app)
      .get('/api/v1/delivery/manifest')
      .set('Authorization', `Bearer ${deliveryToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.packages.length).toBeGreaterThanOrEqual(1);
  });

  it('POST /api/v1/delivery/shipments/:id/verify-otp-delivery verifies OTP and sets DELIVERED', async () => {
    const res = await request(app)
      .post(`/api/v1/delivery/shipments/${createdSubOrderId}/verify-otp-delivery`)
      .set('Authorization', `Bearer ${deliveryToken}`)
      .send({ deliveryOtp: '4912' });

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.status).toBe('DELIVERED');
    expect(res.body.data.escrowReleaseDate).toBeDefined();
  });
});

describe('8. AI Shopping Assistant (BazaarGuide)', () => {
  it('POST /api/v1/chat recommends verified products', async () => {
    const res = await request(app)
      .post('/api/v1/chat')
      .send({ message: 'Can you recommend headphones?' });

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.reply).toBeDefined();
    expect(res.body.data.products.length).toBeGreaterThanOrEqual(1);
  });
});

describe('9. Firebase & Supabase Hybrid Integration', () => {
  it('POST /api/v1/auth/firebase-login authenticates and links user with custom claims', async () => {
    const res = await request(app)
      .post('/api/v1/auth/firebase-login')
      .send({
        idToken: 'mock-token-fb-user-9988',
        targetRole: 'CUSTOMER',
        fullName: 'Priya Patel',
        phoneNumber: '+919876509988',
        email: 'priya@apexbazaar.com',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.firebaseUid).toBe('fb-user-9988');
    expect(res.body.data.user.fullName).toBe('Priya Patel');
    expect(res.body.data.user.role).toBe('CUSTOMER');
  });

  it('POST /api/v1/auth/firebase-login provisions SELLER with draft profile', async () => {
    const res = await request(app)
      .post('/api/v1/auth/firebase-login')
      .send({
        idToken: 'mock-token-fb-seller-7744',
        targetRole: 'SELLER',
        fullName: 'Karan Mehra',
        phoneNumber: '+919876507744',
        email: 'karan@apexbazaar.com',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe('SELLER');
    expect(res.body.data.user.sellerProfileId).toBeDefined();
  });
});
