import { useState, useEffect } from 'react';
import { useParams, Link } from '@tanstack/react-router';
import axios from 'axios';
import { FaArrowLeft, FaSpinner, FaExclamationTriangle, FaStar, FaBuilding, FaPhone, FaEnvelope, FaUsers, FaTrophy } from 'react-icons/fa';
import ProductList from '../components/products/ProductList';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

interface Club {
  _id: string;
  raisonSociale: string;
  logo?: string;
  sport: string;
}

interface Sponsor {
  _id: string;
  raisonSociale: string;
  description: string;
  logo?: string;
  email: string;
  telephone: string;
  siteWeb?: string;
  clubs: Club[];
  donsClubs: {
    club: Club;
    montant: number;
    date: string;
  }[];
  subscribers: string[];
}

const SponsorDetail = () => {
  const { sponsorId } = useParams({ from: '/sponsors/$sponsorId' });
  const { user, isAuthenticated } = useAuth();
  const [sponsor, setSponsor] = useState<Sponsor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const fetchSponsor = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/sponsors/${sponsorId}`);
        setSponsor(response.data.data);
        
        // Vérifier si l'utilisateur est abonné
        if (isAuthenticated && user && response.data.data.subscribers) {
          setIsSubscribed(response.data.data.subscribers.includes(user._id));
        }
        
        setError(null);
      } catch (err) {
        setError('Erreur lors du chargement des informations du sponsor');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSponsor();
  }, [sponsorId, isAuthenticated, user]);

  const handleSubscription = async () => {
    if (!isAuthenticated) {
      toast.error('Vous devez être connecté pour vous abonner');
      return;
    }

    try {
      setIsSubscribing(true);
      
      if (isSubscribed) {
        await axios.put(`/api/users/unsubscribe-sponsor/${sponsorId}`);
        setIsSubscribed(false);
        toast.success('Désabonnement réussi');
      } else {
        await axios.put(`/api/users/subscribe-sponsor/${sponsorId}`);
        setIsSubscribed(true);
        toast.success('Abonnement réussi');
      }
    } catch (err) {
      toast.error('Une erreur est survenue');
      console.error(err);
    } finally {
      setIsSubscribing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <FaSpinner className="animate-spin text-4xl text-primary" />
      </div>
    );
  }

  if (error || !sponsor) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <FaExclamationTriangle className="text-red-500 text-5xl mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          {error || 'Sponsor non trouvé'}
        </h1>
        <p className="text-gray-600 mb-6">
          Nous n'avons pas pu trouver les informations de ce sponsor.
        </p>
        <Link
          to="/sponsors"
          className="bg-primary text-white py-2 px-6 rounded-md hover:bg-primary/90 inline-flex items-center"
        >
          <FaArrowLeft className="mr-2" /> Retour aux sponsors
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/sponsors" className="text-primary hover:underline flex items-center mb-6">
        <FaArrowLeft className="mr-2" /> Retour aux sponsors
      </Link>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="md:flex">
          <div className="md:w-1/3 bg-gray-100 flex items-center justify-center p-8">
            {sponsor.logo ? (
              <img
                src={sponsor.logo}
                alt={sponsor.raisonSociale}
                className="max-w-full max-h-48 object-contain"
              />
            ) : (
              <FaBuilding className="text-gray-400" size={96} />
            )}
          </div>
          
          <div className="md:w-2/3 p-6">
            <div className="flex justify-between items-start">
              <h1 className="text-3xl font-bold mb-4">{sponsor.raisonSociale}</h1>
              
              <button
                onClick={handleSubscription}
                disabled={isSubscribing}
                className={`px-4 py-2 rounded-md flex items-center ${
                  isSubscribed 
                    ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' 
                    : 'bg-primary text-white hover:bg-primary/90'
                }`}
              >
                {isSubscribing ? (
                  <FaSpinner className="animate-spin mr-2" />
                ) : (
                  <FaStar className={`mr-2 ${isSubscribed ? 'text-yellow-500' : ''}`} />
                )}
                {isSubscribed ? 'Abonné' : 'S\'abonner'}
              </button>
            </div>
            
            <p className="text-gray-700 mb-6">{sponsor.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <FaEnvelope className="text-primary mr-2" />
                <a href={`mailto:${sponsor.email}`} className="text-primary hover:underline">
                  {sponsor.email}
                </a>
              </div>
              <div className="flex items-center">
                <FaPhone className="text-primary mr-2" />
                <a href={`tel:${sponsor.telephone}`} className="text-primary hover:underline">
                  {sponsor.telephone}
                </a>
              </div>
              {sponsor.siteWeb && (
                <div className="flex items-center">
                  <FaBuilding className="text-primary mr-2" />
                  <a href={sponsor.siteWeb} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                    Site Web
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {sponsor.clubs && sponsor.clubs.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Clubs sponsorisés</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sponsor.clubs.map(club => (
              <Link
                key={club._id}
                to={`/clubs/${club._id}`}
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow flex flex-col items-center"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  {club.logo ? (
                    <img
                      src={club.logo}
                      alt={club.raisonSociale}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <FaUsers className="text-gray-400" size={24} />
                  )}
                </div>
                <h3 className="font-semibold text-center mb-1">{club.raisonSociale}</h3>
                <div className="flex items-center text-gray-600 text-sm">
                  <FaTrophy className="mr-1 text-yellow-500" size={12} />
                  <span>{club.sport}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold mb-6">Produits du sponsor</h2>
        <ProductList filters={{ sponsors: [sponsorId], clubs: [], categories: [] }} />
      </div>
    </div>
  );
};

export default SponsorDetail; 