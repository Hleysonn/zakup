import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const sponsorSchema = new mongoose.Schema({
  raisonSociale: {
    type: String,
    required: [true, 'Veuillez entrer votre raison sociale']
  },
  nom: {
    type: String,
    required: [true, 'Veuillez entrer votre nom']
  },
  prenom: {
    type: String,
    required: [true, 'Veuillez entrer votre prénom']
  },
  email: {
    type: String,
    required: [true, 'Veuillez entrer votre email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Veuillez entrer un email valide'
    ]
  },
  telephone: {
    type: String,
    required: [true, 'Veuillez entrer votre numéro de téléphone']
  },
  adresse: {
    type: String,
    required: [true, 'Veuillez entrer votre adresse']
  },
  ville: {
    type: String,
    default: ''
  },
  codePostal: {
    type: String,
    default: ''
  },
  numeroTVA: {
    type: String,
    required: [true, 'Veuillez entrer votre numéro de TVA']
  },
  compteBancaire: {
    type: String,
    default: ''
  },
  password: {
    type: String,
    required: [true, 'Veuillez entrer un mot de passe'],
    minlength: 6,
    select: false
  },
  acceptRGPD: {
    type: Boolean,
    required: [true, 'Vous devez accepter les conditions RGPD']
  },
  logo: {
    type: String,
    default: 'default-sponsor.jpg'
  },
  description: {
    type: String,
    default: ''
  },
  clubsSponsored: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club'
  }],
  subscribers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt
sponsorSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
sponsorSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id, role: 'sponsor' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Match user entered password to hashed password in database
sponsorSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('Sponsor', sponsorSchema); 