import { useState, useEffect } from 'react';
import axiosInstance from '../../config/axios';
import { ProductCard } from './ProductCard';
import { FaSpinner } from 'react-icons/fa';

interface Product {
  _id: string;
  nom: string;
  prix: number;
  description: string;
  images: string[];
  notesMoyenne: number;
  vendeur: {
    nom: string;
    type: 'sponsor' | 'club';
  };
}

// Interface pour les données brutes reçues de l'API
interface RawProductData extends Partial<Product> {
  vendeurModel?: string;
  categorie?: string;
  stock?: number;
  estVisible?: boolean;
  notes?: unknown[];
  createdAt?: string;
}

interface ProductListProps {
  sponsorId?: string;
  clubId?: string;
  category?: string;
  searchTerm?: string;
}

const ProductList = ({
  sponsorId,
  clubId,
  category,
  searchTerm,
}: ProductListProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let url = '/api/products';
        const params = new URLSearchParams();
        
        if (sponsorId) params.append('sponsorId', sponsorId);
        if (clubId) params.append('clubId', clubId);
        if (category) params.append('category', category);
        if (searchTerm) params.append('search', searchTerm);
        
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
        
        const response = await axiosInstance.get(url);
        let productsData = [];
        
        if (Array.isArray(response.data)) {
          productsData = response.data;
        } else if (response.data && response.data.products && Array.isArray(response.data.products)) {
          productsData = response.data.products;
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          productsData = response.data.data;
        } else {
          setError("Format de données non reconnu");
          return;
        }
        
        const validProducts = productsData
          .filter((p: RawProductData) => p && p._id && typeof p._id === 'string')
          .map((p: RawProductData) => {
            const baseUrl = import.meta.env.VITE_API_URL || '';
            return {
              ...p,
              description: p.description || 'Aucune description disponible',
              prix: p.prix || 0,
              notesMoyenne: p.notesMoyenne || 0,
              vendeur: processVendeur(p.vendeur, p.vendeurModel),
              images: processImages(p.images, baseUrl)
            } as Product;
          });
        
        setProducts(validProducts);
      } catch (err) {
        console.error("Erreur:", err);
        setError("Impossible de charger les produits");
      } finally {
        setLoading(false);
      }
    };
    
    loadProducts();
  }, [sponsorId, clubId, category, searchTerm]);

  // Fonction pour traiter le vendeur
  const processVendeur = (
    vendeur: unknown, 
    vendeurModel: string | undefined
  ): Product['vendeur'] => {
    if (vendeur && 
        typeof vendeur === 'object' && 
        'nom' in vendeur && 
        'type' in vendeur && 
        typeof vendeur.nom === 'string' && 
        (vendeur.type === 'sponsor' || vendeur.type === 'club')) {
      // Le vendeur est déjà au bon format
      return vendeur as Product['vendeur'];
    }
    
    // Sinon créer un objet vendeur par défaut
    return {
      nom: vendeurModel || 'Sponsor',
      type: (vendeurModel?.toLowerCase() === 'club' ? 'club' : 'sponsor')
    };
  };
  
  // Fonction pour traiter et valider les images
  const processImages = (images: string[] | undefined, baseUrl: string): string[] => {
    // Si pas d'images ou tableau vide, retourner une image par défaut
    if (!images || images.length === 0) {
      console.log('Aucune image trouvée, utilisation de l\'image par défaut');
      return ['/placeholder.png'];
    }
    
    // Filtrer les URL vides ou invalides
    const validImages = images.filter(img => img && typeof img === 'string');
    
    if (validImages.length === 0) {
      console.log('Aucune image valide trouvée, utilisation de l\'image par défaut');
      return ['/placeholder.png'];
    }
    
    // Obtenir l'URL de base correcte pour les requêtes API
    const apiBaseUrl = baseUrl || window.location.origin;
    console.log('URL de base pour les images:', apiBaseUrl);
    
    // Transformer les URLs relatives en URLs absolues si nécessaire
    return validImages.map(img => {
      // Si c'est déjà une URL absolue, la laisser telle quelle
      if (img.startsWith('http://') || img.startsWith('https://')) {
        return img;
      }
      
      // Si c'est un chemin commençant par /uploads/, ajouter l'URL de base de l'API
      if (img.startsWith('/uploads/')) {
        const fullUrl = `${apiBaseUrl}${img}`;
        console.log(`Image convertie: ${img} -> ${fullUrl}`);
        return fullUrl;
      }
      
      // Si c'est un placeholder, le laisser tel quel
      if (img === '/placeholder.png') {
        return img;
      }
      
      // Pour tout autre chemin absolu, ajouter l'URL de base
      if (img.startsWith('/')) {
        return `${apiBaseUrl}${img}`;
      }
      
      // Sinon c'est un chemin relatif, ajouter le préfixe approprié
      return `${apiBaseUrl}/uploads/products/${img}`;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <FaSpinner className="text-4xl animate-spin text-gray-700" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-lg text-red-500">{error}</p>
        <button
          onClick={() => setError(null)}
          className="px-6 py-2 mt-4 text-white bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-lg text-gray-500">
          Aucun produit trouvé pour ces critères.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map(product => (
          <ProductCard key={product._id} {...product} />
        ))}
      </div>
    </div>
  );
};

export default ProductList; 