import { Link } from '@tanstack/react-router';
import { FaStar, FaShoppingCart, FaHeart } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-hot-toast';
import { useState } from 'react';

interface ProductCardProps {
  _id: string;
  nom: string;
  prix: number;
  description: string;
  images: string[];
  notesMoyenne: number;
  vendeur: {
    _id: string;
    nom: string;
    type: 'sponsor' | 'club';
  };
}

export const ProductCard = ({
  _id,
  nom,
  prix,
  description,
  images,
  notesMoyenne,
  vendeur,
}: ProductCardProps) => {
  const { addToCart } = useCart();
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = () => {
    addToCart({
      _id,
      nom,
      prix,
      quantite: 1,
      image: images[0],
      vendeur: vendeur,
      vendeurModel: vendeur.type === 'sponsor' ? 'Sponsor' : 'Club'
    });
    toast.success('Produit ajouté au panier');
  };

  const handleImageError = () => {
    console.error(`Erreur de chargement de l'image pour ${nom}`);
    setImageError(true);
  };

  // Construire l'URL de l'image
  const getImageUrl = () => {
    if (!images || images.length === 0) {
      return null;
    }

    const imagePath = images[0];
    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    return `http://localhost:5000${imagePath}`;
  };

  return (
    <div className="card group">
      <Link to="/products/$productId" params={{ productId: _id }}>
        <div className="relative overflow-hidden bg-gray-100 aspect-square">
          {imageError || !getImageUrl() ? (
            <div className="flex flex-col items-center justify-center w-full h-full text-gray-400">
              <span className="mb-2 text-3xl">📷</span>
              <span className="text-sm">Image non disponible</span>
            </div>
          ) : (
            <img
              src={getImageUrl()!}
              alt={nom}
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
              onError={handleImageError}
            />
          )}
        </div>
      </Link>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <Link to="/products/$productId" params={{ productId: _id }}>
            <h3 className="text-lg font-semibold text-gray-900 transition-colors hover:text-primary">
              {nom}
            </h3>
          </Link>
          <button className="text-gray-400 transition-colors hover:text-red-500">
            <FaHeart />
          </button>
        </div>

        <div className="flex items-center mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, index) => (
              <FaStar
                key={index}
                className={`${
                  index < Math.round(notesMoyenne)
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="ml-2 text-sm text-gray-600">
            ({notesMoyenne.toFixed(1)})
          </span>
        </div>

        <p className="mb-4 text-sm text-gray-600 line-clamp-2">{description}</p>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-semibold text-primary">
              {prix.toFixed(2)} €
            </span>
            <span className="ml-1 text-sm text-gray-500">/ unité</span>
          </div>

          <button
            onClick={handleAddToCart}
            className="flex items-center space-x-2 btn btn-primary"
          >
            <FaShoppingCart />
            <span>Ajouter</span>
          </button>
        </div>

        <div className="pt-4 mt-4 border-t border-gray-100">
          <div className="flex items-center text-sm text-gray-500">
            <span className="capitalize">{vendeur.type}</span>
            <span className="mx-2">•</span>
            <span>{vendeur.nom}</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 