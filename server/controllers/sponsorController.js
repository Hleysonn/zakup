import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import Sponsor from '../models/Sponsor.js';
import Club from '../models/Club.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

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

// @desc    Obtenir tous les sponsors
// @route   GET /api/sponsors
// @access  Public
export const getSponsors = asyncHandler(async (req, res, next) => {
  let query;

  // Copie des paramètres de requête
  const reqQuery = { ...req.query };

  // Champs à exclure
  const removeFields = ['select', 'sort', 'page', 'limit'];

  // Supprimer les champs spéciaux
  removeFields.forEach(param => delete reqQuery[param]);

  // Créer une chaîne de requête
  let queryStr = JSON.stringify(reqQuery);

  // Créer des opérateurs ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Trouver les sponsors
  query = Sponsor.find(JSON.parse(queryStr));

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
  const total = await Sponsor.countDocuments(JSON.parse(queryStr));

  query = query.skip(startIndex).limit(limit);

  // Exécuter la requête
  const sponsors = await query.populate('clubsSponsored', 'raisonSociale logo');

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

  res.status(200).json({
    success: true,
    count: sponsors.length,
    pagination,
    data: sponsors
  });
});

// @desc    Obtenir un sponsor par ID
// @route   GET /api/sponsors/:id
// @access  Public
export const getSponsor = asyncHandler(async (req, res, next) => {
  const sponsor = await Sponsor.findById(req.params.id)
    .populate('clubsSponsored', 'raisonSociale logo');

  if (!sponsor) {
    return next(
      new ErrorResponse(`Sponsor non trouvé avec l'id ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: sponsor
  });
});

// @desc    Mettre à jour le profil sponsor
// @route   PUT /api/sponsors/profile
// @access  Private (Sponsor)
export const updateSponsorProfile = asyncHandler(async (req, res, next) => {
  // Filtrer les champs que le sponsor peut mettre à jour
  const fieldsToUpdate = {
    raisonSociale: req.body.raisonSociale,
    nom: req.body.nom,
    prenom: req.body.prenom,
    telephone: req.body.telephone,
    adresse: req.body.adresse,
    compteBancaire: req.body.compteBancaire,
    logo: req.body.logo,
    description: req.body.description
  };

  // Supprimer les champs indéfinis
  Object.keys(fieldsToUpdate).forEach(
    key => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
  );

  const sponsor = await Sponsor.findByIdAndUpdate(
    req.user.id,
    fieldsToUpdate,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    data: sponsor
  });
});

// @desc    Sponsoriser un club
// @route   PUT /api/sponsors/sponsor-club/:id
// @access  Private (Sponsor)
export const sponsorClub = asyncHandler(async (req, res, next) => {
  const club = await Club.findById(req.params.id);

  if (!club) {
    return next(
      new ErrorResponse(`Club non trouvé avec l'id ${req.params.id}`, 404)
    );
  }

  // Vérifier si le sponsor sponsorise déjà ce club
  const alreadySponsored = club.sponsors.includes(req.user.id);

  if (alreadySponsored) {
    return next(
      new ErrorResponse(`Vous sponsorisez déjà ce club`, 400)
    );
  }

  // Ajouter le sponsor à la liste des sponsors du club
  club.sponsors.push(req.user.id);
  await club.save();

  // Ajouter le club à la liste des clubs sponsorisés par le sponsor
  const sponsor = await Sponsor.findById(req.user.id);
  sponsor.clubsSponsored.push(club._id);
  await sponsor.save();

  res.status(200).json({
    success: true,
    data: club
  });
});

// @desc    Faire un don à un club
// @route   POST /api/sponsors/don-club/:id
// @access  Private (Sponsor)
export const donToClub = asyncHandler(async (req, res, next) => {
  const { montant } = req.body;

  if (!montant || montant <= 0) {
    return next(
      new ErrorResponse('Veuillez fournir un montant valide', 400)
    );
  }

  const club = await Club.findById(req.params.id);

  if (!club) {
    return next(
      new ErrorResponse(`Club non trouvé avec l'id ${req.params.id}`, 404)
    );
  }

  // Vérifier si le sponsor sponsorise ce club
  const isSponsoring = club.sponsors.includes(req.user.id);

  if (!isSponsoring) {
    return next(
      new ErrorResponse('Vous devez d\'abord sponsoriser ce club', 400)
    );
  }

  // Ajouter le don à la liste des dons du club
  club.donsSponsors.push({
    sponsor: req.user.id,
    montant,
    date: Date.now()
  });

  await club.save();

  res.status(200).json({
    success: true,
    data: club
  });
});

// @desc    Obtenir le tableau de bord du sponsor
// @route   GET /api/sponsors/dashboard
// @access  Private (Sponsor)
export const getSponsorDashboard = asyncHandler(async (req, res, next) => {
  try {
    console.log('Début de getSponsorDashboard pour le sponsor:', req.user.id);
    
    // 1. Récupérer les informations de base du sponsor
    const sponsor = await Sponsor.findById(req.user.id);
    console.log('Sponsor trouvé:', sponsor ? 'Oui' : 'Non');
    
    if (!sponsor) {
      console.error('Sponsor introuvable:', req.user.id);
      return next(new ErrorResponse('Sponsor introuvable', 404));
    }
    
    // 2. Récupérer les produits
    console.log('Récupération des produits...');
    const products = await Product.find({
      vendeur: req.user.id,
      vendeurModel: 'Sponsor'
    }).lean();
    console.log(`Nombre de produits trouvés: ${products.length}`);
    
    // 3. Récupérer les commandes
    console.log('Récupération des commandes...');
    const orders = await Order.find({
      'produits.vendeur': req.user.id,
      'produits.vendeurModel': 'Sponsor'
    }).lean();
    console.log(`Nombre de commandes trouvées: ${orders.length}`);
    
    let revenue = 0;
    let productsSold = 0;
    
    orders.forEach(order => {
      if (order.produits && Array.isArray(order.produits)) {
        order.produits.forEach(produit => {
          if (produit.vendeur && 
              produit.vendeur.toString() === req.user.id && 
              produit.vendeurModel === 'Sponsor') {
            revenue += produit.prix * produit.quantite;
            productsSold += produit.quantite;
          }
        });
      }
    });
    
    // 4. Récupérer les clubs sponsorisés
    console.log('Récupération des clubs sponsorisés...');
    const clubsSponsored = sponsor.clubsSponsored || [];
    console.log(`Nombre de clubs sponsorisés: ${clubsSponsored.length}`);
    
    // 5. Récupérer les dons
    console.log('Récupération des dons...');
    let donations = [];
    let totalDonations = 0;
    
    if (clubsSponsored.length > 0) {
      const clubIds = clubsSponsored.map(club => club.toString());
      console.log('IDs des clubs sponsorisés:', clubIds);
      
      const clubsWithDonations = await Club.find({
        _id: { $in: clubIds },
        'donsSponsors.sponsor': req.user.id
      }).select('_id raisonSociale sport donsSponsors').lean();
      
      console.log(`Nombre de clubs avec dons: ${clubsWithDonations.length}`);
      
      clubsWithDonations.forEach(club => {
        if (club.donsSponsors && Array.isArray(club.donsSponsors)) {
          club.donsSponsors.forEach(don => {
            if (don.sponsor && don.sponsor.toString() === req.user.id) {
              totalDonations += don.montant || 0;
              donations.push({
                _id: don._id,
                club: {
                  _id: club._id,
                  raisonSociale: club.raisonSociale,
                  sport: club.sport
                },
                montant: don.montant,
                date: don.date
              });
            }
          });
        }
      });
    }
    
    // 6. Calculer le nombre d'abonnés
    const totalSubscribers = sponsor.subscribers ? sponsor.subscribers.length : 0;
    
    // 7. Préparer la réponse
    const responseData = {
      success: true,
      data: {
        totalProducts: products.length,
        totalRevenue: revenue,
        totalProductsSold: productsSold,
        totalOrders: orders.length,
        totalClubsSponsored: clubsSponsored.length,
        totalDonations,
        totalSubscribers,
        products,
        donations
      }
    };
    
    console.log('Envoi de la réponse du tableau de bord');
    return res.status(200).json(responseData);
    
  } catch (error) {
    console.error('Erreur dans getSponsorDashboard:', error);
    console.error('Stack trace:', error.stack);
    return next(new ErrorResponse('Erreur lors de la récupération des données du tableau de bord', 500));
  }
});

// @desc    Upload d'image pour un produit
// @route   POST /api/sponsors/products/upload
// @access  Private (Sponsor)
export const uploadProductImage = asyncHandler(async (req, res, next) => {
  console.log('Début de l\'upload d\'image');
  console.log('Fichier reçu:', req.file);

  if (!req.file) {
    console.log('Aucun fichier n\'a été reçu');
    return next(new ErrorResponse('Veuillez fournir une image', 400));
  }

  // Vérifier que le fichier est bien une image
  if (!req.file.mimetype.startsWith('image')) {
    console.log('Le fichier n\'est pas une image:', req.file.mimetype);
    return next(new ErrorResponse('Le fichier doit être une image', 400));
  }

  // Construire le chemin complet du fichier
  const filePath = `/uploads/products/${req.file.filename}`;
  console.log('Chemin du fichier:', filePath);

  res.status(200).json({
    success: true,
    data: filePath
  });
});

// @desc    Créer un nouveau produit
// @route   POST /api/sponsors/products
// @access  Private (Sponsor)
export const createProduct = asyncHandler(async (req, res, next) => {
  // Gérer l'upload de l'image
  if (!req.file) {
    return next(new ErrorResponse('Veuillez fournir une image', 400));
  }

  // Créer le produit avec l'image
  const product = await Product.create({
    ...req.body,
    images: [`/uploads/products/${req.file.filename}`],
    vendeur: req.user.id,
    vendeurModel: 'Sponsor',
    prix: parseFloat(req.body.prix),
    stock: parseInt(req.body.stock)
  });

  res.status(201).json({
    success: true,
    data: product
  });
}); 