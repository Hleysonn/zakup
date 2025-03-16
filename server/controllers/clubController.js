import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import Club from '../models/Club.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import Formule from '../models/Formule.js';
import Abonnement from '../models/Abonnement.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration de multer pour le stockage des fichiers
const productStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/products'));
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = uuidv4();
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Configuration de multer pour le stockage des logos
const logoStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/logos'));
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = uuidv4();
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtre pour n'accepter que les images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new ErrorResponse('Le fichier doit être une image', 400), false);
  }
};

// Configuration multer pour les produits
export const productUpload = multer({
  storage: productStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limite à 5MB
  }
});

// Configuration multer pour les logos
export const logoUpload = multer({
  storage: logoStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limite à 5MB
  }
});

// @desc    Obtenir tous les clubs
// @route   GET /api/clubs
// @access  Public
export const getClubs = asyncHandler(async (req, res, next) => {
  try {
    console.log('Début de getClubs');
  let query;

  // Copie des paramètres de requête
  const reqQuery = { ...req.query };
    console.log('Paramètres de requête:', reqQuery);

  // Champs à exclure
  const removeFields = ['select', 'sort', 'page', 'limit'];

  // Supprimer les champs spéciaux
  removeFields.forEach(param => delete reqQuery[param]);

  // Créer une chaîne de requête
  let queryStr = JSON.stringify(reqQuery);
    console.log('Chaîne de requête:', queryStr);

  // Créer des opérateurs ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Trouver les clubs
  query = Club.find(JSON.parse(queryStr));
    console.log('Requête MongoDB:', query.getFilter());

  // Sélectionner des champs
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Trier
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Club.countDocuments(JSON.parse(queryStr));
    console.log('Total de clubs trouvés:', total);

  query = query.skip(startIndex).limit(limit);

  // Exécuter la requête
  const clubs = await query.populate('sponsors', 'raisonSociale logo');
    console.log('Nombre de clubs récupérés:', clubs.length);

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

    console.log('Envoi de la réponse');
  res.status(200).json({
    success: true,
    count: clubs.length,
    pagination,
    data: clubs
  });
  } catch (error) {
    console.error('Erreur dans getClubs:', error);
    return next(new ErrorResponse('Erreur lors de la récupération des clubs', 500));
  }
});

// @desc    Obtenir un club par ID
// @route   GET /api/clubs/:id
// @access  Public
export const getClub = asyncHandler(async (req, res, next) => {
  const club = await Club.findById(req.params.id)
    .populate('sponsors', 'raisonSociale logo description');

  if (!club) {
    return next(
      new ErrorResponse(`Club non trouvé avec l'id ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: club
  });
});

// @desc    Mettre à jour le profil club
// @route   PUT /api/clubs/profile
// @access  Private (Club)
export const updateClubProfile = asyncHandler(async (req, res, next) => {
  // Log des données reçues
  console.log('Données reçues pour mise à jour:', req.body);
  
  // Filtrer les champs que le club peut mettre à jour
  const fieldsToUpdate = {
    raisonSociale: req.body.raisonSociale,
    nom: req.body.nom,
    prenom: req.body.prenom,
    telephone: req.body.telephone,
    adresse: req.body.adresse,
    ville: req.body.ville,
    codePostal: req.body.codePostal,
    numeroTVA: req.body.numeroTVA,
    compteBancaire: req.body.compteBancaire,
    logo: req.body.logo,
    description: req.body.description,
    sport: req.body.sport,
    acceptRGPD: req.body.acceptRGPD
  };

  // Supprimer les champs indéfinis ou vides pour les champs non obligatoires
  Object.keys(fieldsToUpdate).forEach(key => {
    // Pour les champs optionnels, on peut envoyer des chaînes vides
    const optionalFields = ['ville', 'codePostal', 'compteBancaire', 'description', 'sport', 'logo'];
    
    if (
      fieldsToUpdate[key] === undefined || 
      (typeof fieldsToUpdate[key] === 'string' && 
       fieldsToUpdate[key].trim() === '' && 
       !optionalFields.includes(key))
    ) {
      delete fieldsToUpdate[key];
    }
  });
  
  // Log des champs après filtrage
  console.log('Champs après filtrage:', fieldsToUpdate);

  try {
  const club = await Club.findByIdAndUpdate(
    req.user.id,
    fieldsToUpdate,
    {
      new: true,
      runValidators: true
    }
  );

    // Log du club après mise à jour
    console.log('Club après mise à jour:', club);

  res.status(200).json({
    success: true,
    data: club
  });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    return next(new ErrorResponse(error.message || 'Erreur lors de la mise à jour du profil', 400));
  }
});

// @desc    Obtenir les sponsors d'un club
// @route   GET /api/clubs/:id/sponsors
// @access  Public
export const getClubSponsors = asyncHandler(async (req, res, next) => {
  const club = await Club.findById(req.params.id)
    .populate('sponsors', 'raisonSociale logo description');

  if (!club) {
    return next(
      new ErrorResponse(`Club non trouvé avec l'id ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    count: club.sponsors.length,
    data: club.sponsors
  });
});

// @desc    Obtenir les données du tableau de bord du club
// @route   GET /api/clubs/dashboard
// @access  Private (Club only)
export const getClubDashboard = asyncHandler(async (req, res, next) => {
  try {
    const clubId = req.user.id;
    
    // Récupérer le nombre total d'abonnés
    const totalAbonnes = await Abonnement.countDocuments({ 
      club: clubId,
      actif: true
    });
    
    // Récupérer le montant total des revenus mensuels (abonnements actifs)
    const abonnements = await Abonnement.find({
      club: clubId,
      actif: true
    });
    
    const totalRevenu = abonnements.reduce((total, abonnement) => {
      return total + abonnement.montantMensuel;
    }, 0);
    
    // Récupérer le nombre total de produits du club
    const totalProduits = await Product.countDocuments({ club: clubId });
    
    // Récupérer les produits récents
    const products = await Product.find({ club: clubId })
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Préparer les données pour les événements (à implémenter plus tard)
    const totalEvenements = 0; // Placeholder pour les événements futurs
    
    res.status(200).json({
      success: true,
      data: {
        totalAbonnes,
        totalRevenu,
        totalProduits,
        totalEvenements,
        products
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des données de tableau de bord:', error);
    return next(new ErrorResponse('Erreur lors de la récupération des données', 500));
  }
});

// @desc    Ajouter un produit pour un club
// @route   POST /api/clubs/products
// @access  Private/Club
export const addClubProduct = asyncHandler(async (req, res) => {
  const club = await Club.findById(req.user.id);
  if (!club) {
    throw new ErrorResponse('Club non trouvé', 404);
  }

  // Gérer l'upload de l'image
  if (!req.file) {
    throw new ErrorResponse('Veuillez ajouter une image', 400);
  }

  // Créer le produit avec l'image
  const product = await Product.create({
    ...req.body,
    images: [`/uploads/products/${req.file.filename}`],
    vendeur: club._id,
    vendeurModel: 'Club',
    prix: parseFloat(req.body.prix),
    stock: parseInt(req.body.stock)
  });

  res.status(201).json({
    success: true,
    data: product
  });
});

// @desc    Obtenir les produits d'un club
// @route   GET /api/clubs/products
// @access  Private/Club
export const getClubProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({
      vendeur: req.user.id,
      vendeurModel: 'Club'
    });

  res.status(200).json({
    success: true,
    data: products
  });
});

// @desc    Mettre à jour un produit
// @route   PUT /api/clubs/products/:id
// @access  Private/Club
export const updateClubProduct = asyncHandler(async (req, res) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    throw new ErrorResponse('Produit non trouvé', 404);
  }

  // Vérifier que le club est bien le propriétaire
  if (product.vendeur.toString() !== req.user.id || product.vendeurModel !== 'Club') {
    throw new ErrorResponse('Non autorisé à modifier ce produit', 403);
  }

  // Gérer l'upload d'une nouvelle image si présente
  if (req.files && req.files.image) {
    const file = req.files.image;
    const fileName = `${uuidv4()}${path.parse(file.name).ext}`;
    const filePath = `/uploads/products/${fileName}`;

    // Déplacer le fichier
    await file.mv(`./uploads/products/${fileName}`);
    
    // Ajouter le nouveau chemin d'image
    req.body.images = [filePath];
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Supprimer un produit
// @route   DELETE /api/clubs/products/:id
// @access  Private/Club
export const deleteClubProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ErrorResponse('Produit non trouvé', 404);
  }

  // Vérifier que le club est bien le propriétaire
  if (product.vendeur.toString() !== req.user.id || product.vendeurModel !== 'Club') {
    throw new ErrorResponse('Non autorisé à supprimer ce produit', 403);
  }

  await product.remove();

  res.status(200).json({
    success: true,
    data: {}
      });
    });

// @desc    Obtenir le profil du club connecté
// @route   GET /api/clubs/profile
// @access  Private (Club)
export const getClubProfile = asyncHandler(async (req, res, next) => {
  try {
    console.log('Début de getClubProfile');
    console.log('User dans la requête:', req.user);
    console.log('Type d\'utilisateur:', req.userType);
    
    if (!req.user || !req.user.id) {
      console.error('Utilisateur non trouvé dans la requête');
      return next(new ErrorResponse('Utilisateur non authentifié', 401));
    }

    console.log('Récupération du profil club pour:', req.user.id);
    
    const club = await Club.findById(req.user.id)
      .select('-password -resetPasswordToken -resetPasswordExpire');

    console.log('Club trouvé:', club);

    if (!club) {
      console.error('Club non trouvé dans la base de données');
      return next(new ErrorResponse('Club non trouvé', 404));
    }

    console.log('Envoi de la réponse');
    res.status(200).json({
      success: true,
      data: club
    });
  } catch (error) {
    console.error('Erreur dans getClubProfile:', error);
    return next(new ErrorResponse('Erreur lors de la récupération du profil', 500));
  }
});

// @desc    Upload du logo du club
// @route   POST /api/clubs/upload-logo
// @access  Private (Club)
export const uploadClubLogo = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('Veuillez télécharger une image', 400));
  }

  // Créer l'URL du logo
  const logoUrl = `/uploads/logos/${req.file.filename}`;

  // Mettre à jour le club avec la nouvelle URL du logo
  const club = await Club.findByIdAndUpdate(
    req.user.id,
    { logo: logoUrl },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    logoUrl: logoUrl
  });
});

// @desc    Récupérer la liste des abonnés du club
// @route   GET /api/clubs/subscribers
// @access  Private (Club only)
export const getClubSubscribers = asyncHandler(async (req, res, next) => {
  const clubId = req.user.id;

  try {
    // Rechercher les utilisateurs qui ont ce club dans leur liste d'abonnements
    const subscribers = await User.find({ 
      clubsAbonnements: clubId 
    }).select('nom prenom email telephone avatar createdAt');

    // Formater la réponse pour correspondre à l'interface Subscriber
    const formattedSubscribers = subscribers.map(subscriber => ({
      _id: subscriber._id,
      nom: subscriber.nom,
      prenom: subscriber.prenom,
      email: subscriber.email,
      telephone: subscriber.telephone,
      avatar: subscriber.avatar,
      dateAbonnement: subscriber.createdAt // Utilise la date de création comme date d'abonnement (temporaire)
    }));

    res.status(200).json({
      success: true,
      count: formattedSubscribers.length,
      data: formattedSubscribers
    });
  } catch (err) {
    console.error('Erreur lors de la récupération des abonnés:', err);
    return next(new ErrorResponse('Erreur lors de la récupération des abonnés', 500));
  }
});

// @desc    Obtenir les formules d'abonnement du club connecté
// @route   GET /api/clubs/formules
// @access  Private (Club)
export const getClubFormules = asyncHandler(async (req, res) => {
  // Récupérer l'ID du club connecté depuis le token d'authentification
  const clubId = req.user.id;

  // Rechercher les formules d'abonnement pour ce club
  const formules = await Formule.find({ club: clubId });

  res.status(200).json({
    success: true,
    data: formules
  });
});

// @desc    Créer une formule d'abonnement
// @route   POST /api/clubs/formules
// @access  Private (Club)
export const createFormule = asyncHandler(async (req, res) => {
  // Ajouter l'ID du club à la formule
  req.body.club = req.user.id;
  
  // Créer la formule
  const formule = await Formule.create(req.body);

  res.status(201).json({
    success: true,
    data: formule
  });
});

// @desc    Mettre à jour une formule d'abonnement
// @route   PUT /api/clubs/formules/:id
// @access  Private (Club)
export const updateFormule = asyncHandler(async (req, res) => {
  let formule = await Formule.findById(req.params.id);

  if (!formule) {
    return res.status(404).json({
      success: false,
      message: 'Formule introuvable'
    });
  }

  // Vérifier que le club est propriétaire de la formule
  if (formule.club.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Non autorisé à modifier cette formule'
    });
  }

  // Mettre à jour la formule
  formule = await Formule.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: formule
  });
});

// @desc    Supprimer une formule d'abonnement
// @route   DELETE /api/clubs/formules/:id
// @access  Private (Club)
export const deleteFormule = asyncHandler(async (req, res) => {
  const formule = await Formule.findById(req.params.id);

  if (!formule) {
    return res.status(404).json({
      success: false,
      message: 'Formule introuvable'
    });
  }

  // Vérifier que le club est propriétaire de la formule
  if (formule.club.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Non autorisé à supprimer cette formule'
    });
  }

  await formule.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Obtenir les formules d'abonnement publiques d'un club spécifique
// @route   GET /api/clubs/:id/formules-publiques
// @access  Public
export const getClubFormulesPub = asyncHandler(async (req, res) => {
  try {
    // Log pour le débogage
    console.log('Récupération des formules pour le club:', req.params.id);
    
    // Récupérer l'ID du club depuis les paramètres de la route
    const clubId = req.params.id;
    
    // Vérifier si le club existe
    const club = await User.findById(clubId);
    console.log('Club trouvé:', club ? 'Oui' : 'Non');
    
    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club introuvable'
      });
    }
    
    if (club.role !== 'club') {
      console.log('Rôle du club:', club.role);
      return res.status(400).json({
        success: false,
        message: 'L\'ID fourni ne correspond pas à un club'
      });
    }

    // Rechercher les formules d'abonnement pour ce club
    console.log('Recherche des formules pour le club:', clubId);
    const formules = await Formule.find({ club: clubId });
    console.log('Nombre de formules trouvées:', formules.length);

    res.status(200).json({
      success: true,
      data: formules
    });
  } catch (error) {
    console.error('Erreur dans getClubFormulesPub:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des formules',
      error: error.message
    });
  }
});

// @desc    Récupérer les abonnés d'un club
// @route   GET /api/clubs/abonnes
// @access  Private (Club only)
export const getClubAbonnes = asyncHandler(async (req, res, next) => {
  try {
    // Récupérer l'ID du club connecté
    const clubId = req.user.id;
    
    // Récupérer tous les abonnements actifs pour ce club avec les informations des utilisateurs
    let abonnements = await Abonnement.find({ 
      club: clubId 
    }).populate({
      path: 'user',
      select: 'nom prenom email avatar'
    }).sort({ dateDebut: -1 }); // Tri par date d'inscription (plus récent en premier)
    
    // S'assurer que les résultats sont un tableau
    if (!abonnements) abonnements = [];
    
    // Log détaillé pour déboguer
    console.log(`Abonnements bruts: ${abonnements.length} trouvés pour le club ${clubId}`);
    console.log(JSON.stringify(abonnements.map(a => ({
      _id: a._id.toString(),
      userId: a.user ? a.user._id.toString() : 'non défini',
      userInfo: a.user ? {
        nom: a.user.nom || 'non défini',
        prenom: a.user.prenom || 'non défini',
        email: a.user.email || 'non défini'
      } : 'utilisateur non défini',
      formule: a.formule || 'non définie',
      montantMensuel: a.montantMensuel || 0
    })), null, 2));
    
    // Filtrer les abonnements pour exclure ceux sans utilisateur
    const validAbonnements = abonnements.filter(abonnement => abonnement.user);
    
    console.log(`Abonnements récupérés: ${abonnements.length}, Abonnements valides: ${validAbonnements.length}`);
    
    // Formater les données pour correspondre à la structure attendue par le frontend
    const formattedAbonnements = validAbonnements.map(abonnement => {
      // S'assurer que les informations utilisateur sont formatées correctement
      const userInfo = abonnement.user ? {
        _id: abonnement.user._id.toString(),
        nom: abonnement.user.nom || 'Utilisateur',  // Valeur par défaut si vide
        prenom: abonnement.user.prenom || 'Nom',  // Valeur par défaut si vide
        email: abonnement.user.email || 'email@example.com',  // Valeur par défaut si vide
        avatar: abonnement.user.avatar
      } : null;
      
      return {
        _id: abonnement._id.toString(),
        user: userInfo,
        formule: abonnement.formule || 'basic', // La formule est déjà une chaîne
        montantMensuel: abonnement.montantMensuel || 0,
        dateDebut: abonnement.dateDebut || new Date().toISOString(),
        dateProchainPaiement: abonnement.dateProchainPaiement || new Date().toISOString(),
        actif: typeof abonnement.actif === 'boolean' ? abonnement.actif : true
      };
    });
    
    // Trier les abonnements par nom/prénom pour faciliter la lecture
    formattedAbonnements.sort((a, b) => {
      if (!a.user || !b.user) return 0;
      const nameA = `${a.user.prenom} ${a.user.nom}`.toLowerCase();
      const nameB = `${b.user.prenom} ${b.user.nom}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });
    
    res.status(200).json({
      success: true,
      count: formattedAbonnements.length,
      data: formattedAbonnements
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des abonnés:', error);
    return next(new ErrorResponse('Erreur lors de la récupération des abonnés', 500));
  }
}); 