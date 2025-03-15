import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSpinner } from 'react-icons/fa';
import { Link } from '@tanstack/react-router';

interface Club {
  _id: string;
  raisonSociale: string;
  logo?: string;
  description?: string;
  sport?: string;
}

const ClubsPage = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/clubs');
        if (response.data.success) {
          setClubs(response.data.data);
        } else {
          throw new Error('Erreur lors du chargement des clubs');
        }
      } catch (err: any) {
        setError(err.response?.data?.error || 'Une erreur est survenue');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Clubs Sportifs</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clubs.map((club) => (
          <Link
            key={club._id}
            to={`/clubs/${club._id}`}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="aspect-w-16 aspect-h-9">
              {club.logo ? (
                <img
                  src={club.logo}
                  alt={club.raisonSociale}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-lg">{club.raisonSociale.charAt(0)}</span>
                </div>
              )}
            </div>
            
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{club.raisonSociale}</h2>
              {club.sport && (
                <p className="text-gray-600 mb-2">
                  Sport : {club.sport}
                </p>
              )}
              {club.description && (
                <p className="text-gray-600 line-clamp-2">
                  {club.description}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {clubs.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">Aucun club trouvé</p>
        </div>
      )}
    </div>
  );
};

export default ClubsPage; 