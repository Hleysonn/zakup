import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import axios from 'axios';
import { FaSpinner, FaExclamationTriangle, FaPlus, FaEdit, FaTrash, FaChartLine, FaUsers, FaBuilding, FaTags, FaHandshake, FaMoneyBillWave, FaBoxOpen, FaBell, FaEnvelope, FaPhone } from 'react-icons/fa';
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

interface Sponsor {
  _id: string;
  raisonSociale: string;
  logo?: string;
}

interface SponsorDon {
  _id: string;
  sponsor: Sponsor;
  montant: number;
  date: string;
}

interface ClubStats {
  totalProduits: number;
  produitsVendus: number;
  chiffreAffaires: number;
  totalSponsors: number;
  totalDonsRecus: number;
  abonnes: number;
}

interface Subscriber {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  avatar?: string;
  dateAbonnement: string;
}

const ClubDashboard = () => {
  const navigate = useNavigate();
  const { user, userType, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [dons, setDons] = useState<SponsorDon[]>([]);
  const [stats, setStats] = useState<ClubStats | null>(null);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribersLoading, setSubscribersLoading] = useState(false);
  const [productLoading, setProductLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddProductModal, setShowAddProductModal] = useState(false);

  // Vérifier que l'utilisateur est un club
  useEffect(() => {
    if (!authLoading) {
      if (!user || userType !== 'club') {
        toast.error('Accès non autorisé. Cette page est réservée aux clubs.');
        navigate({ to: '/login' });
      }
    }
  }, [authLoading, user, userType, navigate]);

  // Charger les données du club
  useEffect(() => {
    if (user && userType === 'club') {
      fetchClubData();
    }
  }, [user, userType]);

  const fetchClubData = async () => {
    try {
      setLoading(true);
      const dashboardRes = await axios.get('/api/clubs/dashboard');
      
      if (dashboardRes.data && dashboardRes.data.success) {
        const dashboardData = dashboardRes.data.data || {};
        
        // Log complet des données pour analyse
        console.log('Données complètes du dashboard:', dashboardData);
        
        if (dashboardRes.data.error) {
          console.warn("Données partielles reçues:", dashboardRes.data.message);
          toast.warning("Certaines données peuvent être incomplètes. L'équipe technique a été informée.");
        }
        
        setStats({
          totalProduits: dashboardData.totalProducts || 0,
          produitsVendus: dashboardData.totalProductsSold || 0,
          chiffreAffaires: dashboardData.totalRevenue || 0,
          totalSponsors: dashboardData.totalSponsors || 0,
          totalDonsRecus: dashboardData.totalDonations || 0,
          abonnes: dashboardData.totalSubscribers || 0
        });
        
        if (dashboardData.products && Array.isArray(dashboardData.products)) {
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
        
        if (dashboardData.donations && Array.isArray(dashboardData.donations)) {
          const realDonations = dashboardData.donations.filter(don => 
            don._id && typeof don._id === 'string' && !don._id.startsWith('temp-') &&
            don.sponsor && don.sponsor._id && typeof don.sponsor._id === 'string'
          );
          
          setDons(realDonations.map(don => ({
            _id: don._id,
            sponsor: {
              _id: don.sponsor._id,
              raisonSociale: don.sponsor.raisonSociale || 'Sponsor sans nom',
              logo: don.sponsor.logo
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

  // Fonction pour charger les abonnés
  const fetchSubscribers = async () => {
    if (activeTab !== 'subscribers') return;
    
    try {
      setSubscribersLoading(true);
      // Utiliser la nouvelle route API dédiée
      const response = await axios.get('/api/clubs/subscribers');
      
      if (response.data && response.data.success) {
        // Utiliser les données réelles d'abonnés
        setSubscribers(response.data.data || []);
      } else {
        console.error('Réponse invalide:', response.data);
        toast.error('Erreur lors du chargement des abonnés');
      }
    } catch (err) {
      console.error('Erreur lors du chargement des abonnés:', err);
      toast.error('Erreur lors du chargement des abonnés');
    } finally {
      setSubscribersLoading(false);
    }
  };

  // Charger les abonnés lorsque l'onglet change
  useEffect(() => {
    if (activeTab === 'subscribers') {
      fetchSubscribers();
    }
  }, [activeTab]);

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      return;
    }

    try {
      setProductLoading(true);
      await axios.delete(`/api/clubs/products/${productId}`);
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
    fetchClubData();
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
            onClick={fetchClubData}
            className="bg-primary text-white px-4 py-2 rounded-md inline-flex items-center justify-center"
          >
            <FaSpinner className={`mr-2 ${loading ? 'animate-spin' : ''}`} /> Réessayer
          </button>
          <a
            href="mailto:support@zakup.fr?subject=Erreur%20Tableau%20de%20bord%20Club"
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
        <h1 className="text-3xl font-bold">Tableau de bord Club</h1>
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
          <div className="flex flex-wrap">
        <button
              className={`px-6 py-4 font-medium flex items-center justify-center transition-colors ${
            activeTab === 'overview'
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
          }`}
          onClick={() => setActiveTab('overview')}
        >
              <FaChartLine className="mr-2" /> Vue d'ensemble
        </button>
        <button
              className={`px-6 py-4 font-medium flex items-center justify-center transition-colors ${
            activeTab === 'products'
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
          }`}
          onClick={() => setActiveTab('products')}
        >
              <FaTags className="mr-2" /> Produits
        </button>
        <button
              className={`px-6 py-4 font-medium flex items-center justify-center transition-colors ${
            activeTab === 'sponsors'
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
          }`}
          onClick={() => setActiveTab('sponsors')}
        >
              <FaHandshake className="mr-2" /> Sponsors
            </button>
            <button
              className={`px-6 py-4 font-medium flex items-center justify-center transition-colors ${
                activeTab === 'subscribers'
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('subscribers')}
            >
              <FaUsers className="mr-2" /> Abonnés
        </button>
          </div>
      </div>

      {/* Contenu */}
      {activeTab === 'overview' && (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                <p className="text-3xl font-bold text-gray-800">{stats?.chiffreAffaires?.toFixed(2) || '0.00'} €</p>
                <p className="text-teal-600 mt-2 flex items-center">
                  <span className="inline-block w-3 h-3 rounded-full bg-teal-400 mr-2"></span>
                  En croissance
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 transform hover:shadow-lg transition-shadow border-l-4 border-amber-400">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-amber-100 rounded-full mr-4">
                    <FaHandshake className="text-amber-600 text-xl" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">Sponsors</h3>
                    <p className="text-gray-500">Sponsors actifs</p>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-800">{stats?.totalSponsors || 0}</p>
                <p className="text-amber-600 mt-2 flex items-center">
                  <span className="inline-block w-3 h-3 rounded-full bg-amber-400 mr-2"></span>
                  {stats?.totalDonsRecus?.toFixed(2) || '0.00'} € reçus
                </p>
            </div>

              <div className="bg-white rounded-lg shadow-md p-6 transform hover:shadow-lg transition-shadow border-l-4 border-blue-400">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-blue-100 rounded-full mr-4">
                  <FaUsers className="text-blue-600 text-xl" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">Abonnés</h3>
                    <p className="text-gray-500">Total des abonnés</p>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-800">{stats?.abonnes || 0}</p>
                <button 
                  onClick={() => setActiveTab('subscribers')}
                  className="text-blue-600 mt-2 flex items-center text-sm font-medium hover:underline"
                >
                  <FaBell className="mr-1" /> Voir les abonnés
                </button>
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
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Catégorie</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Prix</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Stock</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Vendus</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {products.slice(0, 5).map(product => (
                          <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 text-sm font-medium text-gray-800">{product.nom}</td>
                            <td className="px-4 py-3 text-sm">{product.categorie}</td>
                            <td className="px-4 py-3 text-sm text-teal-600 font-medium">{product.prix.toFixed(2)} €</td>
                          <td className="px-4 py-3 text-sm">{product.stock}</td>
                          <td className="px-4 py-3 text-sm">{product.vendu}</td>
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
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Sponsor</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Montant</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {dons.slice(0, 5).map(don => (
                          <tr key={don._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                {don.sponsor.logo && (
                                  <img
                                    src={don.sponsor.logo}
                                    alt={don.sponsor.raisonSociale}
                                    className="h-8 w-8 rounded-full mr-3"
                                  />
                                )}
                                <span className="text-sm font-medium text-gray-800">{don.sponsor.raisonSociale}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-teal-600 font-medium">{don.montant.toFixed(2)} €</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{new Date(don.date).toLocaleDateString('fr-FR')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                  <div className="p-8 text-center">
                    <FaHandshake className="text-gray-300 text-5xl mx-auto mb-3" />
                    <p className="text-gray-500">Aucun don reçu</p>
                  </div>
              )}
              {dons.length > 5 && (
                  <div className="bg-gray-50 py-3 px-6 text-right">
                  <button 
                    onClick={() => setActiveTab('sponsors')}
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
                className="bg-white text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-md flex items-center text-sm font-medium"
            >
                <FaPlus className="mr-2" /> Nouveau produit
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
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map(product => (
                      <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{product.nom}</td>
                      <td className="px-4 py-3 text-sm">{product.categorie}</td>
                        <td className="px-4 py-3 text-sm text-teal-600 font-medium">{product.prix.toFixed(2)} €</td>
                      <td className="px-4 py-3 text-sm">{product.stock}</td>
                      <td className="px-4 py-3 text-sm">{product.vendu}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDeleteProduct(product._id)}
                            className="text-red-600 hover:text-red-900"
                            disabled={productLoading}
                          >
                            <FaTrash />
                          </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
              <div className="p-8 text-center">
                <FaBoxOpen className="text-gray-300 text-5xl mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun produit</h3>
              <p className="text-gray-500 mb-4">Vous n'avez pas encore de produits</p>
              <button
                  onClick={() => setShowAddProductModal(true)}
                className="bg-primary text-white px-4 py-2 rounded-md inline-flex items-center"
              >
                  <FaPlus className="mr-2" /> Ajouter un produit
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'sponsors' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gray-700 py-4 px-6">
              <h2 className="text-xl font-bold text-white">Mes sponsors</h2>
          </div>
          {dons.length > 0 ? (
              <div className="overflow-x-auto p-4">
              <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Sponsor</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Montant</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {dons.map(don => (
                      <tr key={don._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            {don.sponsor.logo && (
                              <img
                                src={don.sponsor.logo}
                                alt={don.sponsor.raisonSociale}
                                className="h-8 w-8 rounded-full mr-3"
                              />
                            )}
                            <span className="text-sm font-medium text-gray-800">{don.sponsor.raisonSociale}</span>
                          </div>
                      </td>
                        <td className="px-4 py-3 text-sm text-teal-600 font-medium">{don.montant.toFixed(2)} €</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{new Date(don.date).toLocaleDateString('fr-FR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
              <div className="p-8 text-center">
                <FaHandshake className="text-gray-300 text-5xl mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun sponsor</h3>
                <p className="text-gray-500">Vous n'avez pas encore reçu de dons</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'subscribers' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gray-700 py-4 px-6">
              <h2 className="text-xl font-bold text-white">Mes abonnés</h2>
            </div>
            
            {subscribersLoading ? (
              <div className="p-8 text-center">
                <FaSpinner className="text-gray-300 text-5xl mx-auto mb-3 animate-spin" />
                <p className="text-gray-500">Chargement des abonnés...</p>
              </div>
            ) : subscribers.length > 0 ? (
              <div className="overflow-x-auto p-4">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Abonné</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Téléphone</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date d'abonnement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {subscribers.map(subscriber => (
                      <tr key={subscriber._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 mr-3">
                              {subscriber.avatar ? (
                                <img 
                                  src={subscriber.avatar} 
                                  alt={`${subscriber.prenom} ${subscriber.nom}`}
                                  className="h-10 w-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <FaUsers className="text-gray-500" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {subscriber.prenom} {subscriber.nom}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <a href={`mailto:${subscriber.email}`} className="text-blue-600 hover:underline flex items-center">
                            <FaEnvelope className="mr-1" /> {subscriber.email}
                          </a>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {subscriber.telephone ? (
                            <a href={`tel:${subscriber.telephone}`} className="text-blue-600 hover:underline flex items-center">
                              <FaPhone className="mr-1" /> {subscriber.telephone}
                            </a>
                          ) : (
                            <span className="text-gray-500">Non renseigné</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(subscriber.dateAbonnement).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center">
                <FaUsers className="text-gray-300 text-5xl mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun abonné</h3>
                <p className="text-gray-500">Votre club n'a pas encore d'abonnés</p>
              </div>
            )}
          </div>
        )}
      </div>

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
  );
};

export default ClubDashboard; 