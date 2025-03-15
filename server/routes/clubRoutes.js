import express from 'express';
import {
  getClubs,
  getClub,
  updateClubProfile,
  getClubSponsors,
  getClubDashboard,
  addClubProduct,
  getClubProducts,
  updateClubProduct,
  deleteClubProduct,
  upload
} from '../controllers/clubController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(getClubs);

router.route('/dashboard')
  .get(protect, authorize('club'), getClubDashboard);

router.route('/profile')
  .put(protect, authorize('club'), updateClubProfile);

// Routes pour les produits
router.route('/products')
  .get(protect, authorize('club'), getClubProducts)
  .post(protect, authorize('club'), upload.single('image'), addClubProduct);

router.route('/products/:id')
  .put(protect, authorize('club'), updateClubProduct)
  .delete(protect, authorize('club'), deleteClubProduct);

router.route('/:id')
  .get(getClub);

router.route('/:id/sponsors')
  .get(getClubSponsors);

export default router; 