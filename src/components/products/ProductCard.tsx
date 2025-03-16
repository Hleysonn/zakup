// import { Link } from '@tanstack/react-router';
import { FaStar, FaShoppingCart, FaHeart, FaEye, FaTimes } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-hot-toast';
import { useState, useRef, useEffect } from 'react';

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
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? 'Retiré des favoris' : 'Ajouté aux favoris');
  };

  const openProductModal = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setShowModal(false);
    document.body.style.overflow = 'unset';
  };

  // Fermer le modal quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        closeModal();
      }
    };

    if (showModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showModal]);

  // Fermer le modal avec la touche Escape
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };

    if (showModal) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showModal]);

  return (
    <>
      <div 
        className="relative flex flex-col h-full overflow-hidden transition-all duration-300 transform bg-white shadow-md group rounded-xl hover:shadow-xl hover:-translate-y-2"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Bouton favori */}
        <div className="absolute z-10 top-3 right-3">
          <button 
            onClick={handleToggleFavorite}
            className={`flex items-center justify-center w-9 h-9 rounded-full ${
              isFavorite 
                ? 'bg-red-500 text-white' 
                : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
            } backdrop-blur-sm transition-all duration-300 transform hover:scale-110 shadow-md`}
            aria-label="Ajouter aux favoris"
          >
            <FaHeart className="text-base" />
          </button>
        </div>
        
        {/* Section image et overlay */}
        <div 
          className="flex-shrink-0 block cursor-pointer"
          onClick={openProductModal}
        >
          <div className="relative flex items-center justify-center overflow-hidden bg-gray-100 aspect-square">
            {imageError || !getImageUrl() ? (
              <div className="flex flex-col items-center justify-center w-full h-full text-gray-400">
                <span className="mb-2 text-3xl">📷</span>
                <span className="text-sm">Image non disponible</span>
              </div>
            ) : (
              <>
                <img
                  src={getImageUrl()!}
                  alt={nom}
                  className="object-contain w-full h-full transition-transform duration-500 group-hover:scale-110"
                  onError={handleImageError}
                />
                <div className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 ${isHovered ? 'opacity-100' : ''}`}></div>
              </>
            )}
            
            {/* Badge du vendeur */}
            <div className="absolute top-3 left-3">
              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                vendeur.type === 'sponsor' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
              } backdrop-blur-sm shadow-sm`}>
                {vendeur.type === 'sponsor' ? 'Sponsor' : 'Club'}
              </span>
            </div>
            
            {/* Prix en badge */}
            <div className="absolute bottom-3 left-3">
              <span className="inline-flex items-center px-4 py-2 text-xl font-bold text-white bg-red-600 rounded-lg shadow-lg">
                {prix.toFixed(2)} €
              </span>
            </div>
            
            {/* Actions au survol */}
            <div className={`absolute bottom-0 right-0 p-3 flex space-x-2 transition-all duration-300 transform ${
              isHovered ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
              <button
                onClick={handleAddToCart}
                className="flex items-center justify-center w-12 h-12 text-white transition-transform duration-300 rounded-full shadow-lg bg-primary hover:bg-primary/90 hover:scale-110"
                aria-label="Ajouter au panier"
              >
                <FaShoppingCart className="text-lg" />
              </button>
              <button
                onClick={openProductModal}
                className="flex items-center justify-center w-12 h-12 text-white transition-transform duration-300 rounded-full shadow-lg bg-gray-800/80 hover:bg-gray-800 hover:scale-110"
                aria-label="Voir le produit"
              >
                <FaEye className="text-lg" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Informations du produit */}
        <div 
          className="flex flex-col flex-grow p-4 cursor-pointer"
          onClick={openProductModal}
        >
          <h3 className="text-xl font-bold text-gray-900 truncate transition-colors group-hover:text-primary">
            {nom}
          </h3>
            
          <div className="flex items-center my-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, index) => (
                <FaStar
                  key={index}
                  className={`w-5 h-5 ${
                    index < Math.round(notesMoyenne)
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="ml-2 text-base font-medium text-gray-600">
              ({notesMoyenne.toFixed(1)})
            </span>
          </div>
            
          <p className="text-base text-gray-600 line-clamp-2 min-h-[3rem] mb-3">{description}</p>
          
          <div className="mt-auto mb-2 text-base font-medium text-gray-600">
            <span>{vendeur.nom}</span>
          </div>
        </div>
        
        {/* Bouton d'ajout au panier principal */}
        <div className="px-4 pb-4 mt-auto">
          <button
            onClick={handleAddToCart}
            className="flex items-center justify-center w-full px-4 py-3 space-x-2 text-lg font-medium text-white transition-colors duration-300 bg-green-600 rounded-lg shadow-md hover:bg-green-700 hover:shadow-lg"
          >
            <FaShoppingCart className="text-lg" />
            <span>Ajouter au panier</span>
          </button>
        </div>
      </div>

      {/* Modal de détails du produit */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div ref={modalRef} className="relative flex w-full max-w-4xl bg-white rounded-lg shadow-xl overflow-hidden max-h-[90vh]">
            <button 
              onClick={closeModal}
              className="absolute z-10 flex items-center justify-center w-10 h-10 text-white transition-colors rounded-full bg-gray-800/70 hover:bg-red-600 top-3 right-3"
            >
              <FaTimes className="text-lg" />
            </button>
            
            <div className="flex flex-col w-full md:flex-row">
              {/* Image du produit */}
              <div className="flex items-center justify-center w-full p-6 bg-gray-100 md:w-1/2">
                {getImageUrl() ? (
                  <img 
                    src={getImageUrl()!} 
                    alt={nom} 
                    className="object-contain w-full max-h-96"
                    onError={handleImageError}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center w-full text-gray-400 h-80">
                    <span className="mb-2 text-5xl">📷</span>
                    <span className="text-lg">Image non disponible</span>
                  </div>
                )}
              </div>
              
              {/* Détails du produit */}
              <div className="flex flex-col w-full p-6 overflow-y-auto md:w-1/2">
                <div className="mb-2">
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                    vendeur.type === 'sponsor' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {vendeur.type === 'sponsor' ? 'Sponsor' : 'Club'}: {vendeur.nom}
                  </span>
                </div>
                
                <h2 className="mb-2 text-2xl font-bold text-gray-900">{nom}</h2>
                
                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, index) => (
                      <FaStar
                        key={index}
                        className={`w-5 h-5 ${
                          index < Math.round(notesMoyenne)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-base font-medium text-gray-600">
                    ({notesMoyenne.toFixed(1)})
                  </span>
                </div>
                
                <div className="mb-6 text-3xl font-bold text-red-600">
                  {prix.toFixed(2)} €
                </div>
                
                <div className="mb-8 text-gray-600">
                  <h3 className="mb-2 text-lg font-semibold">Description</h3>
                  <p className="text-base">{description}</p>
                </div>
                
                <div className="mt-auto">
                  <button
                    onClick={(e) => {
                      handleAddToCart(e);
                      closeModal();
                    }}
                    className="flex items-center justify-center w-full px-6 py-4 space-x-2 text-xl font-medium text-white transition-colors duration-300 bg-green-600 rounded-lg shadow-md hover:bg-green-700"
                  >
                    <FaShoppingCart className="text-xl" />
                    <span>Ajouter au panier</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 