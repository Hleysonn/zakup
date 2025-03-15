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
    // Fonction simple pour charger les produits
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Construire l'URL de base
        let url = '/api/products';
        
        // Ajouter des paramètres si nécessaire
        const params = new URLSearchParams();
        if (sponsorId) params.append('sponsorId', sponsorId);
        if (clubId) params.append('clubId', clubId);
        if (category) params.append('category', category);
        if (searchTerm) params.append('search', searchTerm);
        
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
        
        console.log("Chargement des produits depuis:", url);
        
        // Faire une simple requête GET
        const response = await axiosInstance.get(url);
        console.log("Données reçues:", response.data);
        
        // Extraire les produits selon le format de la réponse
        let productsData = [];
        
        if (Array.isArray(response.data)) {
          // Si c'est directement un tableau
          productsData = response.data;
        } else if (response.data && response.data.products && Array.isArray(response.data.products)) {
          // Format { products: [...] }
          productsData = response.data.products;
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          // Format { data: [...] }
          productsData = response.data.data;
        } else {
          setError("Format de données non reconnu");
          return;
        }
        
        // Filtrer les produits valides et normaliser les images
        const validProducts = productsData
          .filter((p: RawProductData) => p && p._id && typeof p._id === 'string')
          .map((p: RawProductData) => {
            // S'assurer que le produit a toutes les propriétés requises
            const baseUrl = import.meta.env.VITE_API_URL || '';
            const product = {
              ...p,
              description: p.description || 'Aucune description disponible',
              prix: p.prix || 0,
              notesMoyenne: p.notesMoyenne || 0,
              // Gérer les données du vendeur qui peuvent être juste un ID
              vendeur: processVendeur(p.vendeur, p.vendeurModel),
              // Traiter les images
              images: processImages(p.images, baseUrl)
            };
            console.log('Produit traité:', product.nom, 'Images:', product.images);
            return product as Product;
          });
        
        console.log('URL de base API:', import.meta.env.VITE_API_URL);
        console.log('window.location.origin:', window.location.origin);
        console.log('Tous les produits avec URLs complètes:', validProducts);
        
        setProducts(validProducts);
      } catch (err) {
        console.error("Erreur:", err);
        setError("Impossible de charger les produits");
      } finally {
        setLoading(false);
      }
    };
    
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
    
    loadProducts();
  }, [sponsorId, clubId, category, searchTerm]);

  // Afficher un indicateur de chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <FaSpinner className="text-4xl animate-spin text-primary" />
      </div>
    );
  }

  // Afficher un message d'erreur si nécessaire
  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-lg text-red-500">{error}</p>
        <button
          onClick={() => setError(null)}
          className="mt-4 btn btn-primary"
        >
          Réessayer
        </button>
      </div>
    );
  }

  // Si aucun produit n'est trouvé
  if (products.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-lg text-gray-500">
          Aucun produit trouvé pour ces critères.
        </p>
      </div>
    );
  }

  // Afficher les produits
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