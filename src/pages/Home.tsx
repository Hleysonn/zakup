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
      <section className="relative bg-gradient-to-br from-primary to-secondary overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto text-center text-white space-y-8">
            <h1 className="text-5xl md:text-6xl font-bold font-display leading-tight">
              La Marketplace du Sport
            </h1>
            <p className="text-xl md:text-2xl text-white/90">
              Découvrez des produits sportifs de qualité, soutenez vos clubs préférés et connectez-vous avec des sponsors passionnés.
            </p>
            <form onSubmit={handleSearch} className="max-w-xl mx-auto mt-8 px-4 sm:px-0">
              <div className="flex flex-col sm:flex-row bg-white rounded-lg shadow-lg p-1">
                <input
                  type="text"
                  placeholder="Que recherchez-vous ?"
                  className="w-full sm:flex-1 px-3 sm:px-4 py-2 text-gray-800 bg-transparent focus:outline-none text-sm rounded-md sm:rounded-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Link
                  to="/products"
                  search={{ search: searchTerm }}
                  className="w-full sm:w-auto mt-2 sm:mt-0 bg-primary text-white px-3 sm:px-6 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center sm:justify-start space-x-2"
                >
                  <FaSearch className="text-sm sm:text-base" />
                  <span className="text-sm sm:text-base">Rechercher</span>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Catégories avec design amélioré */}
      <section className="py-16 px-4 bg-slate-500">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Explorez nos catégories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <Link
              to="/products"
              search={{ categorie: 'Vêtements' }}
              className="group"
            >
              <div className="bg-white rounded-xl shadow-soft p-6 text-center transform transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                <div className="text-primary text-4xl mb-4 flex justify-center">
                  <FaTshirt className="transform transition-transform group-hover:scale-110 duration-200 text-slate-500" />
                </div>
                <h3 className="font-semibold text-gray-800">Vêtements</h3>
              </div>
            </Link>
            
            <Link
              to="/products"
              search={{ categorie: 'Équipements' }}
              className="group"
            >
              <div className="bg-white rounded-xl shadow-soft p-6 text-center transform transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                <div className="text-primary text-4xl mb-4 flex justify-center">
                  <FaFootballBall className="transform transition-transform group-hover:scale-110 duration-200 text-slate-500" />
                </div>
                <h3 className="font-semibold text-gray-800">Équipements</h3>
              </div>
            </Link>

            <Link
              to="/products"
              search={{ categorie: 'Accessoires' }}
              className="group"
            >
              <div className="bg-white rounded-xl shadow-soft p-6 text-center transform transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                <div className="text-primary text-4xl mb-4 flex justify-center">
                  <FaRunning className="transform transition-transform group-hover:scale-110 duration-200 text-slate-500" />
                </div>
                <h3 className="font-semibold text-gray-800">Accessoires</h3>
              </div>
            </Link>

            <Link
              to="/products"
              search={{ categorie: 'Nutrition' }}
              className="group"
            >
              <div className="bg-white rounded-xl shadow-soft p-6 text-center transform transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                <div className="text-primary text-4xl mb-4 flex justify-center">
                  <FaAppleAlt className="transform transition-transform group-hover:scale-110 duration-200 text-slate-500" />
                </div>
                <h3 className="font-semibold text-gray-800">Nutrition</h3>
              </div>
            </Link>

            <Link
              to="/products"
              search={{ categorie: 'Autres' }}
              className="group"
            >
              <div className="bg-white rounded-xl shadow-soft p-6 text-center transform transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                <div className="text-primary text-4xl mb-4 flex justify-center">
                  <FaShoppingCart className="transform transition-transform group-hover:scale-110 duration-200 text-slate-500" />
                </div>
                <h3 className="font-semibold text-gray-800">Autres</h3>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Produits populaires */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Produits populaires</h2>
            <Link
              to="/products"
              className="text-primary hover:text-primary/80 font-semibold transition-colors flex items-center space-x-2"
            >
              <span>Voir tous les produits</span>
              <span className="text-xl">→</span>
            </Link>
          </div>
          
          <ProductList />
        </div>
      </section>

      {/* Sponsors et Clubs avec design amélioré */}
      <section className="py-16 px-4 bg-slate-500">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="group">
              <div className="bg-white rounded-xl shadow-soft p-8 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                <div className="flex items-center justify-center mb-6">
                  <div className="text-primary text-6xl transform transition-transform group-hover:scale-110 duration-200 text-slate-500">
                    <FaBuilding />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-center mb-4 text-slate-500">Sponsors Vedettes</h3>
                <p className="text-center text-gray-600 mb-8">
                  Découvrez nos sponsors qui soutiennent le monde du sport. Des marques reconnues aux entreprises locales engagées.
                </p>
                <Link
                  to="/sponsors"
                  className="block text-center bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary/90 transition-colors font-semibold"
                >
                  Explorer les sponsors
                </Link>
              </div>
            </div>
            
            <div className="group">
              <div className="bg-white rounded-xl shadow-soft p-8 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                <div className="flex items-center justify-center mb-6">
                  <div className="text-primary text-6xl transform transition-transform group-hover:scale-110 duration-200 text-slate-500">
                    <FaUsers />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-center mb-4 text-slate-500">Clubs Sportifs</h3>
                <p className="text-center text-gray-600 mb-8">
                  Soutenez vos clubs sportifs préférés en achetant leurs produits et en participant à leurs événements.
                </p>
                <Link
                  to="/clubs"
                  className="block text-center bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary/90 transition-colors font-semibold"
                >
                  Découvrir les clubs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action amélioré */}
      <section className="py-16 px-4 bg-gradient-to-br from-primary to-secondary text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Rejoignez notre communauté</h2>
          <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
            Inscrivez-vous aujourd'hui pour accéder à des offres exclusives et soutenir vos clubs préférés.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-primary px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg"
            >
              S'inscrire gratuitement
            </Link>
            <Link
              to="/login"
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg hover:bg-white/10 transition-colors font-semibold text-lg"
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