import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import axios from 'axios';
import { FaFilter, FaTimes } from 'react-icons/fa';

interface Sponsor {
  _id: string;
  raisonSociale: string;
  logo?: string;
}

interface Club {
  _id: string;
  raisonSociale: string;
  sport?: string;
  logo?: string;
}

interface SidebarProps {
  onFilterChange: (filters: { sponsors: string[], clubs: string[], categories: string[] }) => void;
}

const Sidebar = ({ onFilterChange }: SidebarProps) => {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSponsors, setSelectedSponsors] = useState<string[]>([]);
  const [selectedClubs, setSelectedClubs] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const categories = [
    'Vêtements',
    'Équipements',
    'Accessoires',
    'Nutrition',
    'Autres'
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Récupérer les sponsors
        const sponsorsRes = await axios.get('/api/sponsors');
        setSponsors(sponsorsRes.data.data);
        
        // Récupérer les clubs
        const clubsRes = await axios.get('/api/clubs');
        setClubs(clubsRes.data.data);
        
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Erreur lors du chargement des filtres');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Mettre à jour les filtres lorsque les sélections changent
    onFilterChange({
      sponsors: selectedSponsors,
      clubs: selectedClubs,
      categories: selectedCategories
    });
  }, [selectedSponsors, selectedClubs, selectedCategories, onFilterChange]);

  const handleSponsorChange = (sponsorId: string) => {
    setSelectedSponsors(prev => 
      prev.includes(sponsorId)
        ? prev.filter(id => id !== sponsorId)
        : [...prev, sponsorId]
    );
  };

  const handleClubChange = (clubId: string) => {
    setSelectedClubs(prev => 
      prev.includes(clubId)
        ? prev.filter(id => id !== clubId)
        : [...prev, clubId]
    );
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(cat => cat !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSelectedSponsors([]);
    setSelectedClubs([]);
    setSelectedCategories([]);
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Bouton pour ouvrir la sidebar sur mobile */}
      <button
        onClick={toggleSidebar}
        className="fixed bottom-4 right-4 z-50 md:hidden bg-primary text-white p-3 rounded-full shadow-lg"
      >
        {isOpen ? <FaTimes size={20} /> : <FaFilter size={20} />}
      </button>

      {/* Sidebar */}
      <aside className={`bg-white p-4 shadow-md rounded-md ${isOpen ? 'fixed inset-0 z-40 overflow-auto' : 'hidden md:block'}`}>
        <div className="md:hidden flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Filtres</h2>
          <button onClick={toggleSidebar} className="text-gray-500">
            <FaTimes size={20} />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Filtres</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-primary hover:underline"
            >
              Réinitialiser
            </button>
          </div>
          <div className="h-0.5 bg-gray-200 mb-4"></div>
        </div>

        {/* Catégories */}
        <div className="mb-6">
          <h3 className="font-medium mb-2">Catégories</h3>
          <div className="space-y-2">
            {categories.map(category => (
              <div key={category} className="flex items-center">
                <input
                  type="checkbox"
                  id={`category-${category}`}
                  checked={selectedCategories.includes(category)}
                  onChange={() => handleCategoryChange(category)}
                  className="mr-2"
                />
                <label htmlFor={`category-${category}`} className="text-sm">
                  {category}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Sponsors */}
        <div className="mb-6">
          <h3 className="font-medium mb-2">Sponsors</h3>
          {loading ? (
            <p className="text-sm text-gray-500">Chargement...</p>
          ) : error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {sponsors.map(sponsor => (
                <div key={sponsor._id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`sponsor-${sponsor._id}`}
                    checked={selectedSponsors.includes(sponsor._id)}
                    onChange={() => handleSponsorChange(sponsor._id)}
                    className="mr-2"
                  />
                  <label htmlFor={`sponsor-${sponsor._id}`} className="text-sm">
                    {sponsor.raisonSociale}
                  </label>
                </div>
              ))}
            </div>
          )}
          <Link to="/sponsors" className="text-sm text-primary hover:underline block mt-2">
            Voir tous les sponsors
          </Link>
        </div>

        {/* Clubs */}
        <div className="mb-6">
          <h3 className="font-medium mb-2">Clubs</h3>
          {loading ? (
            <p className="text-sm text-gray-500">Chargement...</p>
          ) : error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {clubs.map(club => (
                <div key={club._id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`club-${club._id}`}
                    checked={selectedClubs.includes(club._id)}
                    onChange={() => handleClubChange(club._id)}
                    className="mr-2"
                  />
                  <label htmlFor={`club-${club._id}`} className="text-sm">
                    {club.raisonSociale} {club.sport && `(${club.sport})`}
                  </label>
                </div>
              ))}
            </div>
          )}
          <Link to="/clubs" className="text-sm text-primary hover:underline block mt-2">
            Voir tous les clubs
          </Link>
        </div>

        {/* Bouton appliquer sur mobile */}
        <div className="md:hidden">
          <button
            onClick={toggleSidebar}
            className="w-full bg-primary text-white py-2 rounded-md"
          >
            Appliquer les filtres
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar; 