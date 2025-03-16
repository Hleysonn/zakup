import Abonnement from '../models/Abonnement.js';
import User from '../models/User.js';
import Club from '../models/Club.js';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Créer un nouvel abonnement
// @route   POST /api/abonnements
// @access  Private
export const createAbonnement = asyncHandler(async (req, res, next) => {
  const { clubId, formuleId, montantMensuel } = req.body;

  if (!['basic', 'premium', 'vip'].includes(formuleId)) {
    return next(new ErrorResponse('Formule d\'abonnement invalide', 400));
  }

  // Vérifier que le club existe
  const club = await Club.findById(clubId);
  if (!club) {
    return next(new ErrorResponse('Club introuvable', 404));
  }

  // Vérifier si l'utilisateur est déjà abonné à ce club
  const existingAbonnement = await Abonnement.findOne({
    user: req.user.id,
    club: clubId,
    actif: true
  });

  if (existingAbonnement) {
    // Mettre à jour l'abonnement existant avec la nouvelle formule
    existingAbonnement.formule = formuleId;
    existingAbonnement.montantMensuel = montantMensuel;
    existingAbonnement.dateDernierPaiement = Date.now();
    
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    existingAbonnement.dateProchainPaiement = date;
    
    await existingAbonnement.save();
    
    return res.status(200).json({
      success: true,
      data: existingAbonnement,
      message: 'Formule d\'abonnement mise à jour'
    });
  }

  // Créer l'abonnement
  const abonnement = await Abonnement.create({
    user: req.user.id,
    club: clubId,
    formule: formuleId,
    montantMensuel
  });

  // Ajouter le club aux abonnements de l'utilisateur s'il n'y est pas déjà
  await User.findByIdAndUpdate(
    req.user.id,
    { $addToSet: { clubsAbonnements: clubId } }
  );

  res.status(201).json({
    success: true,
    data: abonnement
  });
});

// @desc    Récupérer tous les abonnements
// @route   GET /api/abonnements
// @access  Private (Admin only)
export const getAbonnements = asyncHandler(async (req, res, next) => {
  const abonnements = await Abonnement.find()
    .populate('user', 'nom prenom email')
    .populate('club', 'raisonSociale');

  res.status(200).json({
    success: true,
    count: abonnements.length,
    data: abonnements
  });
});

// @desc    Récupérer les abonnements de l'utilisateur connecté
// @route   GET /api/abonnements/user
// @access  Private
export const getUserAbonnements = asyncHandler(async (req, res, next) => {
  const abonnements = await Abonnement.find({ user: req.user.id, actif: true })
    .populate('club', 'raisonSociale logo sport');

  res.status(200).json({
    success: true,
    count: abonnements.length,
    data: abonnements
  });
});

// @desc    Annuler un abonnement
// @route   PUT /api/abonnements/:id/cancel
// @access  Private
export const cancelAbonnement = asyncHandler(async (req, res, next) => {
  let abonnement = await Abonnement.findById(req.params.id);

  if (!abonnement) {
    return next(new ErrorResponse('Abonnement introuvable', 404));
  }

  // Vérifier que l'utilisateur est bien propriétaire de l'abonnement
  if (abonnement.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Non autorisé', 403));
  }

  abonnement.actif = false;
  await abonnement.save();

  // Retirer le club des abonnements de l'utilisateur
  await User.findByIdAndUpdate(
    req.user.id,
    { $pull: { clubsAbonnements: abonnement.club } }
  );

  res.status(200).json({
    success: true,
    data: {},
    message: 'Abonnement annulé'
  });
}); 