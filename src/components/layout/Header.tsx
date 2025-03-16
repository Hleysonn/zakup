import { useState, useEffect } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { FaShoppingCart, FaUser, FaBars, FaTimes, FaSearch, FaChevronDown, FaSignOutAlt, FaTachometerAlt, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { CartModal } from '../cart/CartModal';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, userType, logout } = useAuth();
  const { items = [] } = useCart();
  const navigate = useNavigate();
  const [isAuth, setIsAuth] = useState(false);

  // Mettre à jour l'état d'authentification quand user change
  useEffect(() => {
    console.log("Header - User changed:", user);
    setIsAuth(!!user);
  }, [user]);

  // Forcer un re-render quand user change
  const [, updateState] = useState<object>({});
  useEffect(() => {
    console.log("Header - Force re-render, user:", user);
    updateState({});
  }, [user, userType]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate({ to: '/' });
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err);
    } finally {
      setIsUserMenuOpen(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate({ to: '/search', search: { q: searchQuery } });
    }
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  // Ferme le menu utilisateur si on clique ailleurs sur la page
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isUserMenuOpen && !target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const handleProfileClick = () => {
    console.log("Bouton Mon Profil cliqué, userType:", userType);
    setIsUserMenuOpen(false);
    if (userType === 'club') {
      console.log("Navigation vers /club/profile");
      navigate({ to: '/club/profile' });
    } else if (userType === 'sponsor') {
      console.log("Navigation vers /sponsor/profile");
      navigate({ to: '/sponsor/profile' });
    } else {
      console.log("Navigation vers /profile");
      navigate({ to: '/profile' });
    }
  };

  // Calculer le nombre total d'articles dans le panier
  const cartItemCount = items.reduce((total, item) => total + (item.quantite || 1), 0);

  return (
    <>
      <header className="sticky top-0 z-50 border-b shadow-sm bg-slate-900/80 border-slate-800 backdrop-blur-sm">
        <div className="container px-4 mx-auto">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold font-display text-primary">ZakUp</span>
            </Link>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 hidden max-w-xl mx-8 md:flex">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher des produits..."
                  className="w-full pl-10 input"
                />
                <FaSearch className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              </div>
            </form>

            {/* Navigation */}
            <nav className="items-center hidden space-x-8 md:flex">
              <Link to="/" className="nav-link">
                Accueil
              </Link>
              <Link to="/products" className="nav-link">
                Produits
              </Link>
              <Link to="/clubs" className="nav-link">
                Clubs
              </Link>
              <Link to="/sponsors" className="nav-link">
                Sponsors
              </Link>
            </nav>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              <button 
                onClick={toggleCart}
                className="relative p-3 hover:bg-slate-800 rounded-full transition-all duration-200"
                aria-label="Voir le panier d'achat"
              >
                <FaShoppingCart className="text-2xl text-white" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center w-7 h-7 text-sm font-bold text-white bg-red-600 rounded-full shadow-lg border-2 border-slate-900">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </button>

              {isAuth && user ? (
                <div className="relative user-menu-container">
                  <button 
                    onClick={toggleUserMenu}
                    className="flex items-center space-x-2 text-gray-200 transition-colors hover:text-primary"
                  >
                    <FaUserCircle className="text-xl" />
                    <span className="hidden md:inline">{user.nom}</span>
                    <FaChevronDown className="text-xs" />
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute right-0 z-50 w-48 py-1 mt-2 bg-white rounded-md shadow-lg">
                      {userType === 'club' && (
                        <>
                          <Link to="/club/dashboard" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            <FaTachometerAlt className="mr-2 text-gray-500" />
                            Dashboard Club
                          </Link>
                          <button 
                            onClick={handleProfileClick}
                            className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                          >
                            <FaUser className="mr-2 text-gray-500" />
                            Mon Profil
                          </button>
                        </>
                      )}
                      {userType === 'sponsor' && (
                        <>
                          <Link to="/sponsor/dashboard" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            <FaTachometerAlt className="mr-2 text-gray-500" />
                            Dashboard Sponsor
                          </Link>
                          <button 
                            onClick={handleProfileClick}
                            className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                          >
                            <FaUser className="mr-2 text-gray-500" />
                            Mon Profil
                          </button>
                        </>
                      )}
                      {userType !== 'club' && userType !== 'sponsor' && (
                        <button 
                          onClick={handleProfileClick}
                          className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                        >
                          <FaUser className="mr-2 text-gray-500" />
                          Mon Profil
                        </button>
                      )}
                      <Link to="/orders" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <FaShoppingCart className="mr-2 text-gray-500" />
                        Mes Commandes
                      </Link>
                      <hr className="my-1 border-gray-200" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-100"
                      >
                        <FaSignOutAlt className="mr-2" />
                        Se déconnecter
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link to="/login" className="text-gray-200 transition-colors hover:text-primary">
                    Se connecter
                  </Link>
                  <Link to="/register" className="px-4 py-2 text-white transition-colors rounded-md bg-primary hover:bg-primary-dark">
                    S'inscrire
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                className="text-gray-200 transition-colors md:hidden hover:text-primary"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="py-4 md:hidden">
              <div className="flex flex-col space-y-4">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher des produits..."
                    className="w-full pl-10 input"
                  />
                  <FaSearch className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                </form>
                <Link to="/" className="nav-link">
                  Accueil
                </Link>
                <Link to="/products" className="nav-link">
                  Produits
                </Link>
                <Link to="/clubs" className="nav-link">
                  Clubs
                </Link>
                <Link to="/sponsors" className="nav-link">
                  Sponsors
                </Link>
                {isAuth && user && (
                  <>
                    <hr className="my-2 border-gray-700" />
                    {userType === 'club' && (
                      <>
                        <Link to="/club/dashboard" className="flex items-center nav-link">
                          <FaTachometerAlt className="mr-2" />
                          Dashboard Club
                        </Link>
                        <button 
                          onClick={handleProfileClick}
                          className="flex items-center w-full text-left nav-link"
                        >
                          <FaUser className="mr-2" />
                          Mon Profil
                        </button>
                      </>
                    )}
                    {userType === 'sponsor' && (
                      <>
                        <Link to="/sponsor/dashboard" className="flex items-center nav-link">
                          <FaTachometerAlt className="mr-2" />
                          Dashboard Sponsor
                        </Link>
                        <button 
                          onClick={handleProfileClick}
                          className="flex items-center w-full text-left nav-link"
                        >
                          <FaUser className="mr-2" />
                          Mon Profil
                        </button>
                      </>
                    )}
                    {userType !== 'club' && userType !== 'sponsor' && (
                      <button 
                        onClick={handleProfileClick}
                        className="flex items-center w-full text-left nav-link"
                      >
                        <FaUser className="mr-2" />
                        Mon Profil
                      </button>
                    )}
                    <Link to="/orders" className="flex items-center nav-link">
                      <FaShoppingCart className="mr-2" />
                      Mes Commandes
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center text-red-500 nav-link"
                    >
                      <FaSignOutAlt className="mr-2" />
                      Se déconnecter
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Modal du panier */}
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}; 