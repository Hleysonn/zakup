import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

// @desc    Créer une nouvelle commande
// @route   POST /api/orders
// @access  Private (User)
export const createOrder = asyncHandler(async (req, res, next) => {
  const { 
    produits,
    adresseLivraison,
    informationsPaiement
  } = req.body;

  if (!produits || produits.length === 0) {
    return next(new ErrorResponse('Veuillez ajouter au moins un produit à votre commande', 400));
  }

  // Récupérer les informations complètes des produits et vérifier le stock
  const produitsDetails = [];
  let prixTotal = 0;

  for (const item of produits) {
    const product = await Product.findById(item.produit);

    if (!product) {
      return next(new ErrorResponse(`Produit non trouvé avec l'id ${item.produit}`, 404));
    }

    if (product.stock < item.quantite) {
      return next(new ErrorResponse(`Stock insuffisant pour ${product.nom}`, 400));
    }

    produitsDetails.push({
      produit: product._id,
      nom: product.nom,
      prix: product.prix,
      quantite: item.quantite,
      vendeur: product.vendeur,
      vendeurModel: product.vendeurModel
    });

    // Mettre à jour le stock
    product.stock -= item.quantite;
    await product.save();

    // Calculer le prix total
    prixTotal += product.prix * item.quantite;
  }

  // Ajouter les frais de livraison (exemple: 5€)
  const fraisLivraison = 5;
  prixTotal += fraisLivraison;

  // Créer la commande
  const order = await Order.create({
    utilisateur: req.user.id,
    produits: produitsDetails,
    adresseLivraison,
    informationsPaiement,
    prixTotal,
    fraisLivraison
  });

  res.status(201).json({
    success: true,
    data: order
  });
});

// @desc    Obtenir toutes les commandes d'un utilisateur
// @route   GET /api/orders
// @access  Private (User)
export const getMyOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find({ utilisateur: req.user.id })
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders
  });
});

// @desc    Obtenir une commande par ID
// @route   GET /api/orders/:id
// @access  Private (User + Propriétaire de la commande)
export const getOrderById = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorResponse(`Commande non trouvée avec l'id ${req.params.id}`, 404));
  }

  // Vérifier que l'utilisateur est propriétaire de la commande
  if (order.utilisateur.toString() !== req.user.id && req.userType === 'user') {
    return next(new ErrorResponse('Non autorisé à accéder à cette commande', 403));
  }

  // Si c'est un sponsor ou club, vérifier qu'il est vendeur d'au moins un produit
  if (req.userType === 'sponsor' || req.userType === 'club') {
    const isVendeur = order.produits.some(
      p => p.vendeur.toString() === req.user.id
    );

    if (!isVendeur) {
      return next(new ErrorResponse('Non autorisé à accéder à cette commande', 403));
    }
  }

  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Mettre à jour le statut d'une commande
// @route   PUT /api/orders/:id/status
// @access  Private (Sponsor ou Club vendeur)
export const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { statusCommande } = req.body;

  if (!statusCommande) {
    return next(new ErrorResponse('Veuillez fournir un statut de commande', 400));
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorResponse(`Commande non trouvée avec l'id ${req.params.id}`, 404));
  }

  // Vérifier que le sponsor/club est vendeur d'au moins un produit
  const isVendeur = order.produits.some(
    p => p.vendeur.toString() === req.user.id
  );

  if (!isVendeur) {
    return next(new ErrorResponse('Non autorisé à modifier cette commande', 403));
  }

  // Mettre à jour le statut
  order.statusCommande = statusCommande;

  // Si le statut est "Livrée", ajouter la date de livraison
  if (statusCommande === 'Livrée') {
    order.dateLivraison = Date.now();
  }

  await order.save();

  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Obtenir toutes les commandes pour un vendeur (Sponsor ou Club)
// @route   GET /api/orders/vendeur
// @access  Private (Sponsor ou Club)
export const getVendeurOrders = asyncHandler(async (req, res, next) => {
  // Trouver toutes les commandes contenant au moins un produit vendu par ce vendeur
  const orders = await Order.find({
    'produits.vendeur': req.user.id
  }).sort('-createdAt');

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders
  });
}); 