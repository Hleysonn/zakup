import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import axiosInstance from '../config/axios';
import { FaUsers, FaSearch, FaSpinner, FaMapMarkerAlt, FaArrowRight } from 'react-icons/fa';

interface Club {
  _id: string;
  raisonSociale: string;
  logo?: string;
  description?: string;
  sport?: string;
  ville?: string;
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
      
      
      <div className="mb-8 flex justify-between items-center ">
      <h1 className="mb-6 text-3xl font-bold">Clubs Sportifs</h1>
        {/* <p className="mb-6 text-gray-700">
          Découvrez les clubs sportifs partenaires de notre plateforme. Soutenez vos clubs préférés en achetant leurs produits et en participant à leurs événements.
        </p> */}

        <div className="flex flex-col gap-4 mb-4 md:flex-row">
          <form onSubmit={handleSearch} className="w-full md:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher un club..."
                className="w-full md:w-80 px-4 py-2 pr-10 border border-gray-700 bg-slate-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
              >
                <FaSearch />
              </button>
            </div>
          </form>
          
          <select
            value={selectedSport}
            onChange={(e) => setSelectedSport(e.target.value)}
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-slate-500"
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
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 w-[80%]">
          {filteredClubs.map(club => (
            <Link
              key={club._id}
              to={`/clubs/${club._id}`}
              className="overflow-hidden bg-slate-800 rounded-xl border border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              <div className="relative">
                {club.logo ? (
                  <div className="w-full aspect-[16/9] bg-slate-900 flex items-center justify-center overflow-hidden">
                    <img
                      src={club.logo}
                      alt={club.raisonSociale}
                      className="object-contain w-full h-full max-h-40 group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-[16/9] flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900">
                    <FaUsers className="text-4xl text-gray-400" />
                  </div>
                )}
                
                {club.sport && (
                  <div className="absolute top-3 left-3 px-3 py-1 text-sm font-medium text-white bg-primary/80 backdrop-blur-sm rounded-full shadow-md">
                    <span>{club.sport}</span>
                  </div>
                )}
              </div>
              
              <div className="p-5">
                <h2 className="mb-3 text-xl font-bold text-white group-hover:text-primary transition-colors">{club.raisonSociale}</h2>
                
                {club.description && (
                  <p className="mb-4 text-gray-300 line-clamp-2">{club.description}</p>
                )}
                
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center text-sm text-gray-400">
                    <FaMapMarkerAlt className="mr-1" />
                    <span>{club.ville || "Lieu non spécifié"}</span>
                  </div>
                  
                  <div className="inline-flex items-center font-medium text-primary group-hover:translate-x-1 transition-transform">
                    Voir les détails
                    <FaArrowRight className="ml-1 text-xs" />
                  </div>
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