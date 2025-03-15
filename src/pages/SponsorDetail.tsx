import { useState, useEffect } from 'react';
import { useParams, Link } from '@tanstack/react-router';
import axiosInstance from '../config/axios';
import { FaArrowLeft, FaSpinner, FaExclamationTriangle, FaBuilding, FaPhone, FaEnvelope, FaMapMarkerAlt, FaIdCard, FaHandshake, FaChartLine, FaUsers } from 'react-icons/fa';
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
  dateCreation?: string;
  nombrePartenariats?: number;
  chiffreAffaires?: number;
}

const SponsorDetail = () => {
  const { sponsorId } = useParams({ from: '/sponsors/$sponsorId' });
  const [sponsor, setSponsor] = useState<Sponsor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'produits' | 'statistiques'>('produits');
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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
        <div className="container mx-auto px-4 py-8">
          <Link
            to="/sponsors"
            className="inline-flex items-center text-gray-300 hover:text-white mb-6"
          >
            <FaArrowLeft className="mr-2" /> Retour aux sponsors
          </Link>

          <div className="md:flex items-center gap-8">
            <div className="mb-6 md:mb-0">
              {sponsor.logo ? (
                <img
                  src={sponsor.logo}
                  alt={sponsor.raisonSociale}
                  className="w-40 h-40 rounded-full border-4 border-white shadow-lg object-cover"
                />
              ) : (
                <div className="w-40 h-40 rounded-full border-4 border-white shadow-lg bg-white flex items-center justify-center">
                  <FaBuilding className="text-gray-700 text-5xl" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-4 text-white">{sponsor.raisonSociale}</h1>
              {sponsor.description && (
                <p className="text-gray-300 text-lg">{sponsor.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center text-gray-900 mb-4">
              <div className="w-12 h-12 bg-gray-700/10 rounded-full flex items-center justify-center mr-4">
                <FaHandshake className="text-gray-700 text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Partenariats</h3>
                <p className="text-gray-700">{sponsor.nombrePartenariats || 0} clubs partenaires</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center text-gray-900 mb-4">
              <div className="w-12 h-12 bg-gray-700/10 rounded-full flex items-center justify-center mr-4">
                <FaChartLine className="text-gray-700 text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Chiffre d'affaires</h3>
                <p className="text-gray-700">{sponsor.chiffreAffaires ? `${sponsor.chiffreAffaires.toLocaleString('fr-FR')} €` : 'Non disponible'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center text-gray-900 mb-4">
              <div className="w-12 h-12 bg-gray-700/10 rounded-full flex items-center justify-center mr-4">
                <FaUsers className="text-gray-700 text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Clients satisfaits</h3>
                <p className="text-gray-700">+1000 clients satisfaits</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Informations de contact</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sponsor.email && (
                <div className="flex items-center text-gray-900">
                  <div className="w-12 h-12 bg-gray-700/10 rounded-full flex items-center justify-center mr-4">
                    <FaEnvelope className="text-gray-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-gray-900">Email</h3>
                    <a href={`mailto:${sponsor.email}`} className="hover:text-gray-700 text-gray-600">
                      {sponsor.email}
                    </a>
                  </div>
                </div>
              )}
              
              {sponsor.telephone && (
                <div className="flex items-center text-gray-900">
                  <div className="w-12 h-12 bg-gray-700/10 rounded-full flex items-center justify-center mr-4">
                    <FaPhone className="text-gray-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-gray-900">Téléphone</h3>
                    <a href={`tel:${sponsor.telephone}`} className="hover:text-gray-700 text-gray-600">
                      {sponsor.telephone}
                    </a>
                  </div>
                </div>
              )}
              
              {sponsor.adresse && (
                <div className="flex items-center text-gray-900">
                  <div className="w-12 h-12 bg-gray-700/10 rounded-full flex items-center justify-center mr-4">
                    <FaMapMarkerAlt className="text-gray-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-gray-900">Adresse</h3>
                    <span className="text-gray-600">{sponsor.adresse}</span>
                  </div>
                </div>
              )}

              {sponsor.numeroTVA && (
                <div className="flex items-center text-gray-900">
                  <div className="w-12 h-12 bg-gray-700/10 rounded-full flex items-center justify-center mr-4">
                    <FaIdCard className="text-gray-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-gray-900">Numéro de TVA</h3>
                    <span className="text-gray-600">{sponsor.numeroTVA}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('produits')}
                className={`px-6 py-4 font-medium flex-1 text-center ${
                  activeTab === 'produits'
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Produits
              </button>
              <button
                onClick={() => setActiveTab('statistiques')}
                className={`px-6 py-4 font-medium flex-1 text-center ${
                  activeTab === 'statistiques'
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Statistiques
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'produits' ? (
              <ProductList sponsorId={sponsorId} />
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2 text-gray-900">Ventes mensuelles</h3>
                  <p className="text-gray-600">Statistiques à venir...</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2 text-gray-900">Produits populaires</h3>
                  <p className="text-gray-600">Statistiques à venir...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SponsorDetail; 