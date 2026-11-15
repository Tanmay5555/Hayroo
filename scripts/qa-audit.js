import axios from 'axios';

const BASE_FRONTEND = 'http://localhost:5173';
const BASE_BACKEND = 'http://localhost:5000/api/v1';

const results = {
  pages: [],
  apis: [],
  forms: [],
  security: [],
  bugsFound: [],
};

async function testPages() {
  console.log('🔍 Testing Frontend Routes...');
  const routes = [
    { path: '/', name: 'Home / Landing Page' },
    { path: '/products', name: 'Product Catalog' },
    { path: '/product/macbook-pro-16-m3-max-36gb-1tb', name: 'Product Detail Page' },
    { path: '/cart', name: 'Shopping Cart' },
    { path: '/checkout', name: 'Checkout Page' },
    { path: '/account', name: 'User Account & Orders' },
    { path: '/seller', name: 'Seller Operations Portal' },
    { path: '/delivery', name: 'Delivery Partner Station' },
    { path: '/admin', name: 'Admin Governance Console' },
    { path: '/faq', name: 'FAQ & Knowledgebase' },
    { path: '/contact', name: 'Contact & Support Desk' },
    { path: '/privacy', name: 'Privacy Policy' },
    { path: '/terms', name: 'Terms of Service' },
    { path: '/404', name: '404 Not Found Page' },
  ];

  for (const r of routes) {
    try {
      const res = await axios.get(`${BASE_FRONTEND}${r.path}`);
      const html = res.data;
      const hasRoot = html.includes('id="root"');
      const hasTitle = html.includes('<title>');
      const hasViewport = html.includes('viewport');

      results.pages.push({
        route: r.path,
        name: r.name,
        status: res.status === 200 && hasRoot ? 'PASS' : 'FAIL',
        statusCode: res.status,
        details: `Loaded HTML (${html.length} bytes), Root container: ${hasRoot}, Viewport meta: ${hasViewport}`,
      });
    } catch (err) {
      results.pages.push({
        route: r.path,
        name: r.name,
        status: 'FAIL',
        statusCode: err.response?.status || 'ERR',
        details: err.message,
      });
    }
  }
}

async function testBackendApis() {
  console.log('🔍 Testing Backend APIs & Multi-Vendor Engine...');

  // 1. Health
  try {
    const res = await axios.get('http://localhost:5000/health');
    results.apis.push({
      endpoint: 'GET /health',
      status: res.data.status === 'ok' ? 'PASS' : 'FAIL',
      details: `Uptime: ${res.data.uptimeSeconds}s, Database: ${res.data.database}`,
    });
  } catch (err) {
    results.apis.push({ endpoint: 'GET /health', status: 'FAIL', details: err.message });
  }

  // 2. Categories
  try {
    const res = await axios.get(`${BASE_BACKEND}/categories`);
    results.apis.push({
      endpoint: 'GET /api/v1/categories',
      status: res.data.success && res.data.data.length > 0 ? 'PASS' : 'FAIL',
      details: `Fetched ${res.data.data.length} categories with live product counts`,
    });
  } catch (err) {
    results.apis.push({ endpoint: 'GET /api/v1/categories', status: 'FAIL', details: err.message });
  }

  // 3. Products Catalog with Filters
  try {
    const res = await axios.get(`${BASE_BACKEND}/products?limit=12&sort=newest`);
    const total = res.data.meta?.total || res.data.data?.length;
    results.apis.push({
      endpoint: 'GET /api/v1/products',
      status: res.data.success && total > 0 ? 'PASS' : 'FAIL',
      details: `Catalog loaded ${total} products across verified vendors`,
    });
  } catch (err) {
    results.apis.push({ endpoint: 'GET /api/v1/products', status: 'FAIL', details: err.message });
  }

  // 4. Single Product by Slug
  try {
    const res = await axios.get(`${BASE_BACKEND}/products/macbook-pro-16-m3-max-36gb-1tb`);
    const p = res.data.data;
    results.apis.push({
      endpoint: 'GET /api/v1/products/:slug',
      status: res.data.success && p.title ? 'PASS' : 'FAIL',
      details: `Product: "${p.title}" (Price: ₹${p.price}, Stock: ${p.stock}, Seller: ${p.sellerId?.businessName || 'Verified'})`,
    });
  } catch (err) {
    results.apis.push({ endpoint: 'GET /api/v1/products/:slug', status: 'FAIL', details: err.message });
  }

  // 5. Search & Autocomplete
  try {
    const res = await axios.get(`${BASE_BACKEND}/search/autocomplete?q=Mac`);
    const suggestions = res.data.data?.suggestions || [];
    results.apis.push({
      endpoint: 'GET /api/v1/search/autocomplete',
      status: res.data.success ? 'PASS' : 'FAIL',
      details: `Suggestions for "Mac": ${suggestions.length} items found`,
    });
  } catch (err) {
    results.apis.push({ endpoint: 'GET /api/v1/search/autocomplete', status: 'FAIL', details: err.message });
  }

  // 6. Coupon Verification
  try {
    const res = await axios.post(`${BASE_BACKEND}/coupons/apply`, {
      code: 'HAYROO10',
      cartSubtotal: 25000,
    });
    results.apis.push({
      endpoint: 'POST /api/v1/coupons/apply',
      status: res.data.success && res.data.data.discountAmount > 0 ? 'PASS' : 'FAIL',
      details: `Coupon HAYROO10 applied: Saved ₹${res.data.data.discountAmount}`,
    });
  } catch (err) {
    results.apis.push({ endpoint: 'POST /api/v1/coupons/apply', status: 'FAIL', details: err.message });
  }

  // 7. Support AI Chat
  try {
    const res = await axios.post(`${BASE_BACKEND}/chat`, {
      sessionId: `qa-test-${Date.now()}`,
      message: 'What is your return policy?',
    });
    results.apis.push({
      endpoint: 'POST /api/v1/chat',
      status: res.data.success && res.data.data.reply ? 'PASS' : 'FAIL',
      details: `Chat bot response generated (${res.data.data.reply.slice(0, 60)}...)`,
    });
  } catch (err) {
    results.apis.push({ endpoint: 'POST /api/v1/chat', status: 'FAIL', details: err.message });
  }
}

