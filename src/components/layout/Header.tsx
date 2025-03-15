import { useState, useEffect } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { FaShoppingCart, FaUser, FaBars, FaTimes, FaSearch, FaChevronDown, FaSignOutAlt, FaTachometerAlt, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
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

  return (
    <header className="bg-slate-900/80 shadow-sm border-b border-slate-800 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-display font-bold text-primary">ZakUp</span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher des produits..."
                className="input pl-10 w-full"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </form>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
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
            <Link to="/cart" className="relative">
              <FaShoppingCart className="text-xl text-gray-200 hover:text-primary transition-colors" />
              {items && items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Link>

            {isAuth && user ? (
              <div className="relative user-menu-container">
                <button 
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-2 text-gray-200 hover:text-primary transition-colors"
                >
                  <FaUserCircle className="text-xl" />
                  <span className="hidden md:inline">{user.nom}</span>
                  <FaChevronDown className="text-xs" />
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    {userType === 'sponsor' && (
                      <Link to="/sponsor/dashboard" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <FaTachometerAlt className="mr-2 text-gray-500" />
                        Dashboard Sponsor
                      </Link>
                    )}
                    {userType === 'club' && (
                      <Link to="/club/dashboard" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <FaTachometerAlt className="mr-2 text-gray-500" />
                        Dashboard Club
                      </Link>
                    )}
                    <Link to="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <FaUser className="mr-2 text-gray-500" />
                      Mon Profil
                    </Link>
                    <Link to="/orders" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <FaShoppingCart className="mr-2 text-gray-500" />
                      Mes Commandes
                    </Link>
                    <hr className="my-1 border-gray-200" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <FaSignOutAlt className="mr-2" />
                      Se déconnecter
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-200 hover:text-primary transition-colors">
                  Se connecter
                </Link>
                <Link to="/register" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors">
                  S'inscrire
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-gray-200 hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4">
            <div className="flex flex-col space-y-4">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher des produits..."
                  className="input pl-10 w-full"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
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
                  <hr className="border-gray-700 my-2" />
                  {userType === 'sponsor' && (
                    <Link to="/sponsor/dashboard" className="nav-link flex items-center">
                      <FaTachometerAlt className="mr-2" />
                      Dashboard Sponsor
                    </Link>
                  )}
                  {userType === 'club' && (
                    <Link to="/club/dashboard" className="nav-link flex items-center">
                      <FaTachometerAlt className="mr-2" />
                      Dashboard Club
                    </Link>
                  )}
                  <Link to="/profile" className="nav-link flex items-center">
                    <FaUser className="mr-2" />
                    Mon Profil
                  </Link>
                  <Link to="/orders" className="nav-link flex items-center">
                    <FaShoppingCart className="mr-2" />
                    Mes Commandes
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="nav-link flex items-center text-red-500"
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
  );
}; 