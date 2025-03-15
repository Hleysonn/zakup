import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import axios from 'axios';
import { FaSearch, FaSpinner, FaExclamationTriangle, FaBuilding } from 'react-icons/fa';

interface Sponsor {
  _id: string;
  raisonSociale: string;
  logo?: string;
  description: string;
}

const Sponsors = () => {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [filteredSponsors, setFilteredSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/sponsors');
        setSponsors(response.data.data);
        setFilteredSponsors(response.data.data);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des sponsors:', err);
        setError('Impossible de charger la liste des sponsors');
      } finally {
        setLoading(false);
      }
    };

    fetchSponsors();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredSponsors(sponsors);
    } else {
      const filtered = sponsors.filter(sponsor => 
        sponsor.raisonSociale.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sponsor.description && sponsor.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredSponsors(filtered);
    }
  }, [searchTerm, sponsors]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // La recherche est déjà gérée par l'effet ci-dessus
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <FaSpinner className="animate-spin text-4xl text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <FaExclamationTriangle className="text-red-500 text-5xl mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          {error}
        </h1>
        <p className="text-gray-600 mb-6">
          Veuillez réessayer ultérieurement ou contacter le support.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Découvrez nos sponsors</h1>
        
        <form onSubmit={handleSearch} className="w-full md:w-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher un sponsor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-80 px-4 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            >
              <FaSearch />
            </button>
          </div>
        </form>
      </div>

      {filteredSponsors.length === 0 ? (
        <div className="text-center py-12">
          <FaBuilding className="text-gray-300 text-5xl mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Aucun sponsor trouvé</h2>
          <p className="text-gray-500">
            Aucun sponsor ne correspond à votre recherche. Essayez des termes différents.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredSponsors.map(sponsor => (
            <Link
              key={sponsor._id}
              to={`/sponsors/${sponsor._id}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="h-48 bg-gray-100 flex items-center justify-center p-4">
                {sponsor.logo ? (
                  <img
                    src={sponsor.logo}
                    alt={sponsor.raisonSociale}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <FaBuilding className="text-gray-300" size={64} />
                )}
              </div>
              
              <div className="p-4">
                <h2 className="text-xl font-bold mb-2 text-gray-800">{sponsor.raisonSociale}</h2>
                <p className="text-gray-600 line-clamp-3">
                  {sponsor.description || 'Aucune description disponible.'}
                </p>
              </div>
              
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                <span className="text-primary font-medium">Voir les détails</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sponsors; 