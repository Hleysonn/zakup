import { useState, useEffect } from 'react';
import { useSearch, Link } from '@tanstack/react-router';
import axios from 'axios';
import { FaCheckCircle, FaSpinner, FaExclamationTriangle, FaArrowLeft, FaFileInvoice, FaHome } from 'react-icons/fa';

interface OrderProduct {
  produit: {
    _id: string;
    nom: string;
    images: string[];
  };
  quantite: number;
  prixUnitaire: number;
}

interface Order {
  _id: string;
  utilisateur: {
    _id: string;
    nom: string;
    prenom: string;
    email: string;
  };
  produits: OrderProduct[];
  adresseLivraison: {
    rue: string;
    ville: string;
    codePostal: string;
    pays: string;
  };
  methodePaiement: string;
  montantTotal: number;
  statut: string;
  dateCommande: string;
  numeroCommande: string;
}

const OrderConfirmation = () => {
  const { orderId } = useSearch({ from: '/order-confirmation' });
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError('Identifiant de commande manquant');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`/api/orders/${orderId}`);
        setOrder(response.data);
        setError(null);
      } catch (err) {
        setError('Erreur lors du chargement des détails de la commande');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <FaSpinner className="animate-spin text-4xl text-primary" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <FaExclamationTriangle className="text-red-500 text-5xl mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          {error || 'Commande non trouvée'}
        </h1>
        <p className="text-gray-600 mb-6">
          Nous n'avons pas pu trouver les détails de votre commande. Veuillez vérifier l'identifiant de commande ou contacter notre service client.
        </p>
        <Link
          to="/"
          className="bg-primary text-white py-2 px-6 rounded-md hover:bg-primary/90 inline-flex items-center"
        >
          <FaHome className="mr-2" /> Retour à l'accueil
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(order.dateCommande).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Commande confirmée !</h1>
          <p className="text-gray-600">
            Merci pour votre commande. Un email de confirmation a été envoyé à {order.utilisateur.email}.
          </p>
        </div>

        <div className="border-t border-b border-gray-200 py-4 mb-6">
          <div className="flex flex-wrap justify-between">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-gray-600 mb-1">Numéro de commande</h2>
              <p className="text-lg font-medium">{order.numeroCommande || order._id}</p>
            </div>
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-gray-600 mb-1">Date de commande</h2>
              <p className="text-lg font-medium">{formattedDate}</p>
            </div>
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-gray-600 mb-1">Statut</h2>
              <p className="text-lg font-medium">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {order.statut === 'en attente' ? 'En attente' : 
                   order.statut === 'confirmee' ? 'Confirmée' : 
                   order.statut === 'en cours' ? 'En cours de traitement' : 
                   order.statut === 'expediee' ? 'Expédiée' : 
                   order.statut === 'livree' ? 'Livrée' : 
                   order.statut === 'annulee' ? 'Annulée' : 'Inconnue'}
                </span>
              </p>
            </div>
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-gray-600 mb-1">Montant total</h2>
              <p className="text-lg font-medium">{order.montantTotal.toFixed(2)} €</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h2 className="text-lg font-semibold mb-3">Informations de livraison</h2>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="mb-1">{order.utilisateur.prenom} {order.utilisateur.nom}</p>
              <p className="mb-1">{order.adresseLivraison.rue}</p>
              <p className="mb-1">{order.adresseLivraison.codePostal} {order.adresseLivraison.ville}</p>
              <p>{order.adresseLivraison.pays}</p>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-3">Méthode de paiement</h2>
            <div className="bg-gray-50 p-4 rounded-md">
              <p>
                {order.methodePaiement === 'carte' ? 'Carte de crédit' : 
                 order.methodePaiement === 'paypal' ? 'PayPal' : 
                 order.methodePaiement}
              </p>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-4">Récapitulatif de la commande</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produit
                </th>
                <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantité
                </th>
                <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix unitaire
                </th>
                <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {order.produits.map((item, index) => (
                <tr key={index}>
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      {item.produit.images && item.produit.images.length > 0 ? (
                        <img
                          src={item.produit.images[0]}
                          alt={item.produit.nom}
                          className="w-12 h-12 object-cover rounded-md mr-4"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-md mr-4 flex items-center justify-center text-gray-400">
                          No image
                        </div>
                      )}
                      <Link
                        to={`/products/${item.produit._id}`}
                        className="text-primary hover:underline"
                      >
                        {item.produit.nom}
                      </Link>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    {item.quantite}
                  </td>
                  <td className="py-4 px-4 text-right">
                    {item.prixUnitaire.toFixed(2)} €
                  </td>
                  <td className="py-4 px-4 text-right font-medium">
                    {(item.prixUnitaire * item.quantite).toFixed(2)} €
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={3} className="py-3 px-4 text-right font-medium">
                  Sous-total
                </td>
                <td className="py-3 px-4 text-right font-medium">
                  {order.montantTotal.toFixed(2)} €
                </td>
              </tr>
              <tr>
                <td colSpan={3} className="py-3 px-4 text-right font-medium">
                  Frais de livraison
                </td>
                <td className="py-3 px-4 text-right font-medium">
                  Gratuit
                </td>
              </tr>
              <tr>
                <td colSpan={3} className="py-3 px-4 text-right font-bold">
                  Total
                </td>
                <td className="py-3 px-4 text-right font-bold">
                  {order.montantTotal.toFixed(2)} €
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mt-8 flex flex-wrap justify-between">
          <Link
            to="/"
            className="inline-flex items-center text-primary hover:underline mb-4 md:mb-0"
          >
            <FaArrowLeft className="mr-2" /> Continuer mes achats
          </Link>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300"
          >
            <FaFileInvoice className="mr-2" /> Imprimer la facture
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation; 