import express from 'express';
import {
  getSponsors,
  getSponsor,
  updateSponsorProfile,
  sponsorClub,
  donToClub,
  getSponsorDashboard,
  createProduct,
  uploadProductImage,
  upload
} from '../controllers/sponsorController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Routes générales
router.route('/')
  .get(getSponsors);

// Routes spécifiques
router.route('/dashboard')
  .get(protect, authorize('sponsor'), getSponsorDashboard);

router.route('/profile')
  .put(protect, authorize('sponsor'), updateSponsorProfile);

// Routes pour les produits
router.route('/products')
  .post(protect, authorize('sponsor'), upload.single('image'), createProduct);

// Routes pour les clubs
router.route('/sponsor-club/:id')
  .put(protect, authorize('sponsor'), sponsorClub);

router.route('/don-club/:id')
  .post(protect, authorize('sponsor'), donToClub);

// Route avec paramètre dynamique en dernier
router.route('/:id')
  .get(getSponsor);

export default router; 