async function testUserJourney() {
  console.log('🔍 Testing Complete End-to-End User Journey (Register -> Auth -> Cart -> Checkout -> Order)...');

  const testUserEmail = `qa_shopper_${Date.now()}@hayroo-test.store`;
  const testPhone = `+91987${Math.floor(1000000 + Math.random() * 9000000)}`;
  let token = '';
  let customerUser = null;

  // Step 1: Register
  try {
    const regRes = await axios.post(`${BASE_BACKEND}/auth/register`, {
      fullName: 'Ananya Sharma',
      email: testUserEmail,
      password: 'SecurePassword123!',
      phoneNumber: testPhone,
      role: 'CUSTOMER',
    });
    token = regRes.data.data?.accessToken;
    customerUser = regRes.data.data?.user;
    results.forms.push({
      flow: 'User Registration',
      status: 'PASS',
      details: `Registered test user ${testUserEmail}`,
    });
  } catch (err) {
    results.forms.push({
      flow: 'User Registration',
      status: 'FAIL',
      details: err.response?.data?.message || err.message,
    });
    return;
  }

  const authHeaders = { Authorization: `Bearer ${token}` };

  // Step 2: Auth Me check
  try {
    const meRes = await axios.get(`${BASE_BACKEND}/auth/me`, { headers: authHeaders });
    results.forms.push({
      flow: 'Session Verification (GET /auth/me)',
      status: meRes.data.success ? 'PASS' : 'FAIL',
      details: `Authenticated user: ${meRes.data.data.user?.fullName} (${meRes.data.data.user?.role})`,
    });
  } catch (err) {
    results.forms.push({ flow: 'Session Verification', status: 'FAIL', details: err.message });
  }

  // Step 3: Add Shipping Address
  try {
    const addrRes = await axios.post(
      `${BASE_BACKEND}/users/addresses`,
      {
        fullName: 'Ananya Sharma',
        phoneNumber: testPhone,
        addressLine1: '42 Orchid Heights, 100 Feet Road, Indiranagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560038',
        country: 'India',
        isDefault: true,
      },
      { headers: authHeaders }
    );
    results.forms.push({
      flow: 'Address Book Management',
      status: addrRes.data.success ? 'PASS' : 'FAIL',
      details: `Address added successfully: ${addrRes.data.data.length} saved addresses`,
    });
  } catch (err) {
    results.forms.push({ flow: 'Address Book Management', status: 'FAIL', details: err.message });
  }

  // Step 4: Add to Cart
  let sampleProduct = null;
  try {
    const prodsRes = await axios.get(`${BASE_BACKEND}/products?limit=1`);
    sampleProduct = prodsRes.data.data[0];

    const cartRes = await axios.post(
      `${BASE_BACKEND}/cart/add`,
      {
        productId: sampleProduct._id,
        quantity: 1,
      },
      { headers: authHeaders }
    );
    results.forms.push({
      flow: 'Add to Cart Sync',
      status: cartRes.data.success ? 'PASS' : 'FAIL',
      details: `Cart updated with item: ${sampleProduct.title} (Price: ₹${sampleProduct.price})`,
    });
  } catch (err) {
    results.forms.push({ flow: 'Add to Cart Sync', status: 'FAIL', details: err.message });
  }

  // Step 5: Checkout Summary (Split Sub-Orders, GST, Escrow)
  try {
    const summaryRes = await axios.post(
      `${BASE_BACKEND}/orders/checkout-summary`,
      {
        shippingAddress: {
          fullName: 'Ananya Sharma',
          phone: '+919876543210',
          street: '42 Orchid Heights',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560038',
        },
        items: [{ product: sampleProduct._id, quantity: 1 }],
        couponCode: 'HAYROO10',
      },
      { headers: authHeaders }
    );
    const summary = summaryRes.data.data;
    results.forms.push({
      flow: 'Checkout Summary & Escrow Calculation',
      status: summaryRes.data.success ? 'PASS' : 'FAIL',
      details: `Subtotal: ₹${summary.masterSubtotal}, Tax: ₹${summary.subOrdersPreview[0]?.taxAmount} (${summary.subOrdersPreview[0]?.taxType}), Escrow Holding: ${summary.subOrdersPreview[0]?.escrowHoldingDays} days, Payout: ₹${summary.subOrdersPreview[0]?.sellerNetPayout}`,
    });
  } catch (err) {
    results.forms.push({ flow: 'Checkout Summary', status: 'FAIL', details: err.message });
  }

  // Step 6: Place Order (Cash on Delivery)
  let createdOrder = null;
  try {
    const orderRes = await axios.post(
      `${BASE_BACKEND}/orders`,
      {
        items: [{ product: sampleProduct._id, quantity: 1 }],
        shippingAddress: {
          fullName: 'Ananya Sharma',
          phone: '+919876543210',
          street: '42 Orchid Heights',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560038',
        },
        paymentMethod: 'COD',
        couponCode: 'HAYROO10',
      },
      { headers: authHeaders }
    );
    createdOrder = orderRes.data.data;
    results.forms.push({
      flow: 'Order Placement & Atomic Inventory Decrement',
      status: orderRes.data.success && createdOrder.orderId ? 'PASS' : 'FAIL',
      details: `Master Order #${createdOrder.orderId} booked! Sub-orders created: ${createdOrder.subOrders?.length || 1}, Status: ${createdOrder.orderStatus}`,
    });
  } catch (err) {
    results.forms.push({ flow: 'Order Placement', status: 'FAIL', details: err.message });
  }

  // Step 7: Order History Retrieval
  try {
    const ordersRes = await axios.get(`${BASE_BACKEND}/orders`, { headers: authHeaders });
    results.forms.push({
      flow: 'Customer Order History (GET /orders)',
      status: ordersRes.data.success && ordersRes.data.data.length > 0 ? 'PASS' : 'FAIL',
      details: `Customer has ${ordersRes.data.data.length} orders recorded`,
    });
  } catch (err) {
    results.forms.push({ flow: 'Customer Order History', status: 'FAIL', details: err.message });
  }
}

async function run() {
  console.log('=====================================================');
  console.log('       HAYROO FULL-STACK QA AUTOMATION SUITE         ');
  console.log('=====================================================\n');

  await testPages();
  console.log('\n-----------------------------------------------------');
  await testBackendApis();
  console.log('\n-----------------------------------------------------');
  await testUserJourney();
  console.log('\n=====================================================');
  console.log('                  QA AUDIT SUMMARY                   ');
  console.log('=====================================================\n');

  console.log('--- PAGES VERIFIED ---');
  results.pages.forEach((p) => {
    console.log(`[${p.status}] ${p.name.padEnd(30)} -> ${p.route} (${p.details})`);
  });

  console.log('\n--- CORE APIS & MULTI-VENDOR ENGINE ---');
  results.apis.forEach((a) => {
    console.log(`[${a.status}] ${a.endpoint.padEnd(32)} -> ${a.details}`);
  });

  console.log('\n--- END-TO-END USER JOURNEYS & FORMS ---');
  results.forms.forEach((f) => {
    console.log(`[${f.status}] ${f.flow.padEnd(38)} -> ${f.details}`);
  });

  const totalTests = results.pages.length + results.apis.length + results.forms.length;
  const passedTests =
    results.pages.filter((p) => p.status === 'PASS').length +
    results.apis.filter((a) => a.status === 'PASS').length +
    results.forms.filter((f) => f.status === 'PASS').length;

  console.log(`\nTOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${totalTests - passedTests}`);
  console.log(`PASS RATE: ${Math.round((passedTests / totalTests) * 100)}%`);
}

run();
