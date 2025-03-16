import { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../config/axios';
import { FaArrowLeft, FaSpinner, FaCheckCircle, FaCrown, FaMedal, FaTrophy } from 'react-icons/fa';
import { motion } from 'framer-motion';

interface Club {
  _id: string;
  raisonSociale: string;
  logo?: string;
  description?: string;
  sport?: string;
}

interface Formule {
  _id: string;
  nom: string;
  prix: number;
  niveau: string;
  couleur: string;
  iconType: string;
  avantages: string[];
  recommande?: boolean;
}

const AbonnementClub = () => {
  const { clubId } = useParams({ from: '/clubs/$clubId/abonnement' });
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [formules, setFormules] = useState<Formule[]>([]);
  const [processing, setProcessing] = useState(false);
  const [selectedFormule, setSelectedFormule] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Récupérer les informations du club
        const clubResponse = await axiosInstance.get(`/api/clubs/${clubId}`);
        setClub(clubResponse.data.data);
        
        // Récupérer les formules depuis la base de données
        const formulesResponse = await axiosInstance.get(`/api/formules`);
        if (formulesResponse.data.data && formulesResponse.data.data.length > 0) {
          setFormules(formulesResponse.data.data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast.error("Impossible de charger les informations d'abonnement");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clubId]);

  const handleSouscrire = async (formuleId: string) => {
    if (!user) {
      toast.error('Vous devez être connecté pour vous abonner');
      navigate({ to: '/login', search: { redirect: `clubs/${clubId}/abonnement` } });
      return;
    }

    try {
      setProcessing(true);
      setSelectedFormule(formuleId);
      
      // Trouver la formule sélectionnée pour obtenir son prix
      const formule = formules.find(f => f._id === formuleId);
      if (!formule) {
        throw new Error('Formule introuvable');
      }

      const response = await axiosInstance.post('/api/abonnements', {
        clubId,
        formuleId: formuleId,
        montantMensuel: formule.prix
      });

      toast.success('Abonnement souscrit avec succès!');
      navigate({ to: `/clubs/${clubId}` });
    } catch (error) {
      console.error('Erreur lors de la souscription:', error);
      toast.error("Impossible de souscrire à l'abonnement");
    } finally {
      setProcessing(false);
      setSelectedFormule(null);
    }
  };

  // Fonction pour afficher l'icône appropriée selon le type
  const renderIcon = (formule: Formule) => {
    if (formule.iconType === 'medal') {
      return <FaMedal className={`text-4xl ${getColorClass(formule.couleur)}`} />;
    } else if (formule.iconType === 'crown') {
      return <FaCrown className={`text-4xl ${getColorClass(formule.couleur)}`} />;
    } else {
      return <FaTrophy className={`text-4xl ${getColorClass(formule.couleur)}`} />;
    }
  };

  // Fonction pour obtenir la classe de couleur appropriée
  const getColorClass = (couleur: string) => {
    if (couleur === 'blue') return 'text-blue-600';
    if (couleur === 'purple') return 'text-purple-600';
    if (couleur === 'amber') return 'text-amber-600';
    return 'text-blue-600'; // Couleur par défaut
  };

  // Fonction pour obtenir la classe de couleur de fond
  const getBackgroundClass = (couleur: string) => {
    if (couleur === 'blue') return 'bg-blue-50';
    if (couleur === 'purple') return 'bg-purple-50';
    if (couleur === 'amber') return 'bg-amber-50';
    return 'bg-blue-50'; // Couleur par défaut
  };

  // Fonction pour obtenir la classe de couleur du bouton
  const getButtonClass = (couleur: string, isProcessing: boolean) => {
    if (isProcessing) return 'bg-gray-300 cursor-not-allowed';
    if (couleur === 'blue') return 'bg-blue-600 hover:bg-blue-700 text-white';
    if (couleur === 'purple') return 'bg-purple-600 hover:bg-purple-700 text-white';
    if (couleur === 'amber') return 'bg-amber-600 hover:bg-amber-700 text-white';
    return 'bg-blue-600 hover:bg-blue-700 text-white'; // Couleur par défaut
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <FaSpinner className="animate-spin text-blue-600 text-4xl" />
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <p className="text-gray-700 mb-4">Ce club n'existe pas ou n'est plus disponible</p>
        <button
          onClick={() => navigate({ to: '/' })}
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Retour à l'accueil
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate({ to: `/clubs/${clubId}` })}
          className="flex items-center text-blue-600 mb-8 hover:underline"
        >
          <FaArrowLeft className="mr-2" /> Retour au profil du club
        </button>

        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Abonnement à {club.raisonSociale}</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Choisissez la formule qui vous convient et profitez d'avantages exclusifs auprès de votre club préféré.
          </p>
        </div>

        {formules.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {formules.map((formule) => (
              <motion.div
                key={formule._id}
                className={`bg-white rounded-xl shadow-lg overflow-hidden relative ${formule.recommande ? 'ring-2 ring-purple-500' : ''}`}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                {formule.recommande && (
                  <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    Recommandé
                  </div>
                )}
                <div className={`p-6 ${getBackgroundClass(formule.couleur)}`}>
                  <div className="flex justify-center">
                    {renderIcon(formule)}
                  </div>
                  <h3 className="text-xl font-bold text-center mt-4 text-gray-800">{formule.nom}</h3>
                  <div className="text-center mt-2">
                    <span className="text-3xl font-bold text-gray-900">{formule.prix}€</span>
                    <span className="text-gray-500">/mois</span>
                  </div>
                </div>
                
                <div className="p-6">
                  <ul className="space-y-3">
                    {formule.avantages.map((avantage, index) => (
                      <li key={index} className="flex items-start">
                        <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                        <span className="text-gray-700">{avantage}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button
                    onClick={() => handleSouscrire(formule._id)}
                    disabled={processing && selectedFormule === formule._id}
                    className={`w-full mt-6 py-3 px-4 rounded-lg font-medium transition-colors ${
                      getButtonClass(formule.couleur, processing && selectedFormule === formule._id)
                    }`}
                  >
                    {processing && selectedFormule === formule._id ? (
                      <FaSpinner className="animate-spin mx-auto" />
                    ) : (
                      "S'abonner"
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">Aucune formule d'abonnement n'est disponible pour ce club actuellement.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AbonnementClub; 