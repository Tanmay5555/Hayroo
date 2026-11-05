import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse, sendError } from '../utils/apiResponse.js';

// @desc    Get product reviews
// @route   GET /api/v1/products/:productId/reviews
export const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId }).sort({ createdAt: -1 });
  return sendResponse(res, 200, 'Reviews fetched', reviews);
});

// @desc    Add review for product
// @route   POST /api/v1/products/:productId/reviews
export const addReview = asyncHandler(async (req, res) => {
  const { rating, title, comment } = req.body;
  const { productId } = req.params;

  if (!rating || !title || !comment) {
    return sendError(res, 400, 'Rating, title, and comment are required');
  }

  const product = await Product.findById(productId);
  if (!product) return sendError(res, 404, 'Product not found');

  const existingReview = await Review.findOne({ product: productId, user: req.user._id });
  if (existingReview) {
    return sendError(res, 400, 'You have already submitted a review for this product');
  }

  // Check if user has an order containing this product to verify purchase
  const userOrder = await Order.findOne({
    user: req.user._id,
    'items.product': productId,
    orderStatus: 'Delivered',
  });

  const review = await Review.create({
    product: productId,
    user: req.user._id,
    userName: req.user.name,
    rating: Number(rating),
    title,
    comment,
    isVerifiedPurchase: Boolean(userOrder),
  });

  // Auto-recalculate average rating
  const allReviews = await Review.find({ product: productId });
  const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

  product.rating = Number(avgRating.toFixed(1));
  product.reviewsCount = allReviews.length;
  await product.save();

  return sendResponse(res, 201, 'Review added successfully', review);
});

// @desc    Delete review
// @route   DELETE /api/v1/products/:productId/reviews/:reviewId
export const deleteReview = asyncHandler(async (req, res) => {
  const { productId, reviewId } = req.params;

  const review = await Review.findById(reviewId);
  if (!review) return sendError(res, 404, 'Review not found');

  if (req.user.role !== 'admin' && review.user.toString() !== req.user._id.toString()) {
    return sendError(res, 403, 'Access denied');
  }

  await Review.findByIdAndDelete(reviewId);

  // Recalculate rating
  const allReviews = await Review.find({ product: productId });
  const product = await Product.findById(productId);

  if (product) {
    product.reviewsCount = allReviews.length;
    product.rating = allReviews.length > 0 ? Number((allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1)) : 5.0;
    await product.save();
  }

  return sendResponse(res, 200, 'Review deleted');
});
