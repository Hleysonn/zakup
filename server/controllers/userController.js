import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';
import Sponsor from '../models/Sponsor.js';
import Club from '../models/Club.js';
import Order from '../models/Order.js';

// @desc    Mettre à jour le profil utilisateur
// @route   PUT /api/users/profile
// @access  Private (User)
export const updateUserProfile = asyncHandler(async (req, res, next) => {
  // Filtrer les champs que l'utilisateur peut mettre à jour
  const fieldsToUpdate = {
    nom: req.body.nom,
    prenom: req.body.prenom,
    telephone: req.body.telephone,
    adresse: req.body.adresse,
    acceptNewsletter: req.body.acceptNewsletter,
    acceptSMS: req.body.acceptSMS
  };

  // Supprimer les champs indéfinis
  Object.keys(fieldsToUpdate).forEach(
    key => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
  );

  const user = await User.findByIdAndUpdate(
    req.user.id,
    fieldsToUpdate,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    S'abonner à un sponsor
// @route   PUT /api/users/subscribe-sponsor/:id
// @access  Private (User)
export const subscribeSponsor = asyncHandler(async (req, res, next) => {
  const sponsor = await Sponsor.findById(req.params.id);

  if (!sponsor) {
    return next(
      new ErrorResponse(`Sponsor non trouvé avec l'id ${req.params.id}`, 404)
    );
  }

  // Vérifier si l'utilisateur est déjà abonné
  const user = await User.findById(req.user.id);
  const alreadySubscribed = user.sponsorsAbonnements.includes(req.params.id);

  if (alreadySubscribed) {
    return next(
      new ErrorResponse('Vous êtes déjà abonné à ce sponsor', 400)
    );
  }

  // Ajouter le sponsor aux abonnements de l'utilisateur
  user.sponsorsAbonnements.push(req.params.id);
  await user.save();

  // Ajouter l'utilisateur aux abonnés du sponsor
  sponsor.subscribers.push(req.user.id);
  await sponsor.save();

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Se désabonner d'un sponsor
// @route   PUT /api/users/unsubscribe-sponsor/:id
// @access  Private (User)
export const unsubscribeSponsor = asyncHandler(async (req, res, next) => {
  const sponsor = await Sponsor.findById(req.params.id);

  if (!sponsor) {
    return next(
      new ErrorResponse(`Sponsor non trouvé avec l'id ${req.params.id}`, 404)
    );
  }

  // Vérifier si l'utilisateur est abonné
  const user = await User.findById(req.user.id);
  const isSubscribed = user.sponsorsAbonnements.includes(req.params.id);

  if (!isSubscribed) {
    return next(
      new ErrorResponse('Vous n\'êtes pas abonné à ce sponsor', 400)
    );
  }

  // Retirer le sponsor des abonnements de l'utilisateur
  user.sponsorsAbonnements = user.sponsorsAbonnements.filter(
    id => id.toString() !== req.params.id
  );
  await user.save();

  // Retirer l'utilisateur des abonnés du sponsor
  sponsor.subscribers = sponsor.subscribers.filter(
    id => id.toString() !== req.user.id
  );
  await sponsor.save();

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    S'abonner à un club
// @route   PUT /api/users/subscribe-club/:id
// @access  Private (User)
export const subscribeClub = asyncHandler(async (req, res, next) => {
  const club = await Club.findById(req.params.id);

  if (!club) {
    return next(
      new ErrorResponse(`Club non trouvé avec l'id ${req.params.id}`, 404)
    );
  }

  // Vérifier si l'utilisateur est déjà abonné
  const user = await User.findById(req.user.id);
  const alreadySubscribed = user.clubsAbonnements.includes(req.params.id);

  if (alreadySubscribed) {
    return next(
      new ErrorResponse('Vous êtes déjà abonné à ce club', 400)
    );
  }

  // Ajouter le club aux abonnements de l'utilisateur
  user.clubsAbonnements.push(req.params.id);
  await user.save();

  // Ajouter l'utilisateur aux abonnés du club
  club.subscribers.push(req.user.id);
  await club.save();

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Se désabonner d'un club
// @route   PUT /api/users/unsubscribe-club/:id
// @access  Private (User)
export const unsubscribeClub = asyncHandler(async (req, res, next) => {
  const club = await Club.findById(req.params.id);

  if (!club) {
    return next(
      new ErrorResponse(`Club non trouvé avec l'id ${req.params.id}`, 404)
    );
  }

  // Vérifier si l'utilisateur est abonné
  const user = await User.findById(req.user.id);
  const isSubscribed = user.clubsAbonnements.includes(req.params.id);

  if (!isSubscribed) {
    return next(
      new ErrorResponse('Vous n\'êtes pas abonné à ce club', 400)
    );
  }

  // Retirer le club des abonnements de l'utilisateur
  user.clubsAbonnements = user.clubsAbonnements.filter(
    id => id.toString() !== req.params.id
  );
  await user.save();

  // Retirer l'utilisateur des abonnés du club
  club.subscribers = club.subscribers.filter(
    id => id.toString() !== req.user.id
  );
  await club.save();

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Obtenir les sponsors suivis par l'utilisateur
// @route   GET /api/users/sponsors
// @access  Private (User)
export const getUserSponsors = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id)
    .populate('sponsorsAbonnements', 'raisonSociale logo description');

  res.status(200).json({
    success: true,
    count: user.sponsorsAbonnements.length,
    data: user.sponsorsAbonnements
  });
});

// @desc    Obtenir les clubs suivis par l'utilisateur
// @route   GET /api/users/clubs
// @access  Private (User)
export const getUserClubs = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id)
    .populate('clubsAbonnements', 'raisonSociale logo description sport');

  res.status(200).json({
    success: true,
    count: user.clubsAbonnements.length,
    data: user.clubsAbonnements
  });
}); 