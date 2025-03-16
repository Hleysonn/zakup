import Formule from '../models/Formule.js';
import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Récupérer toutes les formules d'abonnement
// @route   GET /api/formules
// @access  Public
export const getFormules = asyncHandler(async (req, res, next) => {
  const formules = await Formule.find();
  
  res.status(200).json({
    success: true,
    count: formules.length,
    data: formules
  });
});

// @desc    Récupérer une formule d'abonnement par ID
// @route   GET /api/formules/:id
// @access  Public
export const getFormule = asyncHandler(async (req, res, next) => {
  const formule = await Formule.findById(req.params.id);
  
  if (!formule) {
    return next(new ErrorResponse(`Formule avec l'id ${req.params.id} introuvable`, 404));
  }
  
  res.status(200).json({
    success: true,
    data: formule
  });
}); 