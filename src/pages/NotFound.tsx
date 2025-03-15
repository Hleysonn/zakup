import { Link } from '@tanstack/react-router';
import { FaHome, FaSearch } from 'react-icons/fa';

const NotFound = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-8">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary">404</h1>
        <h2 className="text-3xl font-semibold mt-4 mb-6">Page non trouvée</h2>
        <p className="text-gray-600 max-w-md mx-auto mb-8">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="bg-primary text-white px-6 py-3 rounded-md hover:bg-primary/90 flex items-center justify-center"
          >
            <FaHome className="mr-2" /> Retour à l'accueil
          </Link>
          <Link
            to="/products"
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-md hover:bg-gray-300 flex items-center justify-center"
          >
            <FaSearch className="mr-2" /> Explorer les produits
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 