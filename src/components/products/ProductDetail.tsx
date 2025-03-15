import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from '@tanstack/react-router';
import axios from 'axios';
import { FaStar, FaStarHalfAlt, FaRegStar, FaShoppingCart, FaArrowLeft, FaSpinner } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

interface Product {
  _id: string;
  nom: string;
  prix: number;
  description: string;
  images: string[];
  stock: number;
  categorie: string;
  notesMoyenne: number;
  vendeur: {
    _id: string;
    nom?: string;
    raisonSociale?: string;
    logo?: string;
  };
  avis: {
    _id: string;
    utilisateur: {
      _id: string;
      nom: string;
      prenom: string;
    };
    note: number;
    commentaire: string;
    date: string;
  }[];
}

interface ReviewFormData {
  note: number;
  commentaire: string;
}

const ProductDetail = () => {
  const { productId } = useParams({ from: '/products/$productId' });
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviewFormData, setReviewFormData] = useState<ReviewFormData>({
    note: 5,
    commentaire: '',
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/products/${productId}`);
        setProduct(response.data);
        setError(null);
      } catch (err) {
        setError('Erreur lors du chargement du produit');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0 && product && value <= product.stock) {
      setQuantity(value);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      const cartItem = {
        _id: product._id,
        nom: product.nom,
        prix: product.prix,
        quantite: quantity,
        vendeur: product.vendeur,
        image: product.images[0] || '',
      };

      addToCart(cartItem);
      toast.success('Produit ajouté au panier');
    }
  };

  const handleReviewChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setReviewFormData(prev => ({
      ...prev,
      [name]: name === 'note' ? parseInt(value) : value,
    }));
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Vous devez être connecté pour laisser un avis');
      navigate({ to: '/login' });
      return;
    }

    try {
      setSubmittingReview(true);
      await axios.post(`/api/products/${productId}/reviews`, reviewFormData);
      
      // Rafraîchir les données du produit pour afficher le nouvel avis
      const response = await axios.get(`/api/products/${productId}`);
      setProduct(response.data);
      
      // Réinitialiser le formulaire
      setReviewFormData({
        note: 5,
        commentaire: '',
      });
      
      toast.success('Votre avis a été ajouté avec succès');
    } catch (err) {
      toast.error('Erreur lors de l\'ajout de votre avis');
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-400" />);
      }
    }
    
    return stars;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <FaSpinner className="animate-spin text-4xl text-primary" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          {error || 'Produit non trouvé'}
        </h2>
        <Link to="/" className="text-primary hover:underline flex items-center justify-center">
          <FaArrowLeft className="mr-2" /> Retour à l'accueil
        </Link>
      </div>
    );
  }

  const hasUserReviewed = product.avis.some(
    review => user && review.utilisateur._id === user._id
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/products" className="flex items-center text-primary hover:underline mb-6">
        <FaArrowLeft className="mr-2" /> Retour aux produits
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Images du produit */}
        <div>
          <div className="bg-gray-100 rounded-lg overflow-hidden mb-4 h-[400px] flex items-center justify-center">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[selectedImage]}
                alt={product.nom}
                className="object-contain h-full w-full"
              />
            ) : (
              <div className="text-gray-400 text-center p-8">
                Aucune image disponible
              </div>
            )}
          </div>

          {/* Miniatures */}
          {product.images && product.images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 rounded-md overflow-hidden border-2 ${
                    selectedImage === index ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.nom} - vue ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Informations du produit */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.nom}</h1>
          
          <div className="flex items-center mb-4">
            <div className="flex mr-2">
              {renderStars(product.notesMoyenne)}
            </div>
            <span className="text-gray-600">
              ({product.avis.length} avis)
            </span>
          </div>

          <div className="text-2xl font-bold text-primary mb-4">
            {product.prix.toFixed(2)} €
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-gray-700">{product.description}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Vendeur</h2>
            <Link
              to={`/${product.vendeur.raisonSociale ? 'sponsors' : 'clubs'}/${product.vendeur._id}`}
              className="flex items-center text-primary hover:underline"
            >
              {product.vendeur.logo && (
                <img
                  src={product.vendeur.logo}
                  alt={product.vendeur.raisonSociale || product.vendeur.nom || ''}
                  className="w-8 h-8 rounded-full mr-2 object-cover"
                />
              )}
              <span>{product.vendeur.raisonSociale || product.vendeur.nom || 'Vendeur'}</span>
            </Link>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Disponibilité</h2>
            <p className={`${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {product.stock > 0
                ? `En stock (${product.stock} disponibles)`
                : 'Rupture de stock'}
            </p>
          </div>

          {product.stock > 0 && (
            <div className="flex items-center mb-6">
              <div className="mr-4">
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                  Quantité
                </label>
                <input
                  type="number"
                  id="quantity"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="w-20 border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-primary text-white py-3 px-6 rounded-md hover:bg-primary/90 flex items-center justify-center"
              >
                <FaShoppingCart className="mr-2" />
                Ajouter au panier
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Section des avis */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Avis clients</h2>

        {/* Formulaire d'avis */}
        {isAuthenticated && !hasUserReviewed && (
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h3 className="text-xl font-semibold mb-4">Laisser un avis</h3>
            <form onSubmit={handleReviewSubmit}>
              <div className="mb-4">
                <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
                  Note
                </label>
                <div className="flex items-center">
                  <input
                    type="range"
                    id="note"
                    name="note"
                    min="1"
                    max="5"
                    step="1"
                    value={reviewFormData.note}
                    onChange={handleReviewChange}
                    className="w-48 mr-4"
                  />
                  <div className="flex">
                    {renderStars(reviewFormData.note)}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="commentaire" className="block text-sm font-medium text-gray-700 mb-1">
                  Commentaire
                </label>
                <textarea
                  id="commentaire"
                  name="commentaire"
                  rows={4}
                  value={reviewFormData.commentaire}
                  onChange={handleReviewChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Partagez votre expérience avec ce produit..."
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingReview ? (
                  <span className="flex items-center">
                    <FaSpinner className="animate-spin mr-2" />
                    Envoi en cours...
                  </span>
                ) : (
                  'Soumettre mon avis'
                )}
              </button>
            </form>
          </div>
        )}

        {/* Liste des avis */}
        {product.avis.length > 0 ? (
          <div className="space-y-6">
            {product.avis.map(review => (
              <div key={review._id} className="border-b border-gray-200 pb-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-semibold">
                      {review.utilisateur.prenom} {review.utilisateur.nom}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(review.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex">
                    {renderStars(review.note)}
                  </div>
                </div>
                <p className="text-gray-700">{review.commentaire}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">Aucun avis pour ce produit pour le moment.</p>
        )}
      </div>
    </div>
  );
};

export default ProductDetail; 