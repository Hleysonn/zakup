import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaSpinner, FaLock, FaCreditCard, FaPaypal } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'react-hot-toast';
import axios from 'axios';

interface CheckoutFormData {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresseLivraison: string;
  ville: string;
  codePostal: string;
  pays: string;
  methodePaiement: 'carte' | 'paypal';
  numeroCarte?: string;
  dateExpiration?: string;
  cvv?: string;
  saveInfo: boolean;
}

const Checkout = () => {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'carte' | 'paypal'>('carte');

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<CheckoutFormData>({
    defaultValues: {
      nom: user?.nom || '',
      prenom: user?.prenom || '',
      email: user?.email || '',
      telephone: user?.telephone || '',
      adresseLivraison: user?.adresse || '',
      methodePaiement: 'carte',
      saveInfo: true
    }
  });

  if (!isAuthenticated) {
    navigate({ to: '/login' });
    return null;
  }

  if (cartItems.length === 0) {
    navigate({ to: '/cart' });
    return null;
  }

  const onSubmit = async (data: CheckoutFormData) => {
    try {
      setIsSubmitting(true);
      
      // Préparer les données de la commande
      const orderData = {
        utilisateur: user?._id,
        produits: cartItems.map(item => ({
          produit: item._id,
          quantite: item.quantite,
          prixUnitaire: item.prix
        })),
        adresseLivraison: {
          rue: data.adresseLivraison,
          ville: data.ville,
          codePostal: data.codePostal,
          pays: data.pays
        },
        methodePaiement: data.methodePaiement,
        montantTotal: totalPrice,
        statut: 'en attente'
      };

      // Simuler un délai de traitement du paiement
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Envoyer la commande à l'API
      const response = await axios.post('/api/orders', orderData);
      
      // Vider le panier après une commande réussie
      clearCart();
      
      // Rediriger vers la page de confirmation
      navigate({ 
        to: '/order-confirmation',
        search: { orderId: response.data._id }
      });
      
      toast.success('Commande passée avec succès !');
    } catch (error) {
      console.error('Erreur lors de la commande:', error);
      toast.error('Une erreur est survenue lors du traitement de votre commande');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Finaliser votre commande</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Informations de livraison</h2>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label htmlFor="prenom" className="block text-gray-700 mb-2">
                    Prénom
                  </label>
                  <input
                    id="prenom"
                    type="text"
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.prenom ? 'border-red-500' : 'border-gray-300'
                    }`}
                    {...register('prenom', { required: 'Le prénom est requis' })}
                  />
                  {errors.prenom && (
                    <p className="text-red-500 text-sm mt-1">{errors.prenom.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="nom" className="block text-gray-700 mb-2">
                    Nom
                  </label>
                  <input
                    id="nom"
                    type="text"
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.nom ? 'border-red-500' : 'border-gray-300'
                    }`}
                    {...register('nom', { required: 'Le nom est requis' })}
                  />
                  {errors.nom && (
                    <p className="text-red-500 text-sm mt-1">{errors.nom.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    {...register('email', {
                      required: 'L\'email est requis',
                      pattern: {
                        value: /^\S+@\S+\.\S+$/,
                        message: 'Format d\'email invalide'
                      }
                    })}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="telephone" className="block text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    id="telephone"
                    type="tel"
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.telephone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    {...register('telephone', { required: 'Le téléphone est requis' })}
                  />
                  {errors.telephone && (
                    <p className="text-red-500 text-sm mt-1">{errors.telephone.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="adresseLivraison" className="block text-gray-700 mb-2">
                    Adresse de livraison
                  </label>
                  <input
                    id="adresseLivraison"
                    type="text"
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.adresseLivraison ? 'border-red-500' : 'border-gray-300'
                    }`}
                    {...register('adresseLivraison', { required: 'L\'adresse est requise' })}
                  />
                  {errors.adresseLivraison && (
                    <p className="text-red-500 text-sm mt-1">{errors.adresseLivraison.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="ville" className="block text-gray-700 mb-2">
                    Ville
                  </label>
                  <input
                    id="ville"
                    type="text"
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.ville ? 'border-red-500' : 'border-gray-300'
                    }`}
                    {...register('ville', { required: 'La ville est requise' })}
                  />
                  {errors.ville && (
                    <p className="text-red-500 text-sm mt-1">{errors.ville.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="codePostal" className="block text-gray-700 mb-2">
                    Code postal
                  </label>
                  <input
                    id="codePostal"
                    type="text"
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.codePostal ? 'border-red-500' : 'border-gray-300'
                    }`}
                    {...register('codePostal', { required: 'Le code postal est requis' })}
                  />
                  {errors.codePostal && (
                    <p className="text-red-500 text-sm mt-1">{errors.codePostal.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="pays" className="block text-gray-700 mb-2">
                    Pays
                  </label>
                  <select
                    id="pays"
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.pays ? 'border-red-500' : 'border-gray-300'
                    }`}
                    {...register('pays', { required: 'Le pays est requis' })}
                  >
                    <option value="">Sélectionnez un pays</option>
                    <option value="France">France</option>
                    <option value="Belgique">Belgique</option>
                    <option value="Suisse">Suisse</option>
                    <option value="Canada">Canada</option>
                    <option value="Luxembourg">Luxembourg</option>
                  </select>
                  {errors.pays && (
                    <p className="text-red-500 text-sm mt-1">{errors.pays.message}</p>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Méthode de paiement</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      id="carte"
                      type="radio"
                      value="carte"
                      checked={paymentMethod === 'carte'}
                      onChange={() => setPaymentMethod('carte')}
                      className="mr-2"
                      {...register('methodePaiement')}
                    />
                    <label htmlFor="carte" className="flex items-center">
                      <FaCreditCard className="mr-2 text-blue-600" />
                      Carte de crédit
                    </label>
                  </div>

                  {paymentMethod === 'carte' && (
                    <div className="pl-6 space-y-4">
                      <div>
                        <label htmlFor="numeroCarte" className="block text-gray-700 mb-2">
                          Numéro de carte
                        </label>
                        <input
                          id="numeroCarte"
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                            errors.numeroCarte ? 'border-red-500' : 'border-gray-300'
                          }`}
                          {...register('numeroCarte', {
                            required: paymentMethod === 'carte' ? 'Le numéro de carte est requis' : false,
                            pattern: {
                              value: /^[0-9]{16}$/,
                              message: 'Format de carte invalide'
                            }
                          })}
                        />
                        {errors.numeroCarte && (
                          <p className="text-red-500 text-sm mt-1">{errors.numeroCarte.message}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="dateExpiration" className="block text-gray-700 mb-2">
                            Date d'expiration (MM/AA)
                          </label>
                          <input
                            id="dateExpiration"
                            type="text"
                            placeholder="MM/AA"
                            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                              errors.dateExpiration ? 'border-red-500' : 'border-gray-300'
                            }`}
                            {...register('dateExpiration', {
                              required: paymentMethod === 'carte' ? 'La date d\'expiration est requise' : false,
                              pattern: {
                                value: /^(0[1-9]|1[0-2])\/([0-9]{2})$/,
                                message: 'Format MM/AA requis'
                              }
                            })}
                          />
                          {errors.dateExpiration && (
                            <p className="text-red-500 text-sm mt-1">{errors.dateExpiration.message}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="cvv" className="block text-gray-700 mb-2">
                            CVV
                          </label>
                          <input
                            id="cvv"
                            type="text"
                            placeholder="123"
                            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                              errors.cvv ? 'border-red-500' : 'border-gray-300'
                            }`}
                            {...register('cvv', {
                              required: paymentMethod === 'carte' ? 'Le CVV est requis' : false,
                              pattern: {
                                value: /^[0-9]{3,4}$/,
                                message: 'CVV invalide'
                              }
                            })}
                          />
                          {errors.cvv && (
                            <p className="text-red-500 text-sm mt-1">{errors.cvv.message}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center">
                    <input
                      id="paypal"
                      type="radio"
                      value="paypal"
                      checked={paymentMethod === 'paypal'}
                      onChange={() => setPaymentMethod('paypal')}
                      className="mr-2"
                      {...register('methodePaiement')}
                    />
                    <label htmlFor="paypal" className="flex items-center">
                      <FaPaypal className="mr-2 text-blue-800" />
                      PayPal
                    </label>
                  </div>

                  {paymentMethod === 'paypal' && (
                    <div className="pl-6">
                      <p className="text-gray-600">
                        Vous serez redirigé vers PayPal pour finaliser votre paiement.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center mb-6">
                <input
                  id="saveInfo"
                  type="checkbox"
                  className="mr-2"
                  {...register('saveInfo')}
                />
                <label htmlFor="saveInfo" className="text-gray-700">
                  Sauvegarder ces informations pour mes prochaines commandes
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-white py-3 rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Traitement en cours...
                  </>
                ) : (
                  <>
                    <FaLock className="mr-2" />
                    Payer {totalPrice.toFixed(2)} €
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-xl font-semibold mb-4">Récapitulatif de la commande</h2>
            
            <div className="divide-y divide-gray-200">
              {cartItems.map((item) => (
                <div key={item._id} className="py-4 flex">
                  <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-md overflow-hidden mr-4">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.nom}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium">{item.nom}</h3>
                    <p className="text-sm text-gray-500">
                      Quantité: {item.quantite}
                    </p>
                    <p className="text-sm font-medium">
                      {(item.prix * item.quantite).toFixed(2)} €
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Sous-total</span>
                <span>{totalPrice.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Frais de livraison</span>
                <span>Gratuit</span>
              </div>
              <div className="flex justify-between font-bold text-lg mt-4">
                <span>Total</span>
                <span>{totalPrice.toFixed(2)} €</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 