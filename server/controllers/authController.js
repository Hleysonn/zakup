import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';
import Sponsor from '../models/Sponsor.js';
import Club from '../models/Club.js';
import jwt from 'jsonwebtoken';

// @desc    Inscrire un utilisateur
// @route   POST /api/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req, res, next) => {
  const { nom, prenom, email, telephone, adresse, password, acceptRGPD, 
          acceptNewsletter, acceptSMS, sponsorsAbonnements, clubsAbonnements } = req.body;

  if (!acceptRGPD) {
    return next(new ErrorResponse('Vous devez accepter les conditions RGPD', 400));
  }

  // Vérifier que l'email n'est pas déjà utilisé (tous types d'utilisateurs confondus)
  const userExists = await User.findOne({ email });
  const sponsorExists = await Sponsor.findOne({ email });
  const clubExists = await Club.findOne({ email });

  if (userExists || sponsorExists || clubExists) {
    return next(new ErrorResponse('Cet email est déjà utilisé', 400));
  }

  // Créer l'utilisateur
  const user = await User.create({
    nom,
    prenom,
    email,
    telephone,
    adresse,
    password,
    acceptRGPD,
    acceptNewsletter: acceptNewsletter || false,
    acceptSMS: acceptSMS || false,
    sponsorsAbonnements: sponsorsAbonnements || [],
    clubsAbonnements: clubsAbonnements || []
  });

  // Envoyer le token
  sendTokenResponse(user, 201, res);
});

// @desc    Inscrire un sponsor
// @route   POST /api/auth/register-sponsor
// @access  Public
export const registerSponsor = asyncHandler(async (req, res, next) => {
  const { raisonSociale, nom, prenom, email, telephone, adresse, numeroTVA, password, acceptRGPD } = req.body;

  if (!acceptRGPD) {
    return next(new ErrorResponse('Vous devez accepter les conditions RGPD', 400));
  }

  // Vérifier que l'email n'est pas déjà utilisé (tous types d'utilisateurs confondus)
  const userExists = await User.findOne({ email });
  const sponsorExists = await Sponsor.findOne({ email });
  const clubExists = await Club.findOne({ email });

  if (userExists || sponsorExists || clubExists) {
    return next(new ErrorResponse('Cet email est déjà utilisé', 400));
  }

  // Créer le sponsor
  const sponsor = await Sponsor.create({
    raisonSociale,
    nom,
    prenom,
    email,
    telephone,
    adresse,
    numeroTVA,
    password,
    acceptRGPD
  });

  // Envoyer le token
  sendTokenResponse(sponsor, 201, res);
});

// @desc    Inscrire un club
// @route   POST /api/auth/register-club
// @access  Public
export const registerClub = asyncHandler(async (req, res, next) => {
  const { raisonSociale, nom, prenom, email, telephone, adresse, numeroTVA, password, acceptRGPD, sport } = req.body;

  if (!acceptRGPD) {
    return next(new ErrorResponse('Vous devez accepter les conditions RGPD', 400));
  }

  // Vérifier que l'email n'est pas déjà utilisé (tous types d'utilisateurs confondus)
  const userExists = await User.findOne({ email });
  const sponsorExists = await Sponsor.findOne({ email });
  const clubExists = await Club.findOne({ email });

  if (userExists || sponsorExists || clubExists) {
    return next(new ErrorResponse('Cet email est déjà utilisé', 400));
  }

  // Créer le club
  const club = await Club.create({
    raisonSociale,
    nom,
    prenom,
    email,
    telephone,
    adresse,
    numeroTVA,
    password,
    acceptRGPD,
    sport: sport || ''
  });

  // Envoyer le token
  sendTokenResponse(club, 201, res);
});

// @desc    Connecter un utilisateur
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res, next) => {
  const { email, password, role, userType } = req.body;
  const userRole = role || userType; // Accepter soit role soit userType

  // Valider email & password
  if (!email || !password) {
    return next(new ErrorResponse('Veuillez fournir un email et un mot de passe', 400));
  }

  let user;
  let type;

  // Chercher l'utilisateur selon le rôle spécifié
  if (userRole === 'sponsor') {
    user = await Sponsor.findOne({ email }).select('+password');
    type = 'sponsor';
  } else if (userRole === 'club') {
    user = await Club.findOne({ email }).select('+password');
    type = 'club';
  } else {
    user = await User.findOne({ email }).select('+password');
    type = 'user';
  }

  // Vérifier si l'utilisateur existe
  if (!user) {
    return next(new ErrorResponse('Identifiants invalides', 401));
  }

  // Vérifier si le mot de passe correspond
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Identifiants invalides', 401));
  }

  // Envoyer le token
  sendTokenResponse(user, 200, res, type);
});

// @desc    Déconnecter un utilisateur / effacer le cookie
// @route   GET /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Obtenir l'utilisateur actuel
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    data: req.user,
    userType: req.userType
  });
});

// Helper function pour envoyer le token avec cookie
const sendTokenResponse = (user, statusCode, res, userType = null) => {
  // Créer le token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  // Décoder le token pour accéder au rôle
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const roleFromToken = decoded.role;

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      userType: userType || roleFromToken || 'user',
      data: {
        _id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: roleFromToken
      }
    });
}; 