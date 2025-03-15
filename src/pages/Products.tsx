import { useState, useCallback } from 'react';
import { useSearch } from '@tanstack/react-router';
import ProductList from '../components/products/ProductList';
import Sidebar from '../components/layout/Sidebar';

const Products = () => {
  const { search: searchParams } = useSearch({ from: '/products' });
  const searchTerm = searchParams?.search || '';
  
  const [filters, setFilters] = useState<{
    sponsors: string[];
    clubs: string[];
    categories: string[];
  }>({
    sponsors: [],
    clubs: [],
    categories: searchParams?.categorie ? [searchParams.categorie as string] : [],
  });

  const handleFilterChange = useCallback((newFilters: {
    sponsors: string[];
    clubs: string[];
    categories: string[];
  }) => {
    setFilters(newFilters);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        {searchTerm ? `Résultats pour "${searchTerm}"` : 'Tous les produits'}
      </h1>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/4">
          <Sidebar onFilterChange={handleFilterChange} />
        </div>
        <div className="w-full md:w-3/4">
          <ProductList 
            searchTerm={searchTerm}
            category={filters.categories[0]}
            sponsorId={filters.sponsors[0]}
            clubId={filters.clubs[0]}
          />
        </div>
      </div>
    </div>
  );
};

export default Products; 