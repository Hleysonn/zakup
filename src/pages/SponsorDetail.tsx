import { useState, useEffect } from 'react';
import { useParams, Link } from '@tanstack/react-router';
import axiosInstance from '../config/axios';
import { FaArrowLeft, FaSpinner, FaExclamationTriangle, FaBuilding, FaPhone, FaEnvelope, FaMapMarkerAlt, FaIdCard } from 'react-icons/fa';
import ProductList from '../components/products/ProductList';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

interface Sponsor {
  _id: string;
  raisonSociale: string;
  logo?: string;
  description?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  numeroTVA?: string;
}

const SponsorDetail = () => {
  const { sponsorId } = useParams({ from: '/sponsors/$sponsorId' });
  const [sponsor, setSponsor] = useState<Sponsor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchSponsorDetails = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/api/sponsors/${sponsorId}`);
        setSponsor(response.data.data);
        setError(null);
      } catch (err) {
        setError('Erreur lors du chargement des détails du sponsor');
        console.error('Erreur lors du chargement des détails du sponsor:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSponsorDetails();
  }, [sponsorId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <FaSpinner className="animate-spin text-4xl text-primary" />
      </div>
    );
  }

  if (error || !sponsor) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center">
          <FaExclamationTriangle className="mr-2" />
          <span>{error || 'Sponsor non trouvé'}</span>
        </div>
        <Link
          to="/sponsors"
          className="mt-4 inline-flex items-center text-primary hover:text-primary/80"
        >
          <FaArrowLeft className="mr-2" /> Retour aux sponsors
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        to="/sponsors"
        className="inline-flex items-center text-primary hover:text-primary/80 mb-6"
      >
        <FaArrowLeft className="mr-2" /> Retour aux sponsors
      </Link>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="md:flex">
          <div className="md:w-1/3 bg-gray-100 p-6 flex items-center justify-center">
            {sponsor.logo ? (
              <img
                src={sponsor.logo}
                alt={sponsor.raisonSociale}
                className="max-w-full h-auto rounded-lg"
              />
            ) : (
              <div className="w-48 h-48 bg-gray-200 rounded-full flex items-center justify-center">
                <FaBuilding className="text-gray-400 text-6xl" />
              </div>
            )}
          </div>
          
          <div className="md:w-2/3 p-6">
            <h1 className="text-3xl font-bold mb-4">{sponsor.raisonSociale}</h1>
            
            {sponsor.description && (
              <p className="text-gray-600 mb-6">{sponsor.description}</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sponsor.email && (
                <div className="flex items-center text-gray-600">
                  <FaEnvelope className="mr-2" />
                  <a href={`mailto:${sponsor.email}`} className="hover:text-primary">
                    {sponsor.email}
                  </a>
                </div>
              )}
              
              {sponsor.telephone && (
                <div className="flex items-center text-gray-600">
                  <FaPhone className="mr-2" />
                  <a href={`tel:${sponsor.telephone}`} className="hover:text-primary">
                    {sponsor.telephone}
                  </a>
                </div>
              )}
              
              {sponsor.adresse && (
                <div className="flex items-center text-gray-600">
                  <FaMapMarkerAlt className="mr-2" />
                  <span>{sponsor.adresse}</span>
                </div>
              )}

              {sponsor.numeroTVA && (
                <div className="flex items-center text-gray-600">
                  <FaIdCard className="mr-2" />
                  <span>TVA: {sponsor.numeroTVA}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Produits du sponsor</h2>
        <ProductList sponsorId={sponsorId} />
      </div>
    </div>
  );
};

export default SponsorDetail; 