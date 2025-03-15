import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import User from '../models/User.js';
import Sponsor from '../models/Sponsor.js';
import Club from '../models/Club.js';

// Protéger les routes
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  console.log('Headers:', req.headers);
  console.log('Cookies:', req.cookies);

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
    console.log('Token from Authorization header:', token);
  } else if (req.cookies.token) {
    // Set token from cookie
    token = req.cookies.token;
    console.log('Token from cookie:', token);
  }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse('Non autorisé à accéder à cette route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token décodé:', decoded);

    // Check if role is specified in the token
    if (decoded.role) {
      console.log('Rôle détecté:', decoded.role);
      // Handle different user types based on role
      if (decoded.role === 'sponsor') {
        req.user = await Sponsor.findById(decoded.id);
        req.userType = 'sponsor';
        console.log('Type d\'utilisateur défini:', req.userType);
      } else if (decoded.role === 'club') {
        req.user = await Club.findById(decoded.id);
        req.userType = 'club';
        console.log('Type d\'utilisateur défini:', req.userType);
      }
    } else {
      // Default to regular user
      req.user = await User.findById(decoded.id);
      req.userType = 'user';
    }

    if (!req.user) {
      return next(new ErrorResponse('Utilisateur non trouvé', 404));
    }

    next();
  } catch (err) {
    console.error('Erreur de vérification du token:', err);
    return next(new ErrorResponse('Non autorisé à accéder à cette route', 401));
  }
});

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    console.log('Rôles autorisés:', roles);
    console.log('Type d\'utilisateur actuel:', req.userType);
    
    if (!roles.includes(req.userType)) {
      return next(
        new ErrorResponse(
          `Le rôle ${req.userType} n'est pas autorisé à accéder à cette route`,
          403
        )
      );
    }
    next();
  };
}; 