import Product from '../models/Product.js';
import Category from '../models/Category.js';
import SellerProfile from '../models/SellerProfile.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse, sendError } from '../utils/apiResponse.js';

const escapeRegex = (str) => String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// @desc    Get all products with filtering, search, sorting & pagination
// @route   GET /api/v1/products
export const getProducts = asyncHandler(async (req, res) => {
  const {
    q,
    search,
    category,
    brand,
    minPrice,
    maxPrice,
    minRating,
    inStock,
    sellerId,
    sort,
    page = 1,
    limit = 12,
  } = req.query;

  const query = { isPublished: true };
  const searchTerm = q || search;

  if (searchTerm && String(searchTerm).trim()) {
    const regex = new RegExp(escapeRegex(String(searchTerm).trim().slice(0, 100)), 'i');
    query.$or = [{ title: regex }, { description: regex }, { brand: regex }, { tags: regex }, { category: regex }];
  }

  if (category && category !== 'All' && category !== 'all') {
    query.category = { $regex: new RegExp(`^${escapeRegex(category)}$`, 'i') };
  }

  if (brand && brand !== 'All') {
    query.brand = { $regex: new RegExp(escapeRegex(brand), 'i') };
  }

  if (sellerId) {
    query.sellerId = sellerId;
  }

  if (inStock === 'true') {
    query.stock = { $gt: 0 };
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice !== undefined && !Number.isNaN(Number(minPrice))) query.price.$gte = Number(minPrice);
    if (maxPrice !== undefined && !Number.isNaN(Number(maxPrice))) query.price.$lte = Number(maxPrice);
  }

  if (minRating !== undefined && !Number.isNaN(Number(minRating))) {
    query.rating = { $gte: Number(minRating) };
  }

  let sortOption = { createdAt: -1 };
  if (sort === 'price_asc' || sort === 'price:asc') sortOption = { price: 1 };
  else if (sort === 'price_desc' || sort === 'price:desc') sortOption = { price: -1 };
  else if (sort === 'rating_desc' || sort === 'rating:desc') sortOption = { rating: -1 };
  else if (sort === 'newest') sortOption = { createdAt: -1 };

  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 12));
  const skip = (safePage - 1) * safeLimit;

  const [total, products] = await Promise.all([
    Product.countDocuments(query),
    Product.find(query)
      .populate('sellerId', 'businessName ratingAverage storeSlug isApproved')
      .sort(sortOption)
      .skip(skip)
      .limit(safeLimit),
  ]);

  return sendResponse(res, 200, 'Products fetched successfully', products, {
    total,
    page: safePage,
    pages: Math.ceil(total / safeLimit),
  });
});

// @desc    Faceted search endpoint
// @route   GET /api/v1/search
export const searchProducts = asyncHandler(async (req, res) => {
  const { q = '', category, brand, minPrice, maxPrice, page = 1, limit = 20 } = req.query;
  const startTime = Date.now();

  const query = { isPublished: true };
  if (String(q).trim()) {
    const regex = new RegExp(escapeRegex(String(q).trim().slice(0, 100)), 'i');
    query.$or = [{ title: regex }, { brand: regex }, { category: regex }, { tags: regex }, { description: regex }];
  }

  if (category && category !== 'All') {
    query.category = { $regex: new RegExp(`^${escapeRegex(category)}$`, 'i') };
  }
  if (brand) {
    query.brand = { $regex: new RegExp(escapeRegex(brand), 'i') };
  }
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice !== undefined && !Number.isNaN(Number(minPrice))) query.price.$gte = Number(minPrice);
    if (maxPrice !== undefined && !Number.isNaN(Number(maxPrice))) query.price.$lte = Number(maxPrice);
  }

  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (safePage - 1) * safeLimit;

  const [hits, totalHits, allMatching] = await Promise.all([
    Product.find(query)
      .populate('sellerId', 'businessName ratingAverage storeSlug')
      .skip(skip)
      .limit(safeLimit),
    Product.countDocuments(query),
    Product.find(query).select('brand category price rating'),
  ]);

  const brandFacets = {};
  const categoryFacets = {};
  allMatching.forEach((p) => {
    if (p.brand) brandFacets[p.brand] = (brandFacets[p.brand] || 0) + 1;
    if (p.category) categoryFacets[p.category] = (categoryFacets[p.category] || 0) + 1;
  });

  const processingTimeMs = Date.now() - startTime;

  return sendResponse(res, 200, 'Search results fetched successfully', {
    hits,
    facets: {
      brand: brandFacets,
      category: categoryFacets,
    },
    meta: {
      totalHits,
      processingTimeMs,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(totalHits / safeLimit),
    },
  });
});

// @desc    Search autocomplete suggestions
// @route   GET /api/v1/search/autocomplete
export const autocomplete = asyncHandler(async (req, res) => {
  const { q = '' } = req.query;
  const trimmed = String(q).trim().slice(0, 80);
  if (!trimmed) {
    return sendResponse(res, 200, 'Autocomplete suggestions', { suggestions: [], brands: [], categories: [] });
  }

  const regex = new RegExp(escapeRegex(trimmed), 'i');
  const [products, matchingBrands, matchingCategories] = await Promise.all([
    Product.find({ title: regex, isPublished: true }).select('title slug price imageLight category').limit(5),
    Product.distinct('brand', { brand: regex }),
    Category.find({ name: regex }).select('name slug icon').limit(4),
  ]);

  const suggestions = products.map((p) => ({
    id: p._id,
    title: p.title,
    slug: p.slug,
    price: p.price,
    imageLight: p.imageLight,
    category: p.category,
  }));

  return sendResponse(res, 200, 'Autocomplete suggestions fetched', {
    suggestions,
    brands: matchingBrands.slice(0, 5),
    categories: matchingCategories,
  });
});

// @desc    Get single product by slug or ID
// @route   GET /api/v1/products/:idOrSlug
export const getProductById = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  let product = null;

  if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
    product = await Product.findById(idOrSlug).populate('sellerId', 'businessName ratingAverage storeSlug isApproved');
  }
  if (!product) {
    product = await Product.findOne({ slug: idOrSlug }).populate(
      'sellerId',
      'businessName ratingAverage storeSlug isApproved'
    );
  }

  if (!product) {
    return sendError(res, 404, 'Product not found');
  }

  const related = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
    isPublished: true,
  })
    .limit(4)
    .select('title slug price originalPrice imageLight rating reviewsCount brand');

  return sendResponse(res, 200, 'Product fetched successfully', {
    ...product.toObject(),
    relatedProducts: related,
  });
});

// @desc    Create product (Seller / Admin)
// @route   POST /api/v1/products
export const createProduct = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    price,
    originalPrice,
    category,
    brand,
    imageLight,
    images,
    stock,
    hsnCode,
    highlights,
    specifications,
    dynamicAttributes,
    variants,
  } = req.body;

  if (!title || !description || price === undefined || !category) {
    return sendError(res, 400, 'Title, description, price, and category are required');
  }

  const numPrice = Number(price);
  const numStock = stock !== undefined ? Number(stock) : 50;
  if (!Number.isFinite(numPrice) || numPrice <= 0) {
    return sendError(res, 400, 'Product price must be greater than 0');
  }
  if (!Number.isFinite(numStock) || numStock < 0) {
    return sendError(res, 400, 'Product stock cannot be negative');
  }

  const slug = req.body.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4);
  const sellerId = req.user.sellerProfileId || ((req.user.role || '').toUpperCase() === 'ADMIN' ? req.body.sellerId : null) || null;

  const product = await Product.create({
    title: String(title).trim(),
    slug,
    description: String(description).trim(),
    price: numPrice,
    originalPrice: originalPrice ? Number(originalPrice) : numPrice * 1.2,
    category,
    brand: brand || 'Generic',
    hsnCode: hsnCode || '85183000',
    imageLight: imageLight || (images && images[0]) || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80',
    images: images || [imageLight],
    stock: numStock,
    sellerId,
    highlights: highlights || [],
    specifications: specifications || [],
    dynamicAttributes: dynamicAttributes || {},
    variants: variants || [
      {
        sku: `${slug.slice(0, 8).toUpperCase()}-STD`,
        title: 'Standard',
        price: numPrice,
        mrp: originalPrice ? Number(originalPrice) : numPrice * 1.2,
        stock: numStock,
      },
    ],
  });

  return sendResponse(res, 201, 'Product created successfully', product);
});

const ALLOWED_PRODUCT_UPDATE_FIELDS = [
  'title',
  'description',
  'price',
  'originalPrice',
  'category',
  'brand',
  'hsnCode',
  'imageLight',
  'images',
  'stock',
  'highlights',
  'specifications',
  'dynamicAttributes',
  'variants',
  'isPublished',
  'discountTag',
];

// @desc    Update product
// @route   PUT /api/v1/products/:id
export const updateProduct = asyncHandler(async (req, res) => {
  const existing = await Product.findById(req.params.id);
  if (!existing) return sendError(res, 404, 'Product not found');

  const isAdmin = (req.user.role || '').toUpperCase() === 'ADMIN';
  if (!isAdmin) {
    const profile = await SellerProfile.findOne({ userId: req.user._id });
    if (!profile || !existing.sellerId || existing.sellerId.toString() !== profile._id.toString()) {
      return sendError(res, 403, 'Access denied: You do not own this product');
    }
  }

  const updates = {};
  for (const field of ALLOWED_PRODUCT_UPDATE_FIELDS) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  return sendResponse(res, 200, 'Product updated successfully', product);
});

// @desc    Delete product
// @route   DELETE /api/v1/products/:id
export const deleteProduct = asyncHandler(async (req, res) => {
  const existing = await Product.findById(req.params.id);
  if (!existing) return sendError(res, 404, 'Product not found');

  const isAdmin = (req.user.role || '').toUpperCase() === 'ADMIN';
  if (!isAdmin) {
    const profile = await SellerProfile.findOne({ userId: req.user._id });
    if (!profile || !existing.sellerId || existing.sellerId.toString() !== profile._id.toString()) {
      return sendError(res, 403, 'Access denied: You do not own this product');
    }
  }

  await Product.findByIdAndDelete(req.params.id);
  return sendResponse(res, 200, 'Product deleted successfully');
});
