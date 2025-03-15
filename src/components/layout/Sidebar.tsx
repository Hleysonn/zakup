import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import axios from 'axios';
import { FaFilter, FaTimes, FaChevronDown } from 'react-icons/fa';

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
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    sponsors: true,
    clubs: true
  });

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

  const toggleSection = (section: 'categories' | 'sponsors' | 'clubs') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <>
      {/* Bouton pour ouvrir la sidebar sur mobile */}
      <button
        onClick={toggleSidebar}
        className={`
          fixed bottom-4 right-4 z-50 md:hidden 
          bg-gradient-to-r from-primary to-primary-dark
          text-white p-3 rounded-full shadow-lg 
          hover:scale-110 hover:rotate-180
          active:scale-95
          transition-all duration-300 ease-in-out
          animate-float
        `}
      >
        {isOpen ? <FaTimes size={20} /> : <FaFilter size={20} />}
      </button>

      {/* Overlay pour mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden backdrop-blur-sm"
          onClick={toggleSidebar}
          style={{
            animation: 'fadeIn 0.3s ease-out'
          }}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          bg-white p-6 shadow-xl rounded-lg 
          ${isOpen 
            ? 'fixed inset-y-0 right-0 w-80 z-40 translate-x-0' 
            : 'hidden md:block md:translate-x-0'
          }
          transition-all duration-300 ease-in-out
          animate-slideIn
        `}
      >
        <div className="md:hidden flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
            Filtres
          </h2>
          <button 
            onClick={toggleSidebar}
            className="text-gray-500 hover:text-primary hover:rotate-180 transition-all duration-300"
          >
            <FaTimes size={24} />
          </button>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
              Filtres
            </h3>
            <button
              onClick={clearFilters}
              className="
                text-sm text-gray-700 font-medium
                relative after:absolute after:bottom-0 after:left-0 
                after:w-full after:h-0.5 after:bg-primary
                after:transform after:scale-x-0 after:origin-left
                hover:after:scale-x-100 after:transition-transform
                after:duration-300
              "
            >
              Réinitialiser
            </button>
          </div>
          <div className="h-0.5 bg-gradient-to-r from-primary to-primary-dark transform origin-left scale-x-0 animate-scale-x"></div>
        </div>

        {/* Catégories */}
        <div className="mb-8 filter-section">
          <button 
            onClick={() => toggleSection('categories')}
            className="w-full flex justify-between items-center mb-4 group"
          >
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors duration-200">
              Catégories
            </h3>
            <FaChevronDown 
              className={`
                transform transition-all duration-300
                ${expandedSections.categories ? 'rotate-180 text-primary' : 'rotate-0'}
                text-gray-500 group-hover:text-primary
              `}
            />
          </button>
          <div 
            className={`
              space-y-3 overflow-hidden transition-all duration-300 ease-in-out
              ${expandedSections.categories ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
            `}
          >
            {categories.map((category, index) => (
              <div 
                key={category} 
                className="flex items-center transform hover:translate-x-2 transition-transform duration-200"
                style={{
                  animation: 'slideUp 0.3s ease-out forwards',
                  animationDelay: `${index * 0.05}s`
                }}
              >
                <div className="relative">
                  <input
                    type="checkbox"
                    id={`category-${category}`}
                    checked={selectedCategories.includes(category)}
                    onChange={() => handleCategoryChange(category)}
                    className="
                      w-4 h-4 text-primary border-gray-300 rounded 
                      focus:ring-primary transition-all duration-200
                      checked:bg-primary checked:border-transparent
                      hover:border-primary
                    "
                  />
                  <div className="absolute inset-0 bg-primary transform scale-0 opacity-0 transition-transform duration-200 rounded pointer-events-none" />
                </div>
                <label 
                  htmlFor={`category-${category}`} 
                  className="
                    ml-3 text-base text-gray-700 hover:text-primary 
                    cursor-pointer transition-colors duration-200
                    hover:font-medium
                  "
                >
                  {category}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Sponsors */}
        <div className="mb-8">
          <button 
            onClick={() => toggleSection('sponsors')}
            className="w-full flex justify-between items-center mb-4 group"
          >
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-gray-700">Sponsors</h3>
            <FaChevronDown 
              className={`
                transform transition-transform duration-300
                ${expandedSections.sponsors ? 'rotate-180' : 'rotate-0'}
                text-gray-500 group-hover:text-gray-700
              `}
            />
          </button>
          <div 
            className={`
              overflow-hidden transition-all duration-300 ease-in-out
              ${expandedSections.sponsors ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}
            `}
          >
            {loading ? (
              <p className="text-base text-gray-500 animate-pulse">Chargement...</p>
            ) : error ? (
              <p className="text-base text-red-500">{error}</p>
            ) : (
              <div className="space-y-3 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {sponsors.map(sponsor => (
                  <div 
                    key={sponsor._id} 
                    className="flex items-center transform hover:translate-x-2 transition-transform duration-200"
                  >
                    <input
                      type="checkbox"
                      id={`sponsor-${sponsor._id}`}
                      checked={selectedSponsors.includes(sponsor._id)}
                      onChange={() => handleSponsorChange(sponsor._id)}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary transition-colors duration-200"
                    />
                    <label 
                      htmlFor={`sponsor-${sponsor._id}`} 
                      className="ml-3 text-base text-gray-700 hover:text-gray-900 cursor-pointer truncate"
                    >
                      {sponsor.raisonSociale}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Link 
            to="/sponsors" 
            className="text-base text-gray-700 hover:text-gray-900 hover:underline font-medium block mt-4 transform hover:translate-x-2 transition-transform duration-200"
          >
            Voir tous les sponsors
          </Link>
        </div>

        {/* Clubs */}
        <div className="mb-8">
          <button 
            onClick={() => toggleSection('clubs')}
            className="w-full flex justify-between items-center mb-4 group"
          >
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-gray-700">Clubs</h3>
            <FaChevronDown 
              className={`
                transform transition-transform duration-300
                ${expandedSections.clubs ? 'rotate-180' : 'rotate-0'}
                text-gray-500 group-hover:text-gray-700
              `}
            />
          </button>
          <div 
            className={`
              overflow-hidden transition-all duration-300 ease-in-out
              ${expandedSections.clubs ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}
            `}
          >
            {loading ? (
              <p className="text-base text-gray-500 animate-pulse">Chargement...</p>
            ) : error ? (
              <p className="text-base text-red-500">{error}</p>
            ) : (
              <div className="space-y-3 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {clubs.map(club => (
                  <div 
                    key={club._id} 
                    className="flex items-center transform hover:translate-x-2 transition-transform duration-200"
                  >
                    <input
                      type="checkbox"
                      id={`club-${club._id}`}
                      checked={selectedClubs.includes(club._id)}
                      onChange={() => handleClubChange(club._id)}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary transition-colors duration-200"
                    />
                    <label 
                      htmlFor={`club-${club._id}`} 
                      className="ml-3 text-base text-gray-700 hover:text-gray-900 cursor-pointer truncate"
                    >
                      {club.raisonSociale} {club.sport && `(${club.sport})`}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Link 
            to="/clubs" 
            className="text-base text-gray-700 hover:text-gray-900 hover:underline font-medium block mt-4 transform hover:translate-x-2 transition-transform duration-200"
          >
            Voir tous les clubs
          </Link>
        </div>

        {/* Bouton appliquer sur mobile */}
        <div className="md:hidden">
          <button
            onClick={toggleSidebar}
            className="
              w-full py-3 rounded-lg font-medium
              bg-gradient-to-r from-primary to-primary-dark
              text-white shadow-lg
              transform hover:scale-105 active:scale-95
              transition-all duration-200
              hover:shadow-xl
            "
          >
            Appliquer les filtres
          </button>
        </div>
      </aside>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(10px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .filter-section:hover {
          transform: translateX(5px);
          transition: transform 0.3s ease;
        }

        /* Personnalisation de la scrollbar */
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 2px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, var(--primary), var(--primary-dark));
          border-radius: 2px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: var(--primary-dark);
        }
      `}</style>
    </>
  );
};

export default Sidebar; 