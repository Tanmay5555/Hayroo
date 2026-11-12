import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse, sendError } from '../utils/apiResponse.js';

// @desc    Get all categories with counts and subcategories
// @route   GET /api/v1/categories
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ name: 1 });

  // Calculate real-time product count for each category
  const categoriesWithCounts = await Promise.all(
    categories.map(async (cat) => {
      const count = await Product.countDocuments({
        $or: [
          { categoryId: cat._id },
          { category: { $regex: new RegExp(`^${cat.name}$`, 'i') } },
          { category: cat.slug },
        ],
      });
      return {
        ...cat.toObject(),
        productCount: count,
      };
    })
  );

  return sendResponse(res, 200, 'Categories fetched successfully', categoriesWithCounts);
});

// @desc    Get single category by slug
// @route   GET /api/v1/categories/:slug
export const getCategoryBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const category = await Category.findOne({ slug });
  if (!category) {
    return sendError(res, 404, 'Category not found');
  }

  const subcategories = await Category.find({ parentId: category._id });
  const productCount = await Product.countDocuments({
    $or: [{ categoryId: category._id }, { category: category.name }, { category: category.slug }],
  });

  return sendResponse(res, 200, 'Category fetched successfully', {
    ...category.toObject(),
    subcategories,
    productCount,
  });
});

// @desc    Create category
// @route   POST /api/v1/categories
export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, icon, imageUrl, parentId, commissionPercent, returnWindowDays, attributeSchema } =
    req.body;
  if (!name) return sendError(res, 400, 'Category name is required');

  const slug = req.body.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const category = await Category.create({
    name,
    slug,
    description,
    icon: icon || 'Package',
    imageUrl,
    parentId: parentId || null,
    commissionPercent: commissionPercent || 10.0,
    returnWindowDays: returnWindowDays || 7,
    attributeSchema: attributeSchema || { attributes: [] },
  });

  return sendResponse(res, 201, 'Category created successfully', category);
});

// @desc    Update category
// @route   PUT /api/v1/categories/:id
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!category) return sendError(res, 404, 'Category not found');
  return sendResponse(res, 200, 'Category updated successfully', category);
});

// @desc    Delete category
// @route   DELETE /api/v1/categories/:id
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) return sendError(res, 404, 'Category not found');
  return sendResponse(res, 200, 'Category deleted successfully');
});
