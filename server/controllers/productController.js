import Product from '../models/Product.js';
import Category from '../models/Category.js';
import SellerProfile from '../models/SellerProfile.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse, sendError } from '../utils/apiResponse.js';

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
    sellerId,
    sort,
    page = 1,
    limit = 12,
  } = req.query;

  const query = { isPublished: true };
  const searchTerm = q || search;

  if (searchTerm) {
    // Regex or text search fallback
    const regex = new RegExp(searchTerm.trim(), 'i');
    query.$or = [{ title: regex }, { description: regex }, { brand: regex }, { tags: regex }, { category: regex }];
  }

  if (category && category !== 'All' && category !== 'all') {
    query.$or = query.$or || [];
    query.category = { $regex: new RegExp(`^${category}$`, 'i') };
  }

  if (brand) {
    query.brand = { $regex: new RegExp(brand, 'i') };
  }

  if (sellerId) {
    query.sellerId = sellerId;
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  if (minRating) {
    query.rating = { $gte: Number(minRating) };
  }

  let sortOption = { createdAt: -1 };
  if (sort === 'price_asc' || sort === 'price:asc') sortOption = { price: 1 };
  else if (sort === 'price_desc' || sort === 'price:desc') sortOption = { price: -1 };
  else if (sort === 'rating_desc' || sort === 'rating:desc') sortOption = { rating: -1 };
  else if (sort === 'newest') sortOption = { createdAt: -1 };

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate('sellerId', 'businessName ratingAverage storeSlug isApproved')
    .sort(sortOption)
    .skip(skip)
    .limit(Number(limit));

  return sendResponse(res, 200, 'Products fetched successfully', products, {
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
  });
});

// @desc    Faceted search endpoint (Sub-30ms simulation conforming to Meilisearch spec)
// @route   GET /api/v1/search
export const searchProducts = asyncHandler(async (req, res) => {
  const { q = '', category, brand, minPrice, maxPrice, sort, page = 1, limit = 20 } = req.query;
  const startTime = Date.now();

  const query = { isPublished: true };
  if (q.trim()) {
    const regex = new RegExp(q.trim(), 'i');
    query.$or = [{ title: regex }, { brand: regex }, { category: regex }, { tags: regex }, { description: regex }];
  }

  if (category && category !== 'All') {
    query.category = { $regex: new RegExp(`^${category}$`, 'i') };
  }
  if (brand) {
    query.brand = { $regex: new RegExp(brand, 'i') };
  }
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [hits, totalHits, allMatching] = await Promise.all([
    Product.find(query)
      .populate('sellerId', 'businessName ratingAverage storeSlug')
      .skip(skip)
      .limit(Number(limit)),
    Product.countDocuments(query),
    Product.find(query).select('brand category price rating'),
  ]);

  // Aggregate dynamic facets
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
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(totalHits / Number(limit)),
    },
  });
});

// @desc    Search autocomplete suggestions
// @route   GET /api/v1/search/autocomplete
export const autocomplete = asyncHandler(async (req, res) => {
  const { q = '' } = req.query;
  if (!q.trim()) {
    return sendResponse(res, 200, 'Autocomplete suggestions', { suggestions: [], brands: [], categories: [] });
  }

  const regex = new RegExp(q.trim(), 'i');
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
    product = await Product.findById(idOrSlug).populate('sellerId', 'businessName ratingAverage storeSlug isApproved currentBalance');
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

  // Related products in same category
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

  const slug = req.body.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4);
  const sellerId = req.user.sellerProfileId || req.body.sellerId || null;

  const product = await Product.create({
    title,
    slug,
    description,
    price: Number(price),
    originalPrice: originalPrice ? Number(originalPrice) : Number(price) * 1.2,
    category,
    brand: brand || 'Generic',
    hsnCode: hsnCode || '85183000',
    imageLight: imageLight || (images && images[0]) || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80',
    images: images || [imageLight],
    stock: stock ? Number(stock) : 50,
    sellerId,
    highlights: highlights || [],
    specifications: specifications || [],
    dynamicAttributes: dynamicAttributes || {},
    variants: variants || [
      {
        sku: `${slug.slice(0, 8).toUpperCase()}-STD`,
        title: 'Standard',
        price: Number(price),
        mrp: originalPrice ? Number(originalPrice) : Number(price) * 1.2,
        stock: stock ? Number(stock) : 50,
      },
    ],
  });

  return sendResponse(res, 201, 'Product created successfully', product);
});

// @desc    Update product
// @route   PUT /api/v1/products/:id
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!product) return sendError(res, 404, 'Product not found');
  return sendResponse(res, 200, 'Product updated successfully', product);
});

// @desc    Delete product
// @route   DELETE /api/v1/products/:id
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return sendError(res, 404, 'Product not found');
  return sendResponse(res, 200, 'Product deleted successfully');
});
