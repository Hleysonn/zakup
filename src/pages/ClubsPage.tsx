import { useState, useEffect } from 'react';
import axiosInstance from '../config/axios';
import { FaSpinner } from 'react-icons/fa';
import { Link } from '@tanstack/react-router';
import { AxiosError } from 'axios';

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
        const response = await axiosInstance.get('/api/clubs');
        if (response.data.success) {
          setClubs(response.data.data);
        } else {
          throw new Error('Erreur lors du chargement des clubs');
        }
      } catch (err) {
        if (err instanceof AxiosError) {
          setError(err.response?.data?.error || err.message || 'Une erreur est survenue');
          console.error('Erreur Axios:', err.response?.data);
        } else {
          setError('Une erreur inattendue est survenue');
          console.error('Erreur:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FaSpinner className="text-4xl animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <div className="px-4 py-3 text-red-700 bg-red-100 border border-red-400 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <h1 className="mb-8 text-3xl font-bold">Clubs Sportifs</h1>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {clubs.map((club) => (
          <Link
            key={club._id}
            to={`/clubs/${club._id}`}
            className="overflow-hidden transition-shadow bg-white rounded-lg shadow-md hover:shadow-lg"
          >
            <div className="aspect-w-16 aspect-h-9">
              {club.logo ? (
                <img
                  src={club.logo}
                  alt={club.raisonSociale}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-gray-200">
                  <span className="text-lg text-gray-400">{club.raisonSociale.charAt(0)}</span>
                </div>
              )}
            </div>
            
            <div className="p-4">
              <h2 className="mb-2 text-xl font-semibold">{club.raisonSociale}</h2>
              {club.sport && (
                <p className="mb-2 text-gray-600">
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
        <div className="py-8 text-center">
          <p className="text-gray-600">Aucun club trouvé</p>
        </div>
      )}
    </div>
  );
};

export default ClubsPage; 