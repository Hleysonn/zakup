import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import Product from '../models/Product.js';

// @desc    Obtenir tous les produits
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req, res, next) => {
  let query;

  // Copie des paramètres de requête
  const reqQuery = { ...req.query };

  // Champs à exclure
  const removeFields = ['select', 'sort', 'page', 'limit'];

  // Supprimer les champs spéciaux
  removeFields.forEach(param => delete reqQuery[param]);

  // Filtrer par vendeur (sponsor ou club)
  if (req.query.sponsorId) {
    reqQuery.vendeur = req.query.sponsorId;
    reqQuery.vendeurModel = 'Sponsor';
    delete reqQuery.sponsorId;
  }

  if (req.query.clubId) {
    reqQuery.vendeur = req.query.clubId;
    reqQuery.vendeurModel = 'Club';
    delete reqQuery.clubId;
  }

  // Créer une chaîne de requête
  let queryStr = JSON.stringify(reqQuery);

  // Créer des opérateurs ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Trouver les produits
  query = Product.find(JSON.parse(queryStr));

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
  const total = await Product.countDocuments(JSON.parse(queryStr));

  query = query.skip(startIndex).limit(limit);

  // Exécuter la requête
  const products = await query
    .populate('vendeur', 'nom raisonSociale logo')
    .populate('notes.utilisateur', 'nom prenom');

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
    count: products.length,
    pagination,
    data: products
  });
});

// @desc    Obtenir un produit par ID
// @route   GET /api/products/:id
// @access  Public
export const getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id)
    .populate('vendeur', 'nom raisonSociale logo')
    .populate('notes.utilisateur', 'nom prenom');

  if (!product) {
    return next(
      new ErrorResponse(`Produit non trouvé avec l'id ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Créer un nouveau produit
// @route   POST /api/products
// @access  Private (Sponsor ou Club)
export const createProduct = asyncHandler(async (req, res, next) => {
  // Ajouter l'utilisateur au corps de la requête
  req.body.vendeur = req.user.id;
  
  // Définir le type de vendeur
  req.body.vendeurModel = req.userType === 'sponsor' ? 'Sponsor' : 'Club';

  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    data: product
  });
});

// @desc    Mettre à jour un produit
// @route   PUT /api/products/:id
// @access  Private (Sponsor ou Club propriétaire)
export const updateProduct = asyncHandler(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(
      new ErrorResponse(`Produit non trouvé avec l'id ${req.params.id}`, 404)
    );
  }

  // S'assurer que l'utilisateur est propriétaire du produit
  if (product.vendeur.toString() !== req.user.id) {
    return next(
      new ErrorResponse(`Vous n'êtes pas autorisé à mettre à jour ce produit`, 403)
    );
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
// @route   DELETE /api/products/:id
// @access  Private (Sponsor ou Club propriétaire)
export const deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(
      new ErrorResponse(`Produit non trouvé avec l'id ${req.params.id}`, 404)
    );
  }

  // S'assurer que l'utilisateur est propriétaire du produit
  if (product.vendeur.toString() !== req.user.id) {
    return next(
      new ErrorResponse(`Vous n'êtes pas autorisé à supprimer ce produit`, 403)
    );
  }

  await product.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Ajouter une note à un produit
// @route   POST /api/products/:id/reviews
// @access  Private (User)
export const addProductReview = asyncHandler(async (req, res, next) => {
  const { note, commentaire } = req.body;

  // Valider la note
  if (note < 1 || note > 5) {
    return next(
      new ErrorResponse('La note doit être entre 1 et 5', 400)
    );
  }

  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(
      new ErrorResponse(`Produit non trouvé avec l'id ${req.params.id}`, 404)
    );
  }

  // Vérifier si l'utilisateur a déjà noté ce produit
  const alreadyReviewed = product.notes.find(
    r => r.utilisateur.toString() === req.user.id
  );

  if (alreadyReviewed) {
    return next(
      new ErrorResponse('Vous avez déjà noté ce produit', 400)
    );
  }

  // Ajouter la note
  const review = {
    note,
    commentaire,
    utilisateur: req.user.id
  };

  product.notes.push(review);

  // Calculer la note moyenne
  product.notesMoyenne = product.notes.reduce((acc, item) => item.note + acc, 0) / product.notes.length;

  await product.save();

  res.status(201).json({
    success: true,
    data: product
  });
}); 