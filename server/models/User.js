import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
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
  password: {
    type: String,
    required: [true, 'Veuillez entrer un mot de passe'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  acceptRGPD: {
    type: Boolean,
    required: [true, 'Vous devez accepter les conditions RGPD']
  },
  acceptNewsletter: {
    type: Boolean,
    default: false
  },
  acceptSMS: {
    type: Boolean,
    default: false
  },
  sponsorsAbonnements: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sponsor'
  }],
  clubsAbonnements: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  avatar: {
    type: String,
    default: 'default.jpg'
  }
});

// Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id, role: 'user' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema); 