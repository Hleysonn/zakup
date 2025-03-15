import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import axios from 'axios';
import { FaUsers, FaSearch, FaSpinner, FaFutbol } from 'react-icons/fa';

// Configuration de base d'Axios
const api = axios.create({
  baseURL: 'http://localhost:5000',
  timeout: 5000,
});

interface Club {
  _id: string;
  raisonSociale: string;
  logo?: string;
  description?: string;
  sport?: string;
}

const Clubs = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState<string>('');
  const [sports, setSports] = useState<string[]>([]);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        setLoading(true);
        const response = await api.get('/clubs');
        setClubs(response.data.data);
        
        // Extraire la liste des sports pour le filtre
        const uniqueSports = [...new Set(response.data.data
          .map((club: Club) => club.sport)
          .filter((sport: string | undefined) => sport))];
        setSports(uniqueSports as string[]);
        
        setError(null);
      } catch (err) {
        setError('Erreur lors du chargement des clubs');
        console.error('Erreur lors du chargement des clubs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // La recherche est gérée côté client pour l'instant
  };

  const filteredClubs = clubs.filter(club => {
    const matchesSearch = 
      club.raisonSociale.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (club.description && club.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (club.sport && club.sport.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSport = selectedSport === '' || club.sport === selectedSport;
    
    return matchesSearch && matchesSport;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Clubs Sportifs</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <p className="text-gray-700 mb-6">
          Découvrez les clubs sportifs partenaires de notre plateforme. Soutenez vos clubs préférés en achetant leurs produits et en participant à leurs événements.
        </p>

        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <form onSubmit={handleSearch} className="flex flex-1">
            <input
              type="text"
              placeholder="Rechercher un club..."
              className="flex-grow px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              type="submit"
              className="bg-primary text-white px-4 py-2 rounded-r-md hover:bg-primary/90"
            >
              <FaSearch />
            </button>
          </form>
          
          <select
            value={selectedSport}
            onChange={(e) => setSelectedSport(e.target.value)}
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Tous les sports</option>
            {sports.map(sport => (
              <option key={sport} value={sport}>{sport}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-primary" size={40} />
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      ) : filteredClubs.length === 0 ? (
        <div className="bg-gray-100 border border-gray-300 text-gray-700 px-4 py-8 rounded text-center">
          <p className="text-lg">Aucun club trouvé</p>
          <p className="text-sm mt-2">Essayez de modifier votre recherche ou votre filtre</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map(club => (
            <Link
              key={club._id}
              to={`/clubs/${club._id}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="h-40 bg-gray-100 flex items-center justify-center">
                {club.logo ? (
                  <img
                    src={club.logo}
                    alt={club.raisonSociale}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <FaUsers className="text-gray-400" size={64} />
                )}
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{club.raisonSociale}</h2>
                
                {club.sport && (
                  <div className="flex items-center text-gray-600 mb-2">
                    <FaFutbol className="mr-2" />
                    <span>{club.sport}</span>
                  </div>
                )}
                
                {club.description && (
                  <p className="text-gray-600 line-clamp-2 mb-3">{club.description}</p>
                )}
                
                <div className="mt-4 text-primary font-medium hover:underline">
                  Voir les détails
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Clubs; 