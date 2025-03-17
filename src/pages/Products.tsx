import { useState } from 'react';
import ProductList from '../components/products/ProductList';
import Sidebar from '../components/layout/Sidebar';
import { FaSearch } from 'react-icons/fa';

// Interface pour définir la structure de nos filtres
interface Filters {
  sponsors: string[];
  clubs: string[];
  categories: string[];
}

const Products = () => {
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState<Filters>({
    sponsors: [],
    clubs: [],
    categories: [],
  });

  // Gérer le changement de texte dans le champ de recherche
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  // Gérer la soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <h1 className='text-3xl font-bold'>
          {searchValue ? `Résultats pour "${searchValue}"` : 'Tous les produits'}
        </h1>
        <form onSubmit={handleSubmit} className="w-full md:w-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchValue}
              onChange={handleInputChange}
              className="w-full px-4 py-2 pr-10 text-white border border-gray-700 rounded-md md:w-80 bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              className="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2 hover:text-white"
            >
              <FaSearch />
            </button>
          </div>
        </form>
      </div>

      <div className="flex flex-col gap-8 mt-6 md:flex-row">
        <div className="w-full md:w-1/4">
          <Sidebar onFilterChange={setFilters} />
        </div>
        <div className="w-full md:w-3/4">
          <ProductList
            searchTerm={searchValue}
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
