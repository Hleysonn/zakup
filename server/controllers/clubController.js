import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import Club from '../models/Club.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration de multer pour le stockage des fichiers
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/products'));
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

export const upload = multer({
  storage: storage,
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
  // Filtrer les champs que le club peut mettre à jour
  const fieldsToUpdate = {
    raisonSociale: req.body.raisonSociale,
    nom: req.body.nom,
    prenom: req.body.prenom,
    telephone: req.body.telephone,
    adresse: req.body.adresse,
    compteBancaire: req.body.compteBancaire,
    logo: req.body.logo,
    description: req.body.description,
    sport: req.body.sport
  };

  // Supprimer les champs indéfinis
  Object.keys(fieldsToUpdate).forEach(
    key => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
  );

  const club = await Club.findByIdAndUpdate(
    req.user.id,
    fieldsToUpdate,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    data: club
  });
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

// @desc    Obtenir le tableau de bord du club
// @route   GET /api/clubs/dashboard
// @access  Private (Club)
export const getClubDashboard = asyncHandler(async (req, res, next) => {
  try {
    // Récupérer les produits du club
    const products = await Product.find({
      vendeur: req.user.id,
      vendeurModel: 'Club'
    });

    // Récupérer les commandes contenant des produits du club
    const orders = await Order.find({
      'produits.vendeur': req.user.id,
      'produits.vendeurModel': 'Club'
    });

    // Calculer le chiffre d'affaires total
    let revenue = 0;
    let productsSold = 0;

    orders.forEach(order => {
      order.produits.forEach(produit => {
        if (produit.vendeur.toString() === req.user.id && produit.vendeurModel === 'Club') {
          revenue += produit.prix * produit.quantite;
          productsSold += produit.quantite;
        }
      });
    });

    // Récupérer les sponsors et les dons
    const club = await Club.findById(req.user.id)
      .populate('sponsors', 'raisonSociale logo');

    // Préparation des dons pour l'affichage
    const donations = [];
    let totalDonations = 0;
    
    club.donsSponsors.forEach(don => {
      totalDonations += don.montant;
      donations.push({
        _id: don._id,
        sponsor: don.sponsor,
        montant: don.montant,
        date: don.date
      });
    });

    // Grouper les dons par sponsor
    const donationsBySponsors = {};
    club.donsSponsors.forEach(don => {
      const sponsorId = don.sponsor.toString();
      if (!donationsBySponsors[sponsorId]) {
        donationsBySponsors[sponsorId] = 0;
      }
      donationsBySponsors[sponsorId] += don.montant;
    });

    // Calculer le nombre d'abonnés
    const subscribers = await Club.findById(req.user.id)
      .select('subscribers')
      .populate('subscribers');

    res.status(200).json({
      success: true,
      data: {
        totalProducts: products.length,
        totalRevenue: revenue,
        totalProductsSold: productsSold,
        totalOrders: orders.length,
        totalSponsors: club.sponsors.length,
        totalDonations,
        donationsBySponsors,
        totalSubscribers: subscribers.subscribers ? subscribers.subscribers.length : 0,
        products,
        donations
      }
    });
  } catch (error) {
    console.error('Erreur dans getClubDashboard:', error);
    return next(new ErrorResponse('Erreur lors de la récupération des données du tableau de bord', 500));
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