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
  categorie?: string;
  vendeur: {
    _id: string;
    nom: string;
    type: 'sponsor' | 'club';
  };
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

  // Charger tous les produits une seule fois
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Récupérer tous les produits 
        const response = await axiosInstance.get('/api/products');
        
        // Extraire les données en fonction de la structure de la réponse
        let productsData = [];
        if (Array.isArray(response.data)) {
          productsData = response.data;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          productsData = response.data.data;
        } else if (response.data?.products && Array.isArray(response.data.products)) {
          productsData = response.data.products;
        } else {
          setError("Format de données non reconnu");
          return;
        }
        
        // Normaliser les données
        const normalizedProducts = productsData.map((p: any) => ({
          _id: p._id || 'unknown',
          nom: p.nom || 'Produit sans nom',
          prix: p.prix || 0,
          description: p.description || 'Aucune description disponible',
          images: p.images || ['/placeholder.png'],
          notesMoyenne: p.notesMoyenne || 0,
          categorie: p.categorie || '',
          vendeur: {
            _id: p.vendeur?._id || 'unknown',
            nom: p.vendeur?.nom || (p.vendeurModel || 'Vendeur'),
            type: p.vendeur?.type || (p.vendeurModel?.toLowerCase() === 'club' ? 'club' : 'sponsor')
          }
        }));
        
        setProducts(normalizedProducts);
      } catch (err) {
        setError("Impossible de charger les produits");
      } finally {
        setLoading(false);
      }
    };
    
    loadProducts();
  }, []); // Charger les produits une seule fois

  // Filtrer les produits en fonction des critères
  const filteredProducts = products.filter(product => {
    // Filtrer par recherche (nom ou description)
    if (searchTerm?.trim()) {
      const term = searchTerm.toLowerCase().trim();
      const searchMatch = 
        product.nom.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term) ||
        product.vendeur.nom.toLowerCase().includes(term);
      
      if (!searchMatch) return false;
    }
    
    // Filtrer par club
    if (clubId && (!product.vendeur || product.vendeur.type !== 'club' || product.vendeur._id !== clubId)) {
      return false;
    }
    
    // Filtrer par sponsor
    if (sponsorId && (!product.vendeur || product.vendeur.type !== 'sponsor' || product.vendeur._id !== sponsorId)) {
      return false;
    }
    
    // Filtrer par catégorie
    if (category && product.categorie !== category) {
      return false;
    }
    
    return true;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center w-full p-8">
        <FaSpinner className="text-4xl animate-spin text-primary" />
        <p className="mt-4 text-lg">Chargement des produits...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 mt-4 text-white bg-red-500 rounded-md">
        <p><strong>Erreur:</strong> {error}</p>
      </div>
    );
  }

  if (!filteredProducts.length) {
    return (
      <div className="p-8 text-center">
        <p className="text-lg text-gray-500">
          Aucun produit ne correspond à votre recherche.
          {searchTerm && <span className="block mt-2">Terme recherché: "{searchTerm}"</span>}
          {category && <span className="block mt-2">Catégorie: {category}</span>}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {filteredProducts.map((product) => (
        <ProductCard
          key={product._id}
          _id={product._id}
          nom={product.nom}
          prix={product.prix}
          description={product.description}
          images={product.images}
          notesMoyenne={product.notesMoyenne}
          vendeur={product.vendeur}
        />
      ))}
    </div>
  );
};

export default ProductList; 