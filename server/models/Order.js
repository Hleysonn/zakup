import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  utilisateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  produits: [
    {
      produit: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      nom: {
        type: String,
        required: true
      },
      prix: {
        type: Number,
        required: true
      },
      quantite: {
        type: Number,
        required: true
      },
      vendeur: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'produits.vendeurModel'
      },
      vendeurModel: {
        type: String,
        required: true,
        enum: ['Club', 'Sponsor']
      }
    }
  ],
  adresseLivraison: {
    adresse: { type: String, required: true },
    ville: { type: String, required: true },
    codePostal: { type: String, required: true },
    pays: { type: String, required: true, default: 'France' }
  },
  informationsPaiement: {
    id: { type: String },
    status: { type: String },
    methode: { type: String, default: 'Carte bancaire' }
  },
  prixTotal: {
    type: Number,
    required: true,
    default: 0.0
  },
  fraisLivraison: {
    type: Number,
    required: true,
    default: 0.0
  },
  statusCommande: {
    type: String,
    required: true,
    enum: {
      values: [
        'En attente',
        'Traitement en cours',
        'Expédiée',
        'Livrée',
        'Annulée'
      ],
      message: 'Veuillez sélectionner un statut valide'
    },
    default: 'En attente'
  },
  dateLivraison: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Order', orderSchema); 