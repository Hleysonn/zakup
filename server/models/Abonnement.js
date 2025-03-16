import mongoose from 'mongoose';

const AbonnementSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  club: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: true
  },
  formule: {
    type: String,
    enum: ['basic', 'premium', 'vip'],
    required: true
  },
  montantMensuel: {
    type: Number,
    required: true
  },
  dateDebut: {
    type: Date,
    default: Date.now
  },
  actif: {
    type: Boolean,
    default: true
  },
  dateDernierPaiement: {
    type: Date,
    default: Date.now
  },
  dateProchainPaiement: {
    type: Date,
    default: function() {
      const date = new Date();
      date.setMonth(date.getMonth() + 1);
      return date;
    }
  }
}, {
  timestamps: true
});

export default mongoose.model('Abonnement', AbonnementSchema); 