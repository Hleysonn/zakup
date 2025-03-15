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
  upload,
  getSponsorProfile,
  logoUpload,
  uploadSponsorLogo
} from '../controllers/sponsorController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Routes publiques
router.route('/')
  .get(getSponsors);

// Routes protégées pour le profil personnel
// Utiliser /me au lieu de /profile pour éviter les conflits
router.route('/me')
  .get(protect, authorize('sponsor'), getSponsorProfile)
  .put(protect, authorize('sponsor'), updateSponsorProfile);

// Autres routes protégées
router.route('/dashboard')
  .get(protect, authorize('sponsor'), getSponsorDashboard);

router.route('/upload-logo')
  .post(protect, authorize('sponsor'), logoUpload.single('logo'), uploadSponsorLogo);

router.route('/products')
  .post(protect, authorize('sponsor'), upload.single('image'), createProduct);

router.route('/sponsor-club/:id')
  .put(protect, authorize('sponsor'), sponsorClub);

router.route('/don-club/:id')
  .post(protect, authorize('sponsor'), donToClub);

// Route de détail d'un sponsor par ID (publique)
// Doit être en dernier pour éviter les conflits
router.route('/:id')
  .get(getSponsor);

export default router; 