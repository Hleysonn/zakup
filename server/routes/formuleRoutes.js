import express from 'express';
import { getFormules, getFormule } from '../controllers/formuleController.js';

const router = express.Router();

router.route('/')
  .get(getFormules);

router.route('/:id')
  .get(getFormule);

export default router; 