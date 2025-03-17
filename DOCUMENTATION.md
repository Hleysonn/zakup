# ZakUp - Documentation

## Table des matières
1. [Vue d'ensemble](#vue-densemble)
2. [Technologies utilisées](#technologies-utilisées)
3. [Architecture](#architecture)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [Structure du projet](#structure-du-projet)
7. [API Backend](#api-backend)
8. [Frontend](#frontend)
9. [Déploiement](#déploiement)

## Vue d'ensemble

ZakUp est une application web moderne de type e-commerce qui permet la gestion de produits, commandes, sponsors et clubs. L'application est construite avec une architecture full-stack utilisant Node.js pour le backend et React pour le frontend.

## Technologies utilisées

### Backend
- **Node.js** avec **Express.js**
- **MongoDB** avec **Mongoose** pour la base de données
- **JWT** pour l'authentification
- **bcryptjs** pour le hachage des mots de passe
- **cors** pour la gestion des requêtes cross-origin

### Frontend
- **React** (v19) avec **TypeScript**
- **Vite** comme bundler
- **TanStack Router** pour le routage
- **TanStack Query** pour la gestion des requêtes API
- **Tailwind CSS** pour le styling
- **Framer Motion** pour les animations
- **React Hook Form** pour la gestion des formulaires
- **Zod** pour la validation des données
- **Recharts** pour les visualisations de données

## Architecture

L'application suit une architecture moderne avec séparation claire entre le frontend et le backend :

### Backend (server/)
- **MVC (Model-View-Controller)**
  - `models/` : Schémas et modèles Mongoose
  - `controllers/` : Logique métier
  - `routes/` : Définition des endpoints API
  - `middleware/` : Fonctions middleware (auth, validation, etc.)
  - `config/` : Configuration de la base de données et autres
  - `utils/` : Fonctions utilitaires

### Frontend (src/)
- **Architecture basée sur les composants**
  - `components/` : Composants réutilisables
  - `pages/` : Pages de l'application
  - `context/` : Contextes React (Auth, Cart)
  - `hooks/` : Hooks personnalisés
  - `api/` : Services et appels API
  - `styles/` : Styles globaux et utilitaires CSS

## Installation

1. Cloner le repository :
```bash
git clone [url-du-repo]
cd zakup
```

2. Installer les dépendances :
```bash
# Installation des dépendances du projet principal
npm install

# Installation des dépendances du serveur
cd server
npm install
```

3. Configurer les variables d'environnement :
- Créer un fichier `.env` à la racine du projet
- Créer un fichier `.env` dans le dossier `server/`

## Configuration

### Variables d'environnement principales (.env)
```env
VITE_API_URL=http://localhost:5000
```

### Variables d'environnement du serveur (server/.env)
```env
PORT=5000
MONGODB_URI=votre_uri_mongodb
JWT_SECRET=votre_secret_jwt
NODE_ENV=development
```

## Structure du projet

```
zakup/
├── src/                    # Code source frontend
│   ├── components/         # Composants React
│   ├── pages/             # Pages de l'application
│   ├── context/           # Contextes React
│   ├── hooks/             # Hooks personnalisés
│   ├── api/               # Services API
│   └── styles/            # Styles CSS
├── server/                 # Code source backend
│   ├── controllers/       # Contrôleurs
│   ├── models/           # Modèles Mongoose
│   ├── routes/           # Routes API
│   ├── middleware/       # Middleware
│   └── config/           # Configuration
├── public/                # Fichiers statiques
└── package.json          # Dépendances et scripts
```

## API Backend

### Points d'entrée API

#### Authentification
- `POST /api/auth/register` : Inscription
- `POST /api/auth/login` : Connexion
- `POST /api/auth/logout` : Déconnexion

#### Utilisateurs
- `GET /api/users` : Liste des utilisateurs
- `GET /api/users/:id` : Détails d'un utilisateur
- `PUT /api/users/:id` : Mise à jour d'un utilisateur
- `DELETE /api/users/:id` : Suppression d'un utilisateur

#### Produits
- `GET /api/products` : Liste des produits
- `POST /api/products` : Création d'un produit
- `GET /api/products/:id` : Détails d'un produit
- `PUT /api/products/:id` : Mise à jour d'un produit
- `DELETE /api/products/:id` : Suppression d'un produit

#### Commandes
- `GET /api/orders` : Liste des commandes
- `POST /api/orders` : Création d'une commande
- `GET /api/orders/:id` : Détails d'une commande

#### Sponsors
- `GET /api/sponsors` : Liste des sponsors
- `POST /api/sponsors` : Ajout d'un sponsor
- `GET /api/sponsors/:id` : Détails d'un sponsor
- `PUT /api/sponsors/:id` : Mise à jour d'un sponsor
- `DELETE /api/sponsors/:id` : Suppression d'un sponsor

#### Clubs
- `GET /api/clubs` : Liste des clubs
- `POST /api/clubs` : Création d'un club
- `GET /api/clubs/:id` : Détails d'un club
- `PUT /api/clubs/:id` : Mise à jour d'un club
- `DELETE /api/clubs/:id` : Suppression d'un club

## Frontend

### Routes principales
- `/` : Page d'accueil
- `/products` : Liste des produits
- `/products/:id` : Détails d'un produit
- `/sponsors` : Liste des sponsors
- `/clubs` : Liste des clubs
- `/profile` : Profil utilisateur
- `/cart` : Panier d'achat
- `/orders` : Historique des commandes

### Contextes
- `AuthContext` : Gestion de l'authentification
- `CartContext` : Gestion du panier d'achat

### Composants principaux
- `Layout` : Layout principal de l'application
- `Navbar` : Barre de navigation
- `ProductCard` : Carte de produit
- `CartItem` : Élément du panier
- `OrderSummary` : Résumé de commande

## Déploiement

### Prérequis
- Node.js v18 ou supérieur
- MongoDB
- npm ou yarn

### Build de production
```bash
# Build du frontend
npm run build

# Démarrage du serveur en production
NODE_ENV=production npm run server
```

### Scripts disponibles
- `npm run dev` : Démarre le serveur de développement frontend
- `npm run server` : Démarre le serveur backend
- `npm run build` : Build de production
- `npm run lint` : Vérifie le code avec ESLint
- `npm run preview` : Preview de la build de production

## Sécurité

L'application implémente plusieurs mesures de sécurité :
- Authentification JWT
- Hachage des mots de passe avec bcrypt
- Protection CORS
- Validation des données avec Zod
- Middleware d'authentification pour les routes protégées

## Contribution

1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request 

## Exemples de Code

### Modèles Backend

#### Exemple de modèle utilisateur (server/models/User.js)
```javascript
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Le nom d\'utilisateur est requis'],
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email invalide']
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],
    select: false // Ne pas inclure par défaut dans les requêtes
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hacher le mot de passe avant la sauvegarde
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
```

### Contrôleurs Backend

#### Exemple de contrôleur d'authentification (server/controllers/authController.js)
```javascript
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// @desc    Inscription d'un utilisateur
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Vérifier si l'utilisateur existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cet email est déjà utilisé' 
      });
    }

    // Créer l'utilisateur
    const user = await User.create({
      username,
      email,
      password
    });

    // Générer le token
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'inscription'
    });
  }
};
```

### Middleware Backend

#### Exemple de middleware d'authentification (server/middleware/auth.js)
```javascript
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    // Vérifier le token dans les headers
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé - Token manquant'
      });
    }

    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Non autorisé - Token invalide'
    });
  }
};
```

### Composants Frontend

#### Exemple de contexte d'authentification (src/context/AuthContext.tsx)
```typescript
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérifier le token au chargement
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const { data } = await axios.get('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(data.user);
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await axios.post('/api/auth/login', {
      email,
      password
    });
    localStorage.setItem('token', data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};
```

#### Exemple de composant protégé (src/components/ProtectedRoute.tsx)
```typescript
import { Navigate, useLocation } from '@tanstack/react-router';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ 
  children, 
  requireAdmin = false 
}: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
```

### Hooks Personnalisés

#### Exemple de hook de requête (src/hooks/useProducts.ts)
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Product } from '../types';

export const useProducts = () => {
  const queryClient = useQueryClient();

  // Récupérer tous les produits
  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await axios.get('/api/products');
      return data.products;
    }
  });

  // Ajouter un produit
  const addProduct = useMutation({
    mutationFn: async (newProduct: Omit<Product, 'id'>) => {
      const { data } = await axios.post('/api/products', newProduct);
      return data.product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });

  // Supprimer un produit
  const deleteProduct = useMutation({
    mutationFn: async (productId: string) => {
      await axios.delete(`/api/products/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });

  return {
    products,
    isLoading,
    addProduct,
    deleteProduct
  };
}; 