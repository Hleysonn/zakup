import mongoose from 'mongoose';

const FormuleSchema = new mongoose.Schema({
  club: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  nom: {
    type: String,
    required: [true, 'Veuillez ajouter un nom pour la formule'],
    trim: true,
    maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères']
  },
  prix: {
    type: Number,
    required: [true, 'Veuillez indiquer un prix mensuel'],
    min: [0, 'Le prix ne peut pas être négatif']
  },
  niveau: {
    type: String,
    enum: ['basic', 'premium', 'vip'],
    default: 'basic'
  },
  avantages: {
    type: [String],
    required: [true, 'Veuillez ajouter au moins un avantage']
  },
  recommande: {
    type: Boolean,
    default: false
  },
  iconType: {
    type: String,
    enum: ['medal', 'crown', 'trophy'],
    default: 'medal'
  },
  couleur: {
    type: String,
    enum: ['blue', 'purple', 'amber'],
    default: 'blue'
  }
}, {
  timestamps: true
});

// S'assurer qu'une seule formule peut être recommandée à la fois
FormuleSchema.pre('save', async function(next) {
  if (this.recommande) {
    await this.model('Formule').updateMany(
      { club: this.club, _id: { $ne: this._id }, recommande: true },
      { recommande: false }
    );
  }
  next();
});

export default mongoose.model('Formule', FormuleSchema); 