import express from 'express';
import dotenv from 'dotenv';
import colors from 'colors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import sponsorRoutes from './routes/sponsorRoutes.js';
import clubRoutes from './routes/clubRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
// import errorHandler from './middleware/error.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement
dotenv.config();

// Connexion à la base de données
connectDB();

const app = express();

// Middleware de base
app.use(express.json());
app.use(cookieParser());

// Configuration CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Log toutes les requêtes en développement
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
}

// Servir les fichiers statiques - configuration la plus simple possible
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes API
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/sponsors', sponsorRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Simple error handler
app.use((err, req, res, next) => {
  console.error('Erreur:'.red, err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Erreur serveur'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT} en mode ${process.env.NODE_ENV}`.yellow.bold);
}); 