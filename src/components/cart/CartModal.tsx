import { FaTrash, FaArrowLeft, FaShoppingCart, FaTimes } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import { Link } from '@tanstack/react-router';
import { toast } from 'react-hot-toast';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartModal = ({ isOpen, onClose }: CartModalProps) => {
  const { items: cartItems, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart();

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantity(id, newQuantity);
    }
  };

  const handleRemoveItem = (id: string) => {
    removeFromCart(id);
    toast.success('Produit retiré du panier');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none">
      {/* Modal à droite */}
      <div className="fixed inset-y-0 right-0 max-w-md w-full bg-slate-800 text-white shadow-xl flex flex-col transform transition-transform duration-300 ease-in-out pointer-events-auto">
        {/* Entête */}
        <div className="py-4 px-6 border-b border-slate-700 flex items-center justify-between bg-slate-900">
          <div className="flex items-center">
            <FaShoppingCart className="text-primary text-lg mr-2" />
            <h2 className="text-xl font-bold">Votre Panier</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-full transition-colors"
            aria-label="Fermer"
          >
            <FaTimes className="text-gray-300" />
          </button>
        </div>
        
        {/* Contenu du panier */}
        <div className="flex-grow overflow-y-auto">
          {!cartItems || cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <FaShoppingCart className="text-gray-500 text-6xl mb-4" />
              <h3 className="text-xl font-semibold mb-2">Votre panier est vide</h3>
              <p className="text-gray-400 mb-6">
                Vous n'avez pas encore ajouté de produits à votre panier.
              </p>
              <Link
                to="/products"
                onClick={onClose}
                className="bg-primary text-white py-2 px-6 rounded-md hover:bg-primary/90 inline-flex items-center"
              >
                <FaArrowLeft className="mr-2" /> Continuer mes achats
              </Link>
            </div>
          ) : (
            <div className="p-4">
              {/* Liste des articles */}
              <div className="divide-y divide-slate-700">
                {cartItems.map((item) => (
                  <div key={item._id} className="py-4 flex">
                    {/* Image du produit */}
                    <div className="flex-shrink-0 mr-4">
                      {item.image ? (
                        <img
                          src={item.image.startsWith('http') ? item.image : `http://localhost:5000${item.image}`}
                          alt={item.nom}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-slate-700 rounded-md flex items-center justify-center text-gray-400">
                          No image
                        </div>
                      )}
                    </div>
                    
                    {/* Détails du produit */}
                    <div className="flex-grow">
                      <h4 className="font-medium text-white">{item.nom}</h4>
                      <p className="text-sm text-gray-400">
                        {item.vendeur ? (item.vendeur.raisonSociale || item.vendeur.nom || 'Inconnu') : 'Inconnu'}
                      </p>
                      
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center">
                          <button
                            onClick={() => handleQuantityChange(item._id, item.quantite - 1)}
                            className="bg-slate-700 text-gray-300 hover:bg-slate-600 p-1 w-8 h-8 flex items-center justify-center rounded-l-md"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantite}
                            onChange={(e) => handleQuantityChange(item._id, parseInt(e.target.value) || 1)}
                            className="w-12 text-center border-t border-b border-slate-600 py-1 h-8 bg-slate-700 text-white"
                          />
                          <button
                            onClick={() => handleQuantityChange(item._id, item.quantite + 1)}
                            className="bg-slate-700 text-gray-300 hover:bg-slate-600 p-1 w-8 h-8 flex items-center justify-center rounded-r-md"
                          >
                            +
                          </button>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-bold text-primary">{(item.prix * item.quantite).toFixed(2)} €</div>
                          <div className="text-sm text-gray-400">{item.prix.toFixed(2)} € / unité</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Bouton supprimer */}
                    <button
                      onClick={() => handleRemoveItem(item._id)}
                      className="flex-shrink-0 ml-2 text-red-400 hover:text-red-300 self-start mt-1"
                      aria-label="Supprimer"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Pied de page avec total et boutons */}
        {cartItems && cartItems.length > 0 && (
          <div className="border-t border-slate-700 p-4 bg-slate-900">
            <div className="flex justify-between text-lg font-bold mb-4">
              <span>Total</span>
              <span className="text-primary">{totalPrice.toFixed(2)} €</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Link
                to="/cart"
                onClick={onClose}
                className="bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 rounded-md text-center transition-colors"
              >
                Voir Panier
              </Link>
              <Link
                to="/checkout"
                onClick={onClose}
                className="bg-primary hover:bg-primary/90 text-white font-medium py-2 rounded-md text-center transition-colors"
              >
                Commander
              </Link>
            </div>
            
            <button
              onClick={() => {
                clearCart();
                toast.success('Panier vidé avec succès');
              }}
              className="mt-4 text-red-400 hover:text-red-300 text-sm text-center w-full"
            >
              Vider le panier
            </button>
          </div>
        )}
      </div>
    </div>
  );
}; 