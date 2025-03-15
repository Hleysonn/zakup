import { useState, useEffect } from 'react';
import { useParams, Link } from '@tanstack/react-router';
import axiosInstance from '../config/axios';
import { FaArrowLeft, FaSpinner, FaExclamationTriangle, FaStar, FaUsers, FaPhone, FaEnvelope, FaBuilding, FaFutbol } from 'react-icons/fa';
import ProductList from '../components/products/ProductList';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

interface Club {
  _id: string;
  raisonSociale: string;
  logo?: string;
  description?: string;
  sport?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
}

const ClubDetail = () => {
  const { clubId } = useParams({ from: '/clubs/$clubId' });
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchClubDetails = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/api/clubs/${clubId}`);
        setClub(response.data.data);
        setError(null);
      } catch (err) {
        setError('Erreur lors du chargement des détails du club');
        console.error('Erreur lors du chargement des détails du club:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClubDetails();
  }, [clubId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <FaSpinner className="animate-spin text-4xl text-primary" />
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center">
          <FaExclamationTriangle className="mr-2" />
          <span>{error || 'Club non trouvé'}</span>
        </div>
        <Link
          to="/clubs"
          className="mt-4 inline-flex items-center text-primary hover:text-primary/80"
        >
          <FaArrowLeft className="mr-2" /> Retour aux clubs
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        to="/clubs"
        className="inline-flex items-center text-primary hover:text-primary/80 mb-6"
      >
        <FaArrowLeft className="mr-2" /> Retour aux clubs
      </Link>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="md:flex">
          <div className="md:w-1/3 bg-gray-100 p-6 flex items-center justify-center">
            {club.logo ? (
              <img
                src={club.logo}
                alt={club.raisonSociale}
                className="max-w-full h-auto rounded-lg"
              />
            ) : (
              <div className="w-48 h-48 bg-gray-200 rounded-full flex items-center justify-center">
                <FaUsers className="text-gray-400 text-6xl" />
              </div>
            )}
          </div>
          
          <div className="md:w-2/3 p-6">
            <h1 className="text-3xl font-bold mb-4">{club.raisonSociale}</h1>
            
            {club.sport && (
              <div className="flex items-center mb-4 text-gray-600">
                <FaFutbol className="mr-2" />
                <span>{club.sport}</span>
              </div>
            )}
            
            {club.description && (
              <p className="text-gray-600 mb-6">{club.description}</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {club.email && (
                <div className="flex items-center text-gray-600">
                  <FaEnvelope className="mr-2" />
                  <a href={`mailto:${club.email}`} className="hover:text-primary">
                    {club.email}
                  </a>
                </div>
              )}
              
              {club.telephone && (
                <div className="flex items-center text-gray-600">
                  <FaPhone className="mr-2" />
                  <a href={`tel:${club.telephone}`} className="hover:text-primary">
                    {club.telephone}
                  </a>
                </div>
              )}
              
              {club.adresse && (
                <div className="flex items-center text-gray-600 col-span-2">
                  <FaBuilding className="mr-2" />
                  <span>{club.adresse}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Produits du club</h2>
        <ProductList clubId={clubId} />
      </div>
    </div>
  );
};

export default ClubDetail; 