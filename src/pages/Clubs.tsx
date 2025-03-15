import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import axiosInstance from '../config/axios';
import { FaUsers, FaSearch, FaSpinner, FaFutbol } from 'react-icons/fa';

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
        const response = await axiosInstance.get('/api/clubs');
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
    <div className="container px-4 py-8 mx-auto">
      <h1 className="mb-6 text-3xl font-bold">Clubs Sportifs</h1>
      
      <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
        <p className="mb-6 text-gray-700">
          Découvrez les clubs sportifs partenaires de notre plateforme. Soutenez vos clubs préférés en achetant leurs produits et en participant à leurs événements.
        </p>

        <div className="flex flex-col gap-4 mb-4 md:flex-row">
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
              className="px-4 py-2 text-white bg-primary rounded-r-md hover:bg-primary/90"
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
        <div className="flex items-center justify-center h-64">
          <FaSpinner className="animate-spin text-primary" size={40} />
        </div>
      ) : error ? (
        <div className="px-4 py-3 text-red-700 bg-red-100 border border-red-400 rounded">
          <p>{error}</p>
        </div>
      ) : filteredClubs.length === 0 ? (
        <div className="px-4 py-8 text-center text-gray-700 bg-gray-100 border border-gray-300 rounded">
          <p className="text-lg">Aucun club trouvé</p>
          <p className="mt-2 text-sm">Essayez de modifier votre recherche ou votre filtre</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredClubs.map(club => (
            <Link
              key={club._id}
              to={`/clubs/${club._id}`}
              className="overflow-hidden transition-shadow bg-white rounded-lg shadow-md hover:shadow-lg"
            >
              <div className="flex items-center justify-center h-40 bg-gray-100">
                {club.logo ? (
                  <img
                    src={club.logo}
                    alt={club.raisonSociale}
                    className="object-contain max-w-full max-h-full"
                  />
                ) : (
                  <FaUsers className="text-gray-400" size={64} />
                )}
              </div>
              <div className="p-4">
                <h2 className="mb-2 text-xl font-semibold">{club.raisonSociale}</h2>
                
                {club.sport && (
                  <div className="flex items-center mb-2 text-gray-600">
                    <FaFutbol className="mr-2" />
                    <span>{club.sport}</span>
                  </div>
                )}
                
                {club.description && (
                  <p className="mb-3 text-gray-600 line-clamp-2">{club.description}</p>
                )}
                
                <div className="mt-4 font-medium text-primary hover:underline">
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