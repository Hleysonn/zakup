import express from 'express';
import {
  updateUserProfile,
  subscribeSponsor,
  unsubscribeSponsor,
  subscribeClub,
  unsubscribeClub,
  getUserSponsors,
  getUserClubs
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/profile')
  .put(protect, authorize('user'), updateUserProfile);

router.route('/subscribe-sponsor/:id')
  .put(protect, authorize('user'), subscribeSponsor);

router.route('/unsubscribe-sponsor/:id')
  .put(protect, authorize('user'), unsubscribeSponsor);

router.route('/subscribe-club/:id')
  .put(protect, authorize('user'), subscribeClub);

router.route('/unsubscribe-club/:id')
  .put(protect, authorize('user'), unsubscribeClub);

router.route('/sponsors')
  .get(protect, authorize('user'), getUserSponsors);

router.route('/clubs')
  .get(protect, authorize('user'), getUserClubs);

export default router; 