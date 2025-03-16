import { useState } from 'react';
import { FaTrash, FaArrowLeft, FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import { Link, useNavigate } from '@tanstack/react-router';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const Cart = () => {
  const { items: cartItems, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantity(id, newQuantity);
    }
  };

  const handleRemoveItem = (id: string) => {
    removeFromCart(id);
    toast.success('Produit retiré du panier');
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Veuillez vous connecter pour finaliser votre commande');
      navigate({ to: '/login' });
      return;
    }

    setIsProcessing(true);
    // Simuler un délai de traitement
    setTimeout(() => {
      navigate({ to: '/checkout' });
      setIsProcessing(false);
    }, 1000);
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Votre Panier</h1>
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <FaShoppingCart className="text-gray-300 text-6xl mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-4">Votre panier est vide</h2>
          <p className="text-gray-600 mb-6">
            Vous n'avez pas encore ajouté de produits à votre panier.
          </p>
          <Link
            to="/products"
            className="bg-primary text-white py-2 px-6 rounded-md hover:bg-primary/90 inline-flex items-center"
          >
            <FaArrowLeft className="mr-2" /> Continuer mes achats
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Votre Panier</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Produit
                  </th>
                  <th className="py-4 px-6 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Quantité
                  </th>
                  <th className="py-4 px-6 text-right text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Prix
                  </th>
                  <th className="py-4 px-6 text-right text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="py-4 px-6 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <tr key={item._id}>
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.nom}
                            className="w-16 h-16 object-cover rounded-md mr-4"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-md mr-4 flex items-center justify-center text-gray-400">
                            No image
                          </div>
                        )}
                        <div>
                          <Link
                            to={`/products/${item._id}`}
                            className="text-lg font-medium text-gray-900 hover:text-primary"
                          >
                            {item.nom}
                          </Link>
                          <p className="text-sm text-gray-500">
                            Vendeur: {item.vendeur ? (item.vendeur.raisonSociale || item.vendeur.nom || 'Inconnu') : 'Inconnu'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-center items-center">
                        <button
                          onClick={() => handleQuantityChange(item._id, item.quantite - 1)}
                          className="bg-gray-100 text-gray-600 hover:bg-gray-200 p-1 rounded-l-md"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={item.quantite}
                          onChange={(e) => handleQuantityChange(item._id, parseInt(e.target.value) || 1)}
                          className="w-12 text-center border-t border-b border-gray-200 py-1"
                        />
                        <button
                          onClick={() => handleQuantityChange(item._id, item.quantite + 1)}
                          className="bg-gray-100 text-gray-600 hover:bg-gray-200 p-1 rounded-r-md"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {item.prix.toFixed(2)} €
                    </td>
                    <td className="py-4 px-6 text-right font-medium">
                      {(item.prix * item.quantite).toFixed(2)} €
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleRemoveItem(item._id)}
                        className="text-red-500 hover:text-red-700"
                        aria-label="Supprimer"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-between">
            <Link
              to="/products"
              className="inline-flex items-center text-primary hover:underline"
            >
              <FaArrowLeft className="mr-2" /> Continuer mes achats
            </Link>
            <button
              onClick={() => {
                clearCart();
                toast.success('Panier vidé avec succès');
              }}
              className="text-red-500 hover:text-red-700"
            >
              Vider le panier
            </button>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold mb-4">Récapitulatif de la commande</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between border-b border-gray-200 pb-4">
                <span>Sous-total</span>
                <span>{totalPrice.toFixed(2)} €</span>
              </div>
              
              <div className="flex justify-between border-b border-gray-200 pb-4">
                <span>Frais de livraison</span>
                <span>Gratuit</span>
              </div>
              
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{totalPrice.toFixed(2)} €</span>
              </div>
              
              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full bg-primary text-white py-3 rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {isProcessing ? 'Traitement en cours...' : 'Procéder au paiement'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart; 