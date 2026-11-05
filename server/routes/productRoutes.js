import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import {
  getProductReviews,
  addReview,
  deleteReview,
} from '../controllers/reviewController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/:idOrSlug', getProductById);
router.post('/', authenticate, authorize('SELLER', 'ADMIN'), createProduct);
router.put('/:id', authenticate, authorize('SELLER', 'ADMIN'), updateProduct);
router.delete('/:id', authenticate, authorize('SELLER', 'ADMIN'), deleteProduct);

// Product Verified Reviews Endpoints
router.get('/:productId/reviews', getProductReviews);
router.post('/:productId/reviews', authenticate, addReview);
router.delete('/:productId/reviews/:reviewId', authenticate, deleteReview);

export default router;
