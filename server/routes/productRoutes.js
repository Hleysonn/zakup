import express from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductReview
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(protect, authorize('sponsor', 'club'), createProduct);

router.route('/:id')
  .get(getProduct)
  .put(protect, authorize('sponsor', 'club'), updateProduct)
  .delete(protect, authorize('sponsor', 'club'), deleteProduct);

router.route('/:id/reviews')
  .post(protect, authorize('user'), addProductReview);

export default router; 