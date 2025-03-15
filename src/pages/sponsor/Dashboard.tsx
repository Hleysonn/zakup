import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import axios from 'axios';
import { FaSpinner, FaExclamationTriangle, FaPlus, FaEdit, FaTrash, FaChartLine, FaUsers, FaBuilding, FaTags, FaHandshake, FaMoneyBillWave, FaBoxOpen } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import ProductForm from '../../components/products/ProductForm';

interface Product {
  _id: string;
  nom: string;
  prix: number;
  categorie: string;
  stock: number;
  vendu: number;
}

interface Club {
  _id: string;
  raisonSociale: string;
  sport: string;
  logo?: string;
}

interface SponsorDon {
  _id: string;
  club: Club;
  montant: number;
  date: string;
}

interface SponsorStats {
  totalProduits: number;
  produitsVendus: number;
  chiffreAffaires: number;
  totalClubs: number;
  totalDons: number;
  abonnes: number;
}

const SponsorDashboard = () => {
  const navigate = useNavigate();
  const { user, userType, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [dons, setDons] = useState<SponsorDon[]>([]);
  const [stats, setStats] = useState<SponsorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [productLoading, setProductLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddProductModal, setShowAddProductModal] = useState(false);

  // Vérifier que l'utilisateur est un sponsor
  useEffect(() => {
    if (!authLoading) {
      if (!user || userType !== 'sponsor') {
        toast.error('Accès non autorisé. Cette page est réservée aux sponsors.');
        navigate({ to: '/login' });
      }
    }
  }, [authLoading, user, userType, navigate]);

  // Charger les données du sponsor
  useEffect(() => {
    if (user && userType === 'sponsor') {
      fetchSponsorData();
    }
  }, [user, userType]);

  const fetchSponsorData = async () => {
    try {
      setLoading(true);
      // Utiliser uniquement l'endpoint dashboard qui existe
      const dashboardRes = await axios.get('/api/sponsors/dashboard');
      
      // Vérifier si la réponse contient des données, même partielles
      if (dashboardRes.data && dashboardRes.data.success) {
        const dashboardData = dashboardRes.data.data || {};
        
        // Afficher un message si la réponse contient un indicateur d'erreur
        if (dashboardRes.data.error) {
          console.warn("Données partielles reçues:", dashboardRes.data.message);
          toast.warning("Certaines données peuvent être incomplètes. L'équipe technique a été informée.");
        }
        
        // Utiliser des valeurs par défaut pour éviter les erreurs
        setStats({
          totalProduits: dashboardData.totalProducts || 0,
          produitsVendus: dashboardData.totalProductsSold || 0,
          chiffreAffaires: dashboardData.totalRevenue || 0,
          totalClubs: dashboardData.totalClubsSponsored || 0,
          totalDons: dashboardData.totalDonations || 0,
          abonnes: dashboardData.totalSubscribers || 0
        });
        
        // Manipuler les produits - n'afficher que les produits réels avec des IDs valides
        if (dashboardData.products && Array.isArray(dashboardData.products)) {
          // Filtrer pour ne garder que les produits ayant un ID réel
          const realProducts = dashboardData.products.filter(product => 
            product._id && typeof product._id === 'string' && !product._id.startsWith('temp-')
          );
          
          setProducts(realProducts.map(product => ({
            _id: product._id,
            nom: product.nom || 'Produit sans nom',
            prix: typeof product.prix === 'number' ? product.prix : 0,
            categorie: product.categorie || 'Non catégorisé',
            stock: typeof product.stock === 'number' ? product.stock : 0,
            vendu: typeof product.vendu === 'number' ? product.vendu : 0
          })));
        }
        
        // Manipuler les dons - n'afficher que les dons réels avec des IDs valides
        if (dashboardData.donations && Array.isArray(dashboardData.donations)) {
          // Filtrer pour ne garder que les dons ayant un ID réel
          const realDonations = dashboardData.donations.filter(don => 
            don._id && typeof don._id === 'string' && !don._id.startsWith('temp-') &&
            don.club && don.club._id && typeof don.club._id === 'string' && !don.club._id.startsWith('temp-')
          );
          
          setDons(realDonations.map(don => ({
            _id: don._id,
            club: {
              _id: don.club._id,
              raisonSociale: don.club.raisonSociale || 'Club sans nom',
              sport: don.club.sport || 'Sport non spécifié'
            },
            montant: typeof don.montant === 'number' ? don.montant : 0,
            date: don.date || new Date().toISOString()
          })));
        }
        
        setError(null);
      } else {
        throw new Error('La réponse du serveur n\'indique pas un succès ou est mal formée');
      }
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
      
      // Ajouter des informations de débogage plus détaillées
      if (axios.isAxiosError(err)) {
        const status = err.response?.status || 'inconnu';
        const message = err.response?.data?.message || err.message || 'Erreur inconnue';
        console.error(`Détails de l'erreur - Statut: ${status}, Message: ${message}`);
        
        if (status === 401) {
          toast.error('Session expirée. Veuillez vous reconnecter.');
          navigate({ to: '/login' });
          return;
        } else {
          setError(`Erreur ${status}: ${message}`);
        }
      } else {
        setError('Impossible de charger les données du tableau de bord');
      }
      
      toast.error('Une erreur est survenue lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      return;
    }

    try {
      setProductLoading(true);
      await axios.delete(`/api/products/${productId}`);
      setProducts(prev => prev.filter(p => p._id !== productId));
      toast.success('Produit supprimé avec succès');
    } catch (err) {
      console.error('Erreur lors de la suppression du produit:', err);
      toast.error('Impossible de supprimer le produit');
    } finally {
      setProductLoading(false);
    }
  };

  const handleAddProductSuccess = () => {
    setShowAddProductModal(false);
    fetchSponsorData();
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <FaSpinner className="animate-spin text-4xl text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <FaExclamationTriangle className="text-red-500 text-5xl mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          {error}
        </h1>
        <p className="text-gray-600 mb-6">
          Cette erreur peut être temporaire. Veuillez réessayer ou contacter notre équipe de support.
        </p>
        <div className="flex flex-col md:flex-row justify-center gap-4">
          <button
            onClick={fetchSponsorData}
            className="bg-primary text-white px-4 py-2 rounded-md inline-flex items-center justify-center"
          >
            <FaSpinner className={`mr-2 ${loading ? 'animate-spin' : ''}`} /> Réessayer
          </button>
          <a
            href="mailto:support@zakup.fr?subject=Erreur%20Tableau%20de%20bord%20Sponsor"
            className="bg-gray-600 text-white px-4 py-2 rounded-md inline-flex items-center justify-center"
          >
            Contacter le support
          </a>
        </div>
        <div className="mt-8 p-4 bg-gray-50 rounded-lg text-left max-w-2xl mx-auto">
          <h3 className="font-semibold mb-2">Informations techniques pour le support :</h3>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
            {error}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-12">
      <div className="container mx-auto px-4">
        {/* En-tête du dashboard */}
        <div className="bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg shadow-md p-6 mb-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Tableau de bord Sponsor</h1>
              <p className="text-gray-300 mt-1">Gérez vos produits et suivez vos statistiques</p>
            </div>
            <button
              onClick={() => setShowAddProductModal(true)}
              className="bg-white text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-md flex items-center font-medium transition-colors shadow-sm"
            >
              <FaPlus className="mr-2" /> Ajouter un produit
            </button>
          </div>
        </div>

        {/* Onglets */}
        <div className="bg-white rounded-lg shadow-md mb-8 overflow-hidden">
          <div className="flex">
            <button
              className={`px-6 py-4 font-medium flex items-center flex-1 justify-center transition-colors ${
                activeTab === 'overview'
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              <FaChartLine className="mr-2" /> Vue d'ensemble
            </button>
            <button
              className={`px-6 py-4 font-medium flex items-center flex-1 justify-center transition-colors ${
                activeTab === 'products'
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('products')}
            >
              <FaTags className="mr-2" /> Produits
            </button>
            <button
              className={`px-6 py-4 font-medium flex items-center flex-1 justify-center transition-colors ${
                activeTab === 'clubs'
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('clubs')}
            >
              <FaHandshake className="mr-2" /> Partenariats
            </button>
          </div>
        </div>

        {/* Contenu */}
        {activeTab === 'overview' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6 transform hover:shadow-lg transition-shadow border-l-4 border-indigo-400">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-indigo-100 rounded-full mr-4">
                    <FaBoxOpen className="text-indigo-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Produits</h3>
                    <p className="text-gray-500">Total des produits</p>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-800">{stats?.totalProduits || 0}</p>
                <div className="flex items-center mt-2 text-gray-600">
                  <p>{stats?.produitsVendus || 0} vendus</p>
                  <div className="h-2 bg-gray-200 rounded-full flex-grow mx-2">
                    <div 
                      className="h-full bg-indigo-400 rounded-full" 
                      style={{ width: `${stats?.totalProduits ? (stats.produitsVendus / stats.totalProduits) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 transform hover:shadow-lg transition-shadow border-l-4 border-teal-400">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-teal-100 rounded-full mr-4">
                    <FaMoneyBillWave className="text-teal-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Chiffre d'affaires</h3>
                    <p className="text-gray-500">Total des ventes</p>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-800">{stats?.chiffreAffaires?.toFixed(2) || 0} €</p>
                <p className="text-teal-600 mt-2 flex items-center">
                  <span className="inline-block w-3 h-3 rounded-full bg-teal-400 mr-2"></span>
                  En croissance
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 transform hover:shadow-lg transition-shadow border-l-4 border-amber-400">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-amber-100 rounded-full mr-4">
                    <FaUsers className="text-amber-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Abonnés</h3>
                    <p className="text-gray-500">Utilisateurs abonnés</p>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-800">{stats?.abonnes || 0}</p>
                <p className="text-amber-600 mt-2 flex items-center">
                  <span className="inline-block w-3 h-3 rounded-full bg-amber-400 mr-2"></span>
                  {stats?.abonnes && stats.abonnes > 10 ? 'Communauté active' : 'En développement'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-gray-700 py-4 px-6">
                  <h2 className="text-xl font-bold text-white">Derniers produits</h2>
                </div>
                {products.length > 0 ? (
                  <div className="overflow-x-auto p-4">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Produit</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Prix</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Stock</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Vendus</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {products.slice(0, 5).map(product => (
                          <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 text-sm font-medium text-gray-800">{product.nom}</td>
                            <td className="px-4 py-3 text-sm text-teal-600 font-medium">{product.prix.toFixed(2)} €</td>
                            <td className="px-4 py-3 text-sm">{product.stock}</td>
                            <td className="px-4 py-3 text-sm text-indigo-600">{product.vendu}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <FaBoxOpen className="text-gray-300 text-5xl mx-auto mb-3" />
                    <p className="text-gray-500">Aucun produit disponible</p>
                  </div>
                )}
                {products.length > 5 && (
                  <div className="bg-gray-50 py-3 px-6 text-right">
                    <button 
                      onClick={() => setActiveTab('products')}
                      className="text-gray-700 hover:text-gray-900 font-medium hover:underline"
                    >
                      Voir tous les produits →
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-gray-700 py-4 px-6">
                  <h2 className="text-xl font-bold text-white">Derniers dons</h2>
                </div>
                {dons.length > 0 ? (
                  <div className="overflow-x-auto p-4">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Club</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Sport</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Montant</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {dons.slice(0, 5).map(don => (
                          <tr key={don._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 text-sm font-medium text-gray-800">{don.club.raisonSociale}</td>
                            <td className="px-4 py-3 text-sm">{don.club.sport}</td>
                            <td className="px-4 py-3 text-sm text-teal-600 font-medium">{don.montant.toFixed(2)} €</td>
                            <td className="px-4 py-3 text-sm">{new Date(don.date).toLocaleDateString('fr-FR')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <FaHandshake className="text-gray-300 text-5xl mx-auto mb-3" />
                    <p className="text-gray-500">Aucun don réalisé</p>
                  </div>
                )}
                {dons.length > 5 && (
                  <div className="bg-gray-50 py-3 px-6 text-right">
                    <button 
                      onClick={() => setActiveTab('clubs')}
                      className="text-gray-700 hover:text-gray-900 font-medium hover:underline"
                    >
                      Voir tous les dons →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gray-700 py-4 px-6 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Mes produits</h2>
              <button
                onClick={() => setShowAddProductModal(true)}
                className="bg-white text-gray-700 hover:bg-gray-100 px-3 py-1 rounded-md text-sm flex items-center font-medium"
              >
                <FaPlus className="mr-1" /> Nouveau produit
              </button>
            </div>

            {products.length > 0 ? (
              <div className="overflow-x-auto p-4">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Produit</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Catégorie</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Prix</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Stock</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Vendus</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {products.map(product => (
                      <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{product.nom}</td>
                        <td className="px-4 py-3 text-sm">{product.categorie}</td>
                        <td className="px-4 py-3 text-sm text-teal-600 font-medium">{product.prix.toFixed(2)} €</td>
                        <td className="px-4 py-3 text-sm">{product.stock}</td>
                        <td className="px-4 py-3 text-sm text-indigo-600">{product.vendu}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => navigate({ to: `/sponsor/product/${product._id}/edit` })}
                              className="text-indigo-600 hover:text-indigo-800"
                              title="Modifier"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product._id)}
                              className="text-red-600 hover:text-red-800"
                              title="Supprimer"
                              disabled={productLoading}
                            >
                              {productLoading ? <FaSpinner className="animate-spin" /> : <FaTrash />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center">
                <FaBoxOpen className="text-gray-300 text-5xl mx-auto mb-3" />
                <p className="text-gray-500">Vous n'avez pas encore de produits</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'clubs' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gray-700 py-4 px-6 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Mes partenariats avec les clubs</h2>
              <button
                onClick={() => navigate({ to: '/clubs' })}
                className="bg-white text-gray-700 hover:bg-gray-100 px-3 py-1 rounded-md text-sm flex items-center font-medium"
              >
                <FaHandshake className="mr-1" /> Explorer les clubs
              </button>
            </div>

            {dons.length > 0 ? (
              <div className="overflow-x-auto p-4">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Club</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Sport</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Montant</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {dons.map(don => (
                      <tr key={don._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{don.club.raisonSociale}</td>
                        <td className="px-4 py-3 text-sm">{don.club.sport}</td>
                        <td className="px-4 py-3 text-sm text-teal-600 font-medium">{don.montant.toFixed(2)} €</td>
                        <td className="px-4 py-3 text-sm">{new Date(don.date).toLocaleDateString('fr-FR')}</td>
                        <td className="px-4 py-3 text-sm">
                          <button
                            onClick={() => navigate({ to: `/clubs/${don.club._id}` })}
                            className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
                          >
                            Voir le club
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center">
                <FaHandshake className="text-gray-300 text-5xl mx-auto mb-3" />
                <p className="text-gray-500">Vous n'avez pas encore de partenariats avec des clubs</p>
              </div>
            )}
          </div>
        )}

        {/* Modal d'ajout de produit */}
        {showAddProductModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Ajouter un nouveau produit
                      </h3>
                      <ProductForm onSuccess={handleAddProductSuccess} />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={() => setShowAddProductModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SponsorDashboard; 