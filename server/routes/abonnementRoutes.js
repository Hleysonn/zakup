import express from 'express';
import { 
  createAbonnement, 
  getAbonnements, 
  getUserAbonnements,
  cancelAbonnement
} from '../controllers/abonnementController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .post(protect, createAbonnement)
  .get(protect, authorize('admin'), getAbonnements);

router.route('/user')
  .get(protect, getUserAbonnements);

router.route('/:id/cancel')
  .put(protect, cancelAbonnement);

export default router; 