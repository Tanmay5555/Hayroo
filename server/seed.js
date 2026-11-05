import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from './config/db.js';
import User from './models/User.js';
import SellerProfile from './models/SellerProfile.js';
import SellerKYC from './models/SellerKYC.js';
import Product from './models/Product.js';
import Category from './models/Category.js';
import Coupon from './models/Coupon.js';

const initialCategories = [
  { name: 'Computers', slug: 'computers', description: 'Laptops, All-in-One Desktops, and Workstations', icon: 'Laptop', commissionPercent: 8.0, featured: true },
  { name: 'Phone & Tablets', slug: 'phone-tablets', description: 'Flagship Smartphones and High-Res Tablets', icon: 'Smartphone', commissionPercent: 8.0, featured: true },
  { name: 'Electronics', slug: 'electronics', description: 'Noise Cancelling Headphones, Earbuds, Smartwatches and Wearables', icon: 'Headphones', commissionPercent: 10.0, featured: true },
  { name: 'TV & Home Entertainment', slug: 'tv-entertainment', description: '4K OLED Smart TVs, Projectors, and Dolby Atmos Soundbars', icon: 'Tv', commissionPercent: 8.0, featured: true },
  { name: 'Gaming', slug: 'gaming', description: 'Consoles, Mechanical Keyboards, Wireless Mice, and VR Headsets', icon: 'Gamepad2', commissionPercent: 10.0, featured: true },
  { name: 'Fashion & Apparel', slug: 'fashion', description: 'Apparel, Designer Footwear, Jackets, and Accessories', icon: 'Shirt', commissionPercent: 15.0, featured: true },
  { name: 'Toys & Games', slug: 'toys', description: 'Educational Kits, Building Blocks, and Collectible Figures', icon: 'Gift', commissionPercent: 12.0, featured: true },
  { name: 'Sports & Fitness', slug: 'sports', description: 'Adjustable Dumbbells, Yoga Mats, and Cardio Equipment', icon: 'Dumbbell', commissionPercent: 10.0, featured: true },
  { name: 'Grocery & Gourmet Foods', slug: 'grocery', description: 'Organic Foods, Superfoods, Gourmet Coffee, and Artisanal Tea', icon: 'Apple', commissionPercent: 6.0, featured: true },
  { name: 'Health & Wellness', slug: 'health', description: 'Smart Blood Pressure Monitors, Massagers, and Air Purifiers', icon: 'HeartPulse', commissionPercent: 10.0, featured: true },
  { name: 'Automotive', slug: 'auto', description: 'Smart 4K Dash Cams, Tire Inflators, and Car Care Accessories', icon: 'Car', commissionPercent: 10.0, featured: false },
  { name: 'Books', slug: 'books', description: 'Bestselling Fiction, Business, Productivity, and Biographies', icon: 'BookOpen', commissionPercent: 8.0, featured: true },
  { name: 'Home & Kitchen', slug: 'home', description: 'Smart Vacuums, Espresso Machines, and Cookware Sets', icon: 'Home', commissionPercent: 12.0, featured: true },
  { name: 'Photo & Video', slug: 'photography', description: 'Mirrorless Cameras, Lenses, Gimbals, and Studio Lighting', icon: 'Camera', commissionPercent: 8.0, featured: false },
  { name: 'Collectibles', slug: 'collectibles', description: 'Limited Edition Figures, Memorabilia, and Rare Die-Cast Models', icon: 'Award', commissionPercent: 15.0, featured: false },
  { name: 'Beauty & Personal Care', slug: 'beauty', description: 'Anti-Aging Serums, Skin Therapy, and Premium Fragrances', icon: 'Sparkles', commissionPercent: 15.0, featured: true },
  { name: 'Furniture', slug: 'furniture', description: 'Ergonomic Standing Desks, Mesh Chairs, and Living Room Lounges', icon: 'Armchair', commissionPercent: 12.0, featured: false },
];

export const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('🔄 Cleaning old collections for clean multi-vendor initialization...');

    await Promise.all([
      User.deleteMany({}),
      SellerProfile.deleteMany({}),
      SellerKYC.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Coupon.deleteMany({}),
    ]);

    console.log('🌱 1. Seeding 5 Ecosystem Roles (Admin, Support, Delivery, Sellers, Customer)...');

    // 1. Super Admin
    const adminUser = new User({
      fullName: 'Rajesh Verma (Super Admin)',
      email: 'admin@apexbazaar.com',
      phoneNumber: '+919999900001',
      role: 'ADMIN',
      isPhoneVerified: true,
      isEmailVerified: true,
    });
    await adminUser.setPassword('admin123');
    await adminUser.save();

    // 2. Support Staff
    const supportUser = new User({
      fullName: 'Kavita Nair (Support Desk)',
      email: 'support@apexbazaar.com',
      phoneNumber: '+919999900002',
      role: 'SUPPORT_STAFF',
      isPhoneVerified: true,
    });
    await supportUser.setPassword('support123');
    await supportUser.save();

    // 3. Delivery Partner
    const deliveryUser = new User({
      fullName: 'Amit Kumar (Delivery Agent)',
      email: 'delivery@apexbazaar.com',
      phoneNumber: '+919999900003',
      role: 'DELIVERY_PARTNER',
      isPhoneVerified: true,
    });
    await deliveryUser.setPassword('delivery123');
    await deliveryUser.save();

    // 4. Shopper Customer
    const customerUser = new User({
      fullName: 'Rohan Sharma',
      email: 'rohan@gmail.com',
      phoneNumber: '+919876543210',
      role: 'CUSTOMER',
      isPhoneVerified: true,
      addresses: [
        {
          fullName: 'Rohan Sharma',
          phoneNumber: '+919876543210',
          addressLine1: 'Flat 402, Green Acres Apt, 100 Feet Road',
          city: 'Bangalore',
          state: 'Karnataka',
          postalCode: '560038',
          country: 'India',
          isDefault: true,
        },
      ],
    });
    await customerUser.setPassword('password123');
    await customerUser.save();

    // 5. Create 3 Verified Sellers
    const sellerUserA = new User({
      fullName: 'Vikram Joshi (Apex Tech Direct)',
      email: 'seller.tech@apexbazaar.com',
      phoneNumber: '+919888800001',
      role: 'SELLER',
      isPhoneVerified: true,
    });
    await sellerUserA.setPassword('seller123');
    await sellerUserA.save();

    const sellerProfileA = await SellerProfile.create({
      userId: sellerUserA._id,
      businessName: 'Apex Electronics Direct',
      businessEmail: 'seller.tech@apexbazaar.com',
      businessPhone: '+919888800001',
      storeSlug: 'apex-electronics',
      storeDescription: 'Premier authorized distributor for premium computing, audio, and personal electronics.',
      commissionPercent: 8.5,
      ratingAverage: 4.9,
      ratingCount: 1420,
      isApproved: true,
      currentBalance: 145000,
      unsettledEscrowBalance: 28400,
    });
    sellerUserA.sellerProfileId = sellerProfileA._id;
    await sellerUserA.save();

    await SellerKYC.create({
      sellerProfileId: sellerProfileA._id,
      gstinNumber: '29AABCU9603R1ZX',
      panNumber: 'AABCU9603R',
      bankAccountNumber: '981234567890',
      bankIfscCode: 'HDFC0000128',
      bankAccountName: 'Apex Electronics Direct Private Limited',
      businessAddress: { street: '100 Feet Rd, Indiranagar', city: 'Bangalore', state: 'Karnataka', postalCode: '560038' },
      status: 'APPROVED',
      verifiedAt: new Date(),
    });

    const sellerUserB = new User({
      fullName: 'Anita Desai (Jaipur Handlooms)',
      email: 'seller.fashion@apexbazaar.com',
      phoneNumber: '+919888800002',
      role: 'SELLER',
      isPhoneVerified: true,
    });
    await sellerUserB.setPassword('seller123');
    await sellerUserB.save();

    const sellerProfileB = await SellerProfile.create({
      userId: sellerUserB._id,
      businessName: 'Jaipur Silk & Handlooms',
      businessEmail: 'seller.fashion@apexbazaar.com',
      businessPhone: '+919888800002',
      storeSlug: 'jaipur-handlooms',
      storeDescription: 'Authentic handcrafted artisanal apparel, pure mulberry silk, and heritage textile craft.',
      commissionPercent: 12.0,
      ratingAverage: 4.8,
      ratingCount: 890,
      isApproved: true,
      currentBalance: 82000,
      unsettledEscrowBalance: 12500,
    });
    sellerUserB.sellerProfileId = sellerProfileB._id;
    await sellerUserB.save();

    console.log('🌱 2. Seeding 17 Retail Categories with dynamic schemas...');
    const createdCategories = {};
    for (const cat of initialCategories) {
      const created = await Category.create({
        ...cat,
        attributeSchema: {
          category: cat.name,
          supportedAttributes: ['Brand', 'Model', 'Color', 'Warranty'],
        },
      });
      createdCategories[cat.slug] = created;
    }

    console.log('🌱 3. Seeding Flagship Products with Variants and Multi-Seller Links...');
    const productsData = [
      // Computers (Seller A)
      {
        sellerId: sellerProfileA._id,
        categoryId: createdCategories['computers']?._id,
        category: 'Computers',
        title: 'Apple iMac 27" Retina 5K, M3 Chip 16GB/1TB',
        slug: 'apple-imac-27-m3-16gb-1tb',
        brand: 'Apple',
        hsnCode: '84713010',
        description: 'The iconic 27-inch All-in-One desktop packed with the lightning-fast Apple M3 chip, 5K Retina Display with 1 billion colors, and immersive 6-speaker spatial audio.',
        price: 169900,
        originalPrice: 199900,
        discountTag: 'Save 15%',
        imageLight: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80',
        images: ['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80'],
        stock: 25,
        rating: 4.9,
        reviewsCount: 342,
        isFeatured: true,
        highlights: ['5K Retina Display', 'Apple M3 10-Core GPU', 'Studio-Grade Mics', 'Magic Keyboard & Mouse'],
        specifications: [
          { name: 'Display', value: '27-inch 5K Retina (5120 x 2880)' },
          { name: 'Processor', value: 'Apple M3 8-Core CPU' },
          { name: 'Unified Memory', value: '16GB' },
          { name: 'Storage', value: '1TB Ultra-Fast SSD' },
        ],
        variants: [
          { sku: 'IMAC-M3-SIL-1TB', title: 'Silver / 1TB', price: 169900, mrp: 199900, stock: 15, attributes: { color: 'Silver', storage: '1TB' } },
          { sku: 'IMAC-M3-BLU-1TB', title: 'Blue / 1TB', price: 169900, mrp: 199900, stock: 10, attributes: { color: 'Blue', storage: '1TB' } },
        ],
      },
      {
        sellerId: sellerProfileA._id,
        categoryId: createdCategories['computers']?._id,
        category: 'Computers',
        title: 'MacBook Pro 16" M3 Max 36GB/1TB Silver',
        slug: 'macbook-pro-16-m3-max-36gb-1tb',
        brand: 'Apple',
        hsnCode: '84713010',
        description: 'The ultimate professional power station. Features Liquid Retina XDR display, up to 22 hours of battery life, and peak rendering performance.',
        price: 249900,
        originalPrice: 279900,
        discountTag: 'Top Rated',
        imageLight: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80',
        images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80'],
        stock: 18,
        rating: 5.0,
        reviewsCount: 890,
        isFeatured: true,
        highlights: ['Liquid Retina XDR', 'M3 Max 16-Core CPU', 'Thunderbolt 4 Ports', 'MagSafe 3'],
        specifications: [
          { name: 'Display', value: '16.2-inch Liquid Retina XDR' },
          { name: 'Memory', value: '36GB Unified Memory' },
          { name: 'Battery', value: 'Up to 22 hours' },
        ],
      },
      // Electronics / Audio (Seller A)
      {
        sellerId: sellerProfileA._id,
        categoryId: createdCategories['electronics']?._id,
        category: 'Electronics',
        title: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
        slug: 'sony-wh-1000xm5-wireless-headphones',
        brand: 'Sony',
        hsnCode: '85183000',
        description: 'Industry-leading noise canceling with two processors and eight microphones for unprecedented sound clarity and crystal clear hands-free calling.',
        price: 26990,
        originalPrice: 34990,
        discountTag: '23% OFF',
        imageLight: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'],
        stock: 45,
        rating: 4.8,
        reviewsCount: 2410,
        isFeatured: true,
        isFlashSale: true,
        highlights: ['Industry-Leading ANC', '30-Hour Battery Life', 'Multipoint Connection', 'Speak-to-Chat'],
        specifications: [
          { name: 'Battery Life', value: '30 hours (ANC ON)' },
          { name: 'Bluetooth', value: 'Version 5.2 (LDAC / AAC)' },
          { name: 'Weight', value: '250g' },
        ],
        variants: [
          { sku: 'SONY-XM5-BLK', title: 'Black', price: 26990, mrp: 34990, stock: 25, attributes: { color: 'Black' } },
          { sku: 'SONY-XM5-SLV', title: 'Silver', price: 26990, mrp: 34990, stock: 20, attributes: { color: 'Silver' } },
        ],
      },
      // Phone & Tablets (Seller A)
      {
        sellerId: sellerProfileA._id,
        categoryId: createdCategories['phone-tablets']?._id,
        category: 'Phone & Tablets',
        title: 'Apple iPhone 15 Pro Max 256GB Natural Titanium',
        slug: 'apple-iphone-15-pro-max-256gb',
        brand: 'Apple',
        hsnCode: '85171300',
        description: 'Forged in titanium and featuring the groundbreaking A17 Pro chip, a customizable Action button, and the most powerful iPhone camera system ever.',
        price: 148900,
        originalPrice: 159900,
        discountTag: 'Flagship',
        imageLight: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=80',
        images: ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=80'],
        stock: 30,
        rating: 4.9,
        reviewsCount: 1820,
        isFeatured: true,
        highlights: ['Aerospace Titanium Design', 'A17 Pro Chip', '48MP Main Camera with 5x Telephoto', 'USB-C with USB 3'],
      },
      // Fashion & Apparel (Seller B)
      {
        sellerId: sellerProfileB._id,
        categoryId: createdCategories['fashion']?._id,
        category: 'Fashion & Apparel',
        title: 'Classic Vintage Distressed Denim Jacket',
        slug: 'classic-vintage-distressed-denim-jacket',
        brand: 'UrbanCraft',
        hsnCode: '62014010',
        description: 'Hand-tailored vintage denim jacket crafted from 100% heavyweight ring-spun organic cotton with reinforced stitching and aged brass hardware.',
        price: 3499,
        originalPrice: 4999,
        discountTag: '30% OFF',
        imageLight: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80',
        images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80'],
        stock: 60,
        rating: 4.7,
        reviewsCount: 420,
        isFeatured: true,
        highlights: ['100% Ring-Spun Cotton', 'Aged Brass Hardware', 'Dual Chest Pockets', 'Regular Fit'],
        variants: [
          { sku: 'DNM-JKT-M', title: 'Medium', price: 3499, mrp: 4999, stock: 20, attributes: { size: 'M' } },
          { sku: 'DNM-JKT-L', title: 'Large', price: 3499, mrp: 4999, stock: 25, attributes: { size: 'L' } },
          { sku: 'DNM-JKT-XL', title: 'XL', price: 3499, mrp: 4999, stock: 15, attributes: { size: 'XL' } },
        ],
      },
      {
        sellerId: sellerProfileB._id,
        categoryId: createdCategories['fashion']?._id,
        category: 'Fashion & Apparel',
        title: 'Artisan Heritage Pure Mulberry Silk Scarf',
        slug: 'artisan-heritage-mulberry-silk-scarf',
        brand: 'Jaipur Weaves',
        hsnCode: '62141010',
        description: 'Luxurious hand-woven pure silk scarf dyed with natural indigo and hand-blocked with traditional royal palace motifs.',
        price: 2199,
        originalPrice: 3299,
        discountTag: 'Artisanal Handcraft',
        imageLight: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&q=80',
        images: ['https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&q=80'],
        stock: 40,
        rating: 4.9,
        reviewsCount: 156,
        isFeatured: true,
        highlights: ['100% Pure Mulberry Silk', 'Natural Botanical Dyes', 'Hand-Rolled Edges', 'Dimensions: 180cm x 70cm'],
      },
      // Grocery & Gourmet Foods
      {
        sellerId: sellerProfileB._id,
        categoryId: createdCategories['grocery']?._id,
        category: 'Grocery & Gourmet Foods',
        title: 'Single-Origin Araku Valley Organic Whole Coffee Beans 500g',
        slug: 'araku-valley-organic-coffee-beans-500g',
        brand: 'NatureFresh Organics',
        hsnCode: '09012190',
        description: 'Shade-grown, handpicked Arabica beans roasted in small batches to preserve tasting notes of dark chocolate, caramel, and citrus zest.',
        price: 799,
        originalPrice: 999,
        discountTag: 'Organic Certified',
        imageLight: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=80',
        images: ['https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=80'],
        stock: 100,
        rating: 4.8,
        reviewsCount: 520,
        isFeatured: true,
        highlights: ['100% Organic Arabica', 'Medium Roast', 'Direct Fair-Trade', 'Resealable Valve Bag'],
      },
      // Books
      {
        sellerId: sellerProfileA._id,
        categoryId: createdCategories['books']?._id,
        category: 'Books',
        title: 'Atomic Habits by James Clear (Hardcover Collector Edition)',
        slug: 'atomic-habits-hardcover-james-clear',
        brand: 'Penguin Random House',
        hsnCode: '49019900',
        description: 'The definitive #1 New York Times bestseller on personal transformation, proven frameworks, and tiny daily changes that yield remarkable results.',
        price: 699,
        originalPrice: 999,
        discountTag: '30% OFF',
        imageLight: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80',
        images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80'],
        stock: 120,
        rating: 4.9,
        reviewsCount: 4890,
        isFeatured: true,
        highlights: ['Collector Gold Foil Hardcover', 'Ribbon Bookmark', 'Includes 3 Goal Planners'],
      },
    ];

    for (const prod of productsData) {
      await Product.create(prod);
    }

    console.log('🌱 4. Seeding Promotional Coupons...');
    await Coupon.create([
      {
        code: 'APEX10',
        discountPercent: 10,
        minOrderAmount: 999,
        maxDiscountAmount: 1000,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
      {
        code: 'APEXFEST',
        discountPercent: 15,
        minOrderAmount: 3000,
        maxDiscountAmount: 1500,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
    ]);

    console.log('✅ Database seeded successfully with 5 Roles, 17 Categories, 2 Verified Sellers, and Products!');
    return true;
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
};

// Auto-run if executed directly via `node server/seed.js`
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
