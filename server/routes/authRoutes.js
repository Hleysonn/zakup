import express from 'express';
import {
  registerUser,
  registerSponsor,
  registerClub,
  login,
  logout,
  getMe
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/register-sponsor', registerSponsor);
router.post('/register-club', registerClub);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', protect, getMe);

export default router; 