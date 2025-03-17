import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../context/AuthContext';
import { FaSpinner, FaExclamationTriangle, FaShoppingBag, FaCalendarAlt, FaMapMarkerAlt, FaEuroSign, FaFileInvoice } from 'react-icons/fa';
import axiosInstance from '../config/axios';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface OrderProduct {
  produit: {
    _id: string;
    nom: string;
    images: string[];
  };
  quantite: number;
  prix: number;
  vendeur: {
    _id: string;
    nom: string;
    raisonSociale?: string;
  };
  vendeurModel: 'Club' | 'Sponsor';
}

interface Order {
  _id: string;
  produits: OrderProduct[];
  adresseLivraison: {
    adresse: string;
    ville: string;
    codePostal: string;
    pays: string;
  };
  informationsPaiement: {
    id: string;
    status: string;
    methode: string;
  };
  prixTotal: number;
  fraisLivraison: number;
  statusCommande: 'En attente' | 'Traitement en cours' | 'Expédiée' | 'Livrée' | 'Annulée';
  dateLivraison?: string;
  createdAt: string;
}

const OrderCard = ({ order }: { order: Order }) => {
  const formattedDate = new Date(order.createdAt).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const getStatusColor = (status: Order['statusCommande']) => {
    switch (status) {
      case 'En attente':
        return 'bg-yellow-100 text-yellow-800';
      case 'Traitement en cours':
        return 'bg-blue-100 text-blue-800';
      case 'Expédiée':
        return 'bg-purple-100 text-purple-800';
      case 'Livrée':
        return 'bg-green-100 text-green-800';
      case 'Annulée':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-slate-800 rounded-xl shadow-lg overflow-hidden mb-6"
    >
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <div className="flex items-center mb-4 md:mb-0">
            <FaShoppingBag className="text-primary text-xl mr-2" />
            <h3 className="text-lg font-semibold text-white">
              Commande #{order._id.slice(-6).toUpperCase()}
            </h3>
          </div>
          <div className="flex items-center">
            <FaCalendarAlt className="text-gray-400 mr-2" />
            <span className="text-gray-300">{formattedDate}</span>
          </div>
        </div>

        <div className="space-y-4">
          {/* Produits */}
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-2">Produits</h4>
            <div className="space-y-2">
              {order.produits.map((item, index) => (
                <div key={index} className="flex items-center justify-between bg-slate-700 p-3 rounded-lg">
                  <div className="flex items-center">
                    {item.produit.images && item.produit.images.length > 0 ? (
                      <img
                        src={item.produit.images[0]}
                        alt={item.produit.nom}
                        className="w-12 h-12 object-cover rounded-md mr-3"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-600 rounded-md mr-3 flex items-center justify-center">
                        <FaShoppingBag className="text-gray-400" />
                      </div>
                    )}
                    <div>
                      <p className="text-white">{item.produit.nom}</p>
                      <p className="text-sm text-gray-400">
                        Vendeur: {item.vendeur.raisonSociale || item.vendeur.nom}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white">{item.quantite} x {item.prix.toFixed(2)} €</p>
                    <p className="text-sm text-gray-400">{(item.quantite * item.prix).toFixed(2)} €</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Adresse de livraison */}
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-2 flex items-center">
              <FaMapMarkerAlt className="mr-2" />
              Adresse de livraison
            </h4>
            <div className="bg-slate-700 p-3 rounded-lg">
              <p className="text-white">{order.adresseLivraison.adresse}</p>
              <p className="text-white">
                {order.adresseLivraison.codePostal} {order.adresseLivraison.ville}
              </p>
              <p className="text-white">{order.adresseLivraison.pays}</p>
            </div>
          </div>

          {/* Statut et total */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between pt-4 border-t border-slate-700">
            <div className="mb-4 md:mb-0">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.statusCommande)}`}>
                {order.statusCommande}
              </span>
            </div>
            <div className="flex items-center">
              <FaEuroSign className="text-primary mr-2" />
              <span className="text-xl font-bold text-white">
                {order.prixTotal.toFixed(2)} €
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Orders = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: '/login' });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/api/orders');
        setOrders(response.data.data);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des commandes:', err);
        setError('Impossible de charger vos commandes');
        toast.error('Erreur lors du chargement des commandes');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <FaSpinner className="text-4xl animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <FaExclamationTriangle className="text-red-500 text-5xl mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Accès non autorisé
        </h1>
        <p className="text-gray-600 mb-6">
          Vous devez être connecté pour accéder à cette page.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Mes Commandes</h1>
          <button
            onClick={() => navigate({ to: '/' })}
            className="flex items-center text-primary hover:text-primary/80 transition-colors"
          >
            <FaShoppingBag className="mr-2" />
            Continuer mes achats
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <FaSpinner className="w-10 h-10 text-primary animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <FaExclamationTriangle className="text-red-500 text-5xl mx-auto mb-4" />
            <p className="text-gray-400">{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-10">
            <FaShoppingBag className="text-gray-400 text-5xl mx-auto mb-4" />
            <p className="text-gray-400">Vous n'avez pas encore passé de commande</p>
            <button
              onClick={() => navigate({ to: '/' })}
              className="mt-4 inline-flex items-center text-primary hover:text-primary/80 transition-colors"
            >
              Découvrir nos produits
            </button>
          </div>
        ) : (
          <AnimatePresence>
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default Orders; 