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
  productUpload,
  logoUpload,
  getClubProfile,
  uploadClubLogo
} from '../controllers/clubController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(getClubs);

router.route('/dashboard')
  .get(protect, authorize('club'), getClubDashboard);

router.route('/me')
  .get(protect, authorize('club'), getClubProfile)
  .put(protect, authorize('club'), updateClubProfile);

router.route('/profile')
  .get(protect, authorize('club'), getClubProfile)
  .put(protect, authorize('club'), updateClubProfile);

router.route('/upload-logo')
  .post(protect, authorize('club'), logoUpload.single('logo'), uploadClubLogo);

// Routes pour les produits
router.route('/products')
  .get(protect, authorize('club'), getClubProducts)
  .post(protect, authorize('club'), productUpload.single('image'), addClubProduct);

router.route('/products/:id')
  .put(protect, authorize('club'), updateClubProduct)
  .delete(protect, authorize('club'), deleteClubProduct);

router.route('/:id')
  .get(getClub);

router.route('/:id/sponsors')
  .get(getClubSponsors);

export default router; 