import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { FaSearch, FaShoppingCart, FaUsers, FaBuilding, FaFootballBall, FaTshirt, FaAppleAlt, FaRunning } from 'react-icons/fa';
import ProductList from '../components/products/ProductList';

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // La recherche sera gérée par la redirection vers la page des produits
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section avec fond dégradé */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary to-secondary">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container relative px-4 py-24 mx-auto">
          <div className="max-w-4xl mx-auto space-y-8 text-center text-white">
            <h1 className="text-5xl font-bold leading-tight md:text-6xl font-display">
              La Marketplace du Sport
            </h1>
            <p className="text-xl md:text-2xl text-white/90">
              Découvrez des produits sportifs de qualité, soutenez vos clubs préférés et connectez-vous avec des sponsors passionnés.
            </p>
            {/* <form onSubmit={handleSearch} className="max-w-xl px-4 mx-auto mt-8 sm:px-0">
              <div className="flex flex-col p-1 bg-white rounded-lg shadow-lg sm:flex-row">
                <input
                  type="text"
                  placeholder="Que recherchez-vous ?"
                  className="w-full px-3 py-2 text-sm text-gray-800 bg-transparent rounded-md sm:flex-1 sm:px-4 focus:outline-none sm:rounded-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Link
                  to="/products"
                  search={{ search: searchTerm }}
                  className="flex items-center justify-center w-full px-3 py-2 mt-2 space-x-2 text-white transition-colors rounded-md sm:w-auto sm:mt-0 bg-primary sm:px-6 hover:bg-primary/90 sm:justify-start"
                >
                  <FaSearch className="text-sm sm:text-base" />
                  <span className="text-sm sm:text-base">Rechercher</span>
                </Link>
              </div>
            </form> */}
          </div>
        </div>
      </section>

      {/* Catégories avec design amélioré */}
      <section className="px-4 py-16 bg-slate-500">
        <div className="container max-w-6xl mx-auto">
          <h2 className="mb-12 text-3xl font-bold text-center md:text-4xl">
            Explorez nos catégories
          </h2>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-5">
            <Link
              to="/products"
              search={{ categorie: 'Vêtements' }}
              className="group"
            >
              <div className="p-6 text-center transition-all duration-200 transform bg-white rounded-xl shadow-soft hover:-translate-y-1 hover:shadow-lg">
                <div className="flex justify-center mb-4 text-4xl text-primary">
                  <FaTshirt className="transition-transform duration-200 transform group-hover:scale-110 text-slate-500" />
                </div>
                <h3 className="font-semibold text-gray-800">Vêtements</h3>
              </div>
            </Link>
            
            <Link
              to="/products"
              search={{ categorie: 'Équipements' }}
              className="group"
            >
              <div className="p-6 text-center transition-all duration-200 transform bg-white rounded-xl shadow-soft hover:-translate-y-1 hover:shadow-lg">
                <div className="flex justify-center mb-4 text-4xl text-primary">
                  <FaFootballBall className="transition-transform duration-200 transform group-hover:scale-110 text-slate-500" />
                </div>
                <h3 className="font-semibold text-gray-800">Équipements</h3>
              </div>
            </Link>

            <Link
              to="/products"
              search={{ categorie: 'Accessoires' }}
              className="group"
            >
              <div className="p-6 text-center transition-all duration-200 transform bg-white rounded-xl shadow-soft hover:-translate-y-1 hover:shadow-lg">
                <div className="flex justify-center mb-4 text-4xl text-primary">
                  <FaRunning className="transition-transform duration-200 transform group-hover:scale-110 text-slate-500" />
                </div>
                <h3 className="font-semibold text-gray-800">Accessoires</h3>
              </div>
            </Link>

            <Link
              to="/products"
              search={{ categorie: 'Nutrition' }}
              className="group"
            >
              <div className="p-6 text-center transition-all duration-200 transform bg-white rounded-xl shadow-soft hover:-translate-y-1 hover:shadow-lg">
                <div className="flex justify-center mb-4 text-4xl text-primary">
                  <FaAppleAlt className="transition-transform duration-200 transform group-hover:scale-110 text-slate-500" />
                </div>
                <h3 className="font-semibold text-gray-800">Nutrition</h3>
              </div>
            </Link>

            <Link
              to="/products"
              search={{ categorie: 'Autres' }}
              className="group"
            >
              <div className="p-6 text-center transition-all duration-200 transform bg-white rounded-xl shadow-soft hover:-translate-y-1 hover:shadow-lg">
                <div className="flex justify-center mb-4 text-4xl text-primary">
                  <FaShoppingCart className="transition-transform duration-200 transform group-hover:scale-110 text-slate-500" />
                </div>
                <h3 className="font-semibold text-gray-800">Autres</h3>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Produits populaires */}
      <section className="px-4 py-16">
        <div className="container max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold md:text-4xl">Produits populaires</h2>
            <Link
              to="/products"
              className="flex items-center space-x-2 font-semibold transition-colors text-primary hover:text-primary/80"
            >
              <span>Voir tous les produits</span>
              <span className="text-xl">→</span>
            </Link>
          </div>
          
          <ProductList />
        </div>
      </section>

      {/* Sponsors et Clubs avec design amélioré */}
      <section className="px-4 py-16 bg-slate-500">
        <div className="container max-w-6xl mx-auto">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="group">
              <div className="p-8 transition-all duration-200 bg-white rounded-xl shadow-soft hover:-translate-y-1 hover:shadow-lg">
                <div className="flex items-center justify-center mb-6">
                  <div className="text-6xl transition-transform duration-200 transform text-primary group-hover:scale-110 text-slate-500">
                    <FaBuilding />
                  </div>
                </div>
                <h3 className="mb-4 text-2xl font-bold text-center text-slate-500">Sponsors Vedettes</h3>
                <p className="mb-8 text-center text-gray-600">
                  Découvrez nos sponsors qui soutiennent le monde du sport. Des marques reconnues aux entreprises locales engagées.
                </p>
                <Link
                  to="/sponsors"
                  className="block px-6 py-3 font-semibold text-center text-white transition-colors rounded-lg bg-slate-500 hover:bg-slate-900/90 hover:scale-105"
                >
                  Explorer les sponsors
                </Link>
              </div>
            </div>
            
            <div className="group">
              <div className="p-8 transition-all duration-200 bg-white rounded-xl shadow-soft hover:-translate-y-1 hover:shadow-lg">
                <div className="flex items-center justify-center mb-6">
                  <div className="text-6xl transition-transform duration-200 transform text-primary group-hover:scale-110 text-slate-500">
                    <FaUsers />
                  </div>
                </div>
                <h3 className="mb-4 text-2xl font-bold text-center text-slate-500">Clubs Sportifs</h3>
                <p className="mb-8 text-center text-gray-600">
                  Soutenez vos clubs sportifs préférés en achetant leurs produits et en participant à leurs événements.
                </p>
                <Link
                  to="/clubs"
                  className="block px-6 py-3 font-semibold text-center text-white transition-colors rounded-lg bg-slate-500 hover:bg-slate-900/90 hover:scale-105"
                >
                  Découvrir les clubs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action amélioré */}
      <section className="px-4 py-16 text-white bg-gradient-to-br from-primary to-secondary">
        <div className="container max-w-4xl mx-auto text-center">
          <h2 className="mb-6 text-3xl font-bold md:text-4xl">Rejoignez notre communauté</h2>
          <p className="max-w-2xl mx-auto mb-12 text-xl text-white/90">
            Inscrivez-vous aujourd'hui pour accéder à des offres exclusives et soutenir vos clubs préférés.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              to="/register"
              className="px-8 py-3 text-lg font-semibold text-white transition-colors bg-transparent border-2 border-white rounded-lg hover:bg-white/10 hover:scale-102"
            >
              S'inscrire gratuitement
            </Link>
            <Link
              to="/login"
              className="px-8 py-3 text-lg font-semibold text-white transition-colors bg-transparent border-2 border-white rounded-lg hover:bg-white/10 hover:scale-102"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 