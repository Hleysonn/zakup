import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Veuillez entrer un nom pour le produit'],
    trim: true,
    maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
  },
  description: {
    type: String,
    required: [true, 'Veuillez entrer une description'],
    maxlength: [500, 'La description ne peut pas dépasser 500 caractères']
  },
  prix: {
    type: Number,
    required: [true, 'Veuillez entrer un prix'],
    min: [0, 'Le prix doit être positif']
  },
  images: [{
    type: String
  }],
  categorie: {
    type: String,
    required: [true, 'Veuillez sélectionner une catégorie'],
    enum: {
      values: [
        'Vêtements',
        'Équipements',
        'Accessoires',
        'Nutrition',
        'Autres'
      ],
      message: 'Veuillez sélectionner une catégorie correcte'
    }
  },
  stock: {
    type: Number,
    required: [true, 'Veuillez entrer le stock disponible'],
    min: [0, 'Le stock ne peut pas être négatif'],
    default: 0
  },
  vendeur: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'vendeurModel'
  },
  vendeurModel: {
    type: String,
    required: true,
    enum: ['Club', 'Sponsor']
  },
  estVisible: {
    type: Boolean,
    default: true
  },
  notes: [{
    note: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    commentaire: {
      type: String,
      required: true
    },
    utilisateur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  notesMoyenne: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calcul de la note moyenne lors de l'ajout d'une nouvelle note
productSchema.pre('save', function(next) {
  if (this.isModified('notes')) {
    this.notesMoyenne = this.notes.reduce((acc, item) => item.note + acc, 0) / this.notes.length;
  }
  next();
});

export default mongoose.model('Product', productSchema); 