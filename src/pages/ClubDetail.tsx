import { useState, useEffect } from 'react';
import { useParams, Link } from '@tanstack/react-router';
import axiosInstance from '../config/axios';
import { FaArrowLeft, FaSpinner, FaExclamationTriangle, FaUsers, FaPhone, FaEnvelope, FaMapMarkerAlt, FaFutbol, FaTrophy, FaBuilding, FaCalendarAlt, FaIdCard, FaBell, FaCheckCircle } from 'react-icons/fa';
import ProductList from '../components/products/ProductList';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useNavigate } from '@tanstack/react-router';

interface Club {
  _id: string;
  raisonSociale: string;
  logo?: string;
  description?: string;
  sport?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  dateCreation?: string;
  nombreAbonnes?: number;
  palmares?: string[];
  numeroTVA?: string;
}

const ClubDetail = () => {
  const { clubId } = useParams({ from: '/clubs/$clubId' });
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'produits' | 'palmares'>('produits');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { user, userType } = useAuth();
  const navigate = useNavigate();

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

  // Vérifier si l'utilisateur est déjà abonné
  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) return;
      
      try {
        const response = await axiosInstance.get('/api/users/clubs');
        const subscribedClubs = response.data.data || [];
        const subscribed = subscribedClubs.some((c: { _id: string }) => c._id === clubId);
        setIsSubscribed(subscribed);
      } catch (err) {
        console.error('Erreur lors de la vérification de l\'abonnement:', err);
      }
    };

    checkSubscription();
  }, [user, clubId]);

  const handleSubscribe = async () => {
    if (!user) {
      toast.error('Vous devez être connecté pour vous abonner');
      return;
    }

    // Si l'utilisateur est déjà abonné, on permet de se désabonner directement
    if (isSubscribed) {
      try {
        setIsSubscribing(true);
        
        // Désabonnement
        await axiosInstance.put(`/api/users/unsubscribe-club/${clubId}`);
        toast.success(`Vous vous êtes désabonné de ${club?.raisonSociale}`);
        setIsSubscribed(false);
        
        // Mettre à jour le nombre d'abonnés
        if (club && club.nombreAbonnes) {
          setClub({
            ...club,
            nombreAbonnes: club.nombreAbonnes - 1
          });
        }
      } catch (err: unknown) {
        const error = err as { response?: { data?: { error?: string } } };
        toast.error(error.response?.data?.error || 'Une erreur est survenue');
        console.error('Erreur lors du désabonnement:', err);
      } finally {
        setIsSubscribing(false);
      }
    } else {
      // Si l'utilisateur n'est pas encore abonné, on le redirige vers la page d'abonnement
      navigate({ to: `/clubs/${clubId}/abonnement` });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <FaSpinner className="text-4xl animate-spin text-primary" />
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <div className="flex items-center px-4 py-3 text-red-700 bg-red-100 border border-red-400 rounded">
          <FaExclamationTriangle className="mr-2" />
          <span>{error || 'Club non trouvé'}</span>
        </div>
        <Link
          to="/clubs"
          className="inline-flex items-center mt-4 text-primary hover:text-primary/80"
        >
          <FaArrowLeft className="mr-2" /> Retour aux clubs
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="text-white bg-gradient-to-r from-gray-700 to-gray-800">
        <div className="container px-4 py-8 mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link
              to="/clubs"
              className="inline-flex items-center text-gray-300 hover:text-white"
            >
              <FaArrowLeft className="mr-2" /> Retour aux clubs
            </Link>
            
            {user && userType === 'user' && (
              <motion.button
                onClick={handleSubscribe}
                disabled={isSubscribing}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 font-semibold rounded-md flex items-center ${
                  isSubscribed 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-primary hover:bg-primary-dark'
                } transition-all duration-300`}
              >
                {isSubscribing ? (
                  <FaSpinner className="mr-2 animate-spin" />
                ) : isSubscribed ? (
                  <FaCheckCircle className="mr-2" />
                ) : (
                  <FaBell className="mr-2" />
                )}
                {isSubscribed ? 'Abonné' : 'S\'abonner'}
              </motion.button>
            )}
          </div>

          <div className="items-center gap-8 md:flex">
            <div className="mb-6 md:mb-0">
              {club.logo ? (
                <img
                  src={club.logo}
                  alt={club.raisonSociale}
                  className="object-cover w-40 h-40 border-4 border-white rounded-full shadow-lg"
                />
              ) : (
                <div className="flex items-center justify-center w-40 h-40 bg-white border-4 border-white rounded-full shadow-lg">
                  <FaBuilding className="text-5xl text-gray-700" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <h1 className="mb-4 text-4xl font-bold text-white">{club.raisonSociale}</h1>
              {club.sport && (
                <div className="flex items-center mb-4 text-gray-300">
                  <FaFutbol className="mr-2" />
                  <span>{club.sport}</span>
                </div>
              )}
              {club.description && (
                <p className="text-lg text-gray-300">{club.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 py-8 mx-auto">
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex items-center mb-4 text-gray-900">
              <div className="flex items-center justify-center w-12 h-12 mr-4 rounded-full bg-gray-700/10">
                <FaTrophy className="text-xl text-gray-700" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Palmarès</h3>
                <p className="text-gray-700">{club.palmares || 0} trophées</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex items-center mb-4 text-gray-900">
              <div className="flex items-center justify-center w-12 h-12 mr-4 rounded-full bg-gray-700/10">
                <FaUsers className="text-xl text-gray-700" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Abonnés</h3>
                <p className="text-gray-700">{club.nombreAbonnes || 0} abonnés</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex items-center mb-4 text-gray-900">
              <div className="flex items-center justify-center w-12 h-12 mr-4 rounded-full bg-gray-700/10">
                <FaCalendarAlt className="text-xl text-gray-700" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Date de création</h3>
                <p className="text-gray-700">
                  {club.dateCreation
                    ? new Date(club.dateCreation).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'Non spécifiée'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 overflow-hidden bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Informations de contact</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {club.email && (
                <div className="flex items-center text-gray-900">
                  <div className="flex items-center justify-center w-12 h-12 mr-4 rounded-full bg-gray-700/10">
                    <FaEnvelope className="text-gray-700" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-gray-900">Email</h3>
                    <a href={`mailto:${club.email}`} className="text-gray-600 hover:text-gray-700">
                      {club.email}
                    </a>
                  </div>
                </div>
              )}
              
              {club.telephone && (
                <div className="flex items-center text-gray-900">
                  <div className="flex items-center justify-center w-12 h-12 mr-4 rounded-full bg-gray-700/10">
                    <FaPhone className="text-gray-700" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-gray-900">Téléphone</h3>
                    <a href={`tel:${club.telephone}`} className="text-gray-600 hover:text-gray-700">
                      {club.telephone}
                    </a>
                  </div>
                </div>
              )}
              
              {club.adresse && (
                <div className="flex items-center text-gray-900">
                  <div className="flex items-center justify-center w-12 h-12 mr-4 rounded-full bg-gray-700/10">
                    <FaMapMarkerAlt className="text-gray-700" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-gray-900">Adresse</h3>
                    <span className="text-gray-600">{club.adresse}</span>
                  </div>
                </div>
              )}

              {club.numeroTVA && (
                <div className="flex items-center text-gray-900">
                  <div className="flex items-center justify-center w-12 h-12 mr-4 rounded-full bg-gray-700/10">
                    <FaIdCard className="text-gray-700" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-gray-900">Numéro de TVA</h3>
                    <span className="text-gray-600">{club.numeroTVA}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-hidden bg-white rounded-lg shadow-md">
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
                onClick={() => setActiveTab('palmares')}
                className={`px-6 py-4 font-medium flex-1 text-center ${
                  activeTab === 'palmares'
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Palmarès
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'produits' ? (
              <ProductList clubId={clubId} />
            ) : (
              <div className="space-y-4">
                {club.palmares && club.palmares.length > 0 ? (
                  club.palmares.map((trophee, index) => (
                    <div key={index} className="flex items-center">
                      <FaTrophy className="mr-3 text-yellow-500" />
                      <span>{trophee}</span>
                    </div>
                  ))
                ) : (
                  <p className="py-8 text-center text-gray-500">
                    Aucun trophée enregistré pour le moment
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubDetail; 