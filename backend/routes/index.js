import express from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import productRoutes from './productRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import cartRoutes from './cartRoutes.js';
import orderRoutes from './orderRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import sellerRoutes from './sellerRoutes.js';
import deliveryRoutes from './deliveryRoutes.js';
import returnRoutes from './returnRoutes.js';
import wishlistRoutes from './wishlistRoutes.js';
import couponRoutes from './couponRoutes.js';
import adminRoutes from './adminRoutes.js';
import chatRoutes from './chatRoutes.js';
import { searchProducts, autocomplete } from '../controllers/productController.js';
import { getSiteTheme } from '../controllers/themeController.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/seller', sellerRoutes);
router.use('/delivery', deliveryRoutes);
router.use('/returns', returnRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/coupons', couponRoutes);
router.use('/admin', adminRoutes);
router.use('/chat', chatRoutes);

// Public site theme configuration endpoint
router.get('/theme', getSiteTheme);

// Direct top-level search endpoints per REST API spec
router.get('/search/autocomplete', autocomplete);
router.get('/search', searchProducts);

// Image Upload Endpoint (Authenticated)
router.post('/upload', authenticate, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please upload an image file (JPEG, PNG, WebP)' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.status(200).json({
    success: true,
    message: 'Image uploaded successfully',
    data: { url: fileUrl, filename: req.file.filename },
  });
});

export default router;
