import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getVendeurOrders
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .post(protect, authorize('user'), createOrder)
  .get(protect, authorize('user'), getMyOrders);

router.route('/vendeur')
  .get(protect, authorize('sponsor', 'club'), getVendeurOrders);

router.route('/:id')
  .get(protect, getOrderById);

router.route('/:id/status')
  .put(protect, authorize('sponsor', 'club'), updateOrderStatus);

export default router; 