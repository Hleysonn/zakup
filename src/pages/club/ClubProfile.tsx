import { useState, useEffect, ChangeEvent } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { AxiosError } from 'axios';
import axiosInstance from '../../config/axios';
import { 
  FaSpinner, FaUpload, FaEdit, FaSave, FaTimes, FaUser,
  FaCheck, FaPlus, FaTrash, FaTrophy, FaBell, FaMedal, FaCrown 
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

interface ClubProfile {
  _id: string;
  raisonSociale: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  ville?: string;
  codePostal?: string;
  numeroTVA: string;
  compteBancaire?: string;
  logo?: string;
  description?: string;
  sport?: string;
  sponsors?: Array<{
    _id: string;
    raisonSociale: string;
    logo?: string;
  }>;
  donsSponsors?: Array<{
    sponsor: {
      _id: string;
      raisonSociale: string;
    };
    montant: number;
    date: string;
  }>;
  subscribers?: Array<{
    _id: string;
    nom: string;
    prenom: string;
  }>;
  createdAt?: string;
  acceptRGPD: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Composant InputField simplifié
interface InputFieldProps {
  label: string;
  name: string;
  value?: string;
  type?: string;
  disabled?: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

// Définir l'interface pour les formules d'abonnement
interface FormulaAbonnement {
  _id?: string;
  nom: string;
  prix: number;
  niveau: 'basic' | 'premium' | 'vip';
  avantages: string[];
  recommande: boolean;
  iconType: string;
  couleur: string;
}

// État initial pour une nouvelle formule
const initialFormulaState: FormulaAbonnement = {
  nom: '',
  prix: 0,
  niveau: 'basic',
  avantages: [''],
  recommande: false,
  iconType: 'medal',
  couleur: 'blue'
};

const ClubProfile = () => {
  const navigate = useNavigate();
  const { user, userType, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'members' | 'abonnements'>('profile');
  const [clubData, setClubData] = useState<ClubProfile>({
    _id: '',
    raisonSociale: '',
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    ville: '',
    codePostal: '',
    numeroTVA: '',
    compteBancaire: '',
    sport: '',
    description: '',
    logo: '',
    acceptRGPD: false
  });

  // Ajouter les états pour gérer les formules d'abonnement
  const [formules, setFormules] = useState<FormulaAbonnement[]>([]);
  const [showFormulaModal, setShowFormulaModal] = useState(false);
  const [currentFormula, setCurrentFormula] = useState<FormulaAbonnement>(initialFormulaState);
  const [isEditingFormula, setIsEditingFormula] = useState(false);
  const [formulaLoading, setFormulaLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || userType !== 'club')) {
      toast.error('Vous devez être connecté en tant que club pour accéder à cette page');
      navigate({ to: '/login' });
    }
  }, [user, userType, authLoading, navigate]);

  useEffect(() => {
    const fetchClubProfile = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get<ApiResponse<ClubProfile>>('/api/clubs/profile');
        setClubData(response.data.data);
      } catch (err: unknown) {
        const error = err as AxiosError<{ message: string }>;
        setError(error.response?.data?.message || 'Erreur lors du chargement du profil');
        toast.error('Impossible de charger le profil du club');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user && userType === 'club') {
      fetchClubProfile();
    }
  }, [authLoading, user, userType]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setClubData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérification basique
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }

    // Préparation simple du fichier
    const formData = new FormData();
    formData.append('logo', file);

    try {
      const response = await axiosInstance.post('/api/clubs/upload-logo', formData);
      
      if (response.data?.logo) {
        setClubData(prev => ({
          ...prev,
          logo: response.data.logo
        }));
        toast.success('Logo mis à jour avec succès');
      }
    } catch {
      toast.error('Erreur lors de l\'upload du logo');
    }
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      console.log('Données envoyées au serveur:', clubData);
      await axiosInstance.put<ApiResponse<ClubProfile>>('/api/clubs/profile', clubData);
      toast.success('Profil mis à jour avec succès');
      setIsEditing(false);
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      console.error('Erreur lors de la mise à jour:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setSaving(false);
    }
  };

  // Fonction pour récupérer les formules d'abonnement du club
  const fetchFormules = async () => {
    try {
      setFormulaLoading(true);
      const response = await axiosInstance.get('/api/clubs/formules');
      setFormules(response.data.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des formules:', error);
      toast.error('Impossible de charger les formules d\'abonnement');
    } finally {
      setFormulaLoading(false);
    }
  };

  // Charger les formules au chargement initial
  useEffect(() => {
    fetchFormules();
  }, []);

  // Fonction pour ajouter/modifier une formule
  const handleFormulaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setFormulaLoading(true);
      
      // Filtrer les avantages vides
      const formulaToSave = {
        ...currentFormula,
        avantages: currentFormula.avantages.filter(avantage => avantage.trim() !== '')
      };
      
      if (isEditingFormula && currentFormula._id) {
        // Mise à jour d'une formule existante
        await axiosInstance.put(`/api/clubs/formules/${currentFormula._id}`, formulaToSave);
        toast.success('Formule mise à jour avec succès');
      } else {
        // Création d'une nouvelle formule
        await axiosInstance.post('/api/clubs/formules', formulaToSave);
        toast.success('Formule ajoutée avec succès');
      }
      
      // Rafraîchir la liste des formules
      fetchFormules();
      
      // Fermer le modal et réinitialiser le formulaire
      setShowFormulaModal(false);
      setCurrentFormula(initialFormulaState);
      setIsEditingFormula(false);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la formule:', error);
      toast.error('Erreur lors de l\'enregistrement de la formule');
    } finally {
      setFormulaLoading(false);
    }
  };

  // Fonction pour modifier une formule existante
  const handleEditFormula = (formula: FormulaAbonnement) => {
    setCurrentFormula(formula);
    setIsEditingFormula(true);
    setShowFormulaModal(true);
  };

  // Fonction pour supprimer une formule
  const handleDeleteFormula = async (formulaId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette formule ?')) {
      return;
    }
    
    try {
      setFormulaLoading(true);
      await axiosInstance.delete(`/api/clubs/formules/${formulaId}`);
      toast.success('Formule supprimée avec succès');
      
      // Rafraîchir la liste des formules
      fetchFormules();
    } catch (error) {
      console.error('Erreur lors de la suppression de la formule:', error);
      toast.error('Erreur lors de la suppression de la formule');
    } finally {
      setFormulaLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FaSpinner className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="mb-4 text-red-500">{error}</p>
        <button
          onClick={() => navigate({ to: '/' })}
          className="px-4 py-2 text-white transition-colors rounded-lg bg-primary hover:bg-primary-dark"
        >
          Retour à l'accueil
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-10 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-lg shadow-md bg-gradient-to-r from-gray-700 to-gray-8000">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            <button
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'profile' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('profile')}
            >
              Profil du club
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'members' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('members')}
            >
              Membres
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'abonnements' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => {
                setActiveTab('abonnements');
                fetchFormules();
              }}
            >
              Abonnements
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Contenu du profil */}
          {activeTab === 'profile' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {/* En-tête modernisé */}
              <div className="pb-6 mb-8 border-b-2 border-gray-300">
                <div className="flex items-start gap-6">
                  <div className="relative shrink-0">
                    <div className="relative w-24 h-24 overflow-hidden bg-white border-2 border-gray-300 rounded-xl">
                      <img
                        src={clubData.logo || '/placeholder-logo.png'}
                        alt="Logo"
                        className="object-cover w-full h-full"
                      />
                      {isEditing && (
                        <label 
                          htmlFor="logo-upload"
                          className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/60"
                        >
                          <div className="p-2 bg-white rounded-lg">
                            <FaUpload className="text-xl text-primary" />
                          </div>
                        </label>
                      )}
                      <input
                        type="file"
                        id="logo-upload"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <h1 className="text-2xl font-bold text-gray-900">
                          {isEditing ? (
                            <input
                              type="text"
                              name="raisonSociale"
                              value={clubData.raisonSociale}
                              onChange={handleInputChange}
                              className="w-full px-2 py-1 font-bold text-gray-900 bg-white border-2 border-primary focus:border-primary focus:outline-none"
                              placeholder="Nom du club"
                            />
                          ) : (
                            clubData.raisonSociale || "Nom du Club"
                          )}
                        </h1>
                        {(clubData.sport || isEditing) && (
                          <div className="inline-flex items-center px-3 py-1 text-sm font-medium border rounded-full border-primary text-primary bg-primary/10">
                            {isEditing ? (
                              <input
                                type="text"
                                name="sport"
                                value={clubData.sport}
                                onChange={handleInputChange}
                                className="w-full px-2 bg-white border rounded-md border-primary focus:outline-none text-primary"
                                placeholder="Sport pratiqué"
                              />
                            ) : (
                              clubData.sport || "Sport"
                            )}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="p-3 text-gray-700 bg-gray-200 rounded-full hover:bg-primary hover:text-white"
                      >
                        {isEditing ? <FaTimes className="text-xl" /> : <FaEdit className="text-xl" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Formulaire modernisé */}
              <div className="grid grid-cols-1 gap-8">
                <AnimatePresence>
                  {loading ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 1 }}
                      className="flex justify-center py-10"
                    >
                      <FaSpinner className="w-10 h-10 text-primary animate-spin" />
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-8"
                    >
                      {/* Informations personnelles */}
                      <Card title="Informations personnelles">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                          <InputField
                            label="Nom"
                            name="nom"
                            value={clubData.nom}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                          <InputField
                            label="Prénom"
                            name="prenom"
                            value={clubData.prenom}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </div>
                      </Card>

                      {/* Contact */}
                      <Card title="Contact">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                          <InputField
                            label="Email"
                            name="email"
                            type="email"
                            value={clubData.email}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                          <InputField
                            label="Téléphone"
                            name="telephone"
                            type="tel"
                            value={clubData.telephone}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </div>
                      </Card>

                      {/* Adresse */}
                      <Card title="Adresse">
                        <div className="grid grid-cols-1 gap-6">
                          <InputField
                            label="Adresse"
                            name="adresse"
                            value={clubData.adresse}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <InputField
                              label="Ville"
                              name="ville"
                              value={clubData.ville}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                            />
                            <InputField
                              label="Code postal"
                              name="codePostal"
                              value={clubData.codePostal}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                            />
                          </div>
                        </div>
                      </Card>

                      {/* Informations administratives */}
                      <Card title="Informations administratives">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                          <InputField
                            label="Numéro de TVA"
                            name="numeroTVA"
                            value={clubData.numeroTVA}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                          <InputField
                            label="Compte bancaire"
                            name="compteBancaire"
                            value={clubData.compteBancaire}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </div>
                      </Card>

                      {/* RGPD */}
                      <Card title="Règlementation RGPD">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="acceptRGPD"
                            name="acceptRGPD"
                            checked={clubData.acceptRGPD}
                            onChange={(e) => 
                              setClubData({
                                ...clubData,
                                acceptRGPD: e.target.checked
                              })
                            }
                            disabled={!isEditing}
                            className="w-5 h-5 border-2 border-gray-300 rounded text-primary focus:ring-primary"
                          />
                          <label htmlFor="acceptRGPD" className="ml-3 text-sm font-medium text-gray-700">
                            J'accepte les conditions RGPD
                          </label>
                        </div>
                      </Card>

                      {/* Sponsors */}
                      <Card title="Sponsors">
                        <div className="space-y-4">
                          {clubData.sponsors && clubData.sponsors.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                              {clubData.sponsors.map(sponsor => (
                                <div key={sponsor._id} className="p-3 border border-gray-200 rounded-lg">
                                  <div className="flex items-center gap-3">
                                    {sponsor.logo && (
                                      <img 
                                        src={sponsor.logo} 
                                        alt={sponsor.raisonSociale} 
                                        className="object-cover w-10 h-10 rounded-full"
                                      />
                                    )}
                                    <div className="text-sm font-medium">{sponsor.raisonSociale}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">Aucun sponsor associé à ce club.</div>
                          )}
                        </div>
                      </Card>

                      {/* Dons des sponsors */}
                      <Card title="Dons des sponsors">
                        <div className="space-y-4">
                          {clubData.donsSponsors && clubData.donsSponsors.length > 0 ? (
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">Sponsor</th>
                                    <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">Montant</th>
                                    <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">Date</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {clubData.donsSponsors.map((don, index) => (
                                    <tr key={index}>
                                      <td className="px-4 py-3 text-sm text-gray-900">{don.sponsor.raisonSociale}</td>
                                      <td className="px-4 py-3 text-sm text-gray-900">{don.montant} €</td>
                                      <td className="px-4 py-3 text-sm text-gray-500">
                                        {new Date(don.date).toLocaleDateString()}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">Aucun don enregistré.</div>
                          )}
                        </div>
                      </Card>

                      {/* Abonnés */}
                      <Card title="Abonnés">
                        <div className="space-y-4">
                          {clubData.subscribers && clubData.subscribers.length > 0 ? (
                            <div className="grid grid-cols-1 gap-2">
                              {clubData.subscribers.map(subscriber => (
                                <div key={subscriber._id} className="flex items-center p-2 border border-gray-100 rounded-lg">
                                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                                    {subscriber.prenom ? subscriber.prenom.charAt(0) : ''}
                                    {subscriber.nom ? subscriber.nom.charAt(0) : ''}
                                  </div>
                                  <div className="ml-3 text-sm">
                                    {subscriber.prenom || ''} {subscriber.nom || ''}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">Aucun abonné pour ce club.</div>
                          )}
                        </div>
                      </Card>

                      {/* Description */}
                      <Card title="Description">
                        <textarea
                          name="description"
                          value={clubData.description}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          rows={3}
                          className="w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-lg resize-none bg-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none disabled:bg-gray-100 disabled:text-gray-700"
                          placeholder="Description du club..."
                        />
                      </Card>

                      {/* Toujours afficher les boutons, mais masquer Annuler si pas en édition */}
                      <div className="flex justify-end gap-3 pt-4">
                        {isEditing && (
                          <button
                            onClick={() => setIsEditing(false)}
                            className="px-5 py-3 text-lg font-bold text-white uppercase rounded-lg shadow-lg cursor-pointer bg-red-400/80 hover:bg-red-500 hover:scale-105"
                          >
                            Annuler
                          </button>
                        )}
                        
                        {/* En mode édition: bouton Enregistrer, sinon bouton Modifier */}
                        <button
                          onClick={isEditing ? handleSubmit : () => setIsEditing(true)}
                          disabled={saving}
                          className="flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold text-white rounded-lg shadow-lg cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed bg-green-400/80 hover:bg-green-500 hover:scale-105"
                        >
                          {isEditing ? (
                            saving ? (
                              <>
                                <FaSpinner className="w-6 h-6 animate-spin" />
                                <span>ENREGISTREMENT...</span>
                              </>
                            ) : (
                              <>
                                <FaSave className="w-6 h-6" />
                                <span>ENREGISTRER</span>
                              </>
                            )
                          ) : (
                            <>
                              <FaEdit className="w-6 h-6" />
                              <span>MODIFIER</span>
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* Contenu des membres */}
          {activeTab === 'members' && (
            <div>
              <h2 className="mb-6 text-xl font-bold text-white">Membres du club</h2>
              {/* Ici le contenu des membres quand il sera disponible */}
              <div className="p-8 text-center bg-white rounded-lg">
                <FaUser className="mx-auto mb-3 text-5xl text-gray-300" />
                <h3 className="mb-2 text-lg font-medium text-gray-900">Gestion des membres</h3>
                <p className="mb-6 text-gray-500">Cette section vous permettra de gérer les membres de votre club.</p>
              </div>
            </div>
          )}

          {/* Contenu des abonnements */}
          {activeTab === 'abonnements' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Formules d'abonnement</h2>
                <button
                  onClick={() => {
                    setCurrentFormula(initialFormulaState);
                    setIsEditingFormula(false);
                    setShowFormulaModal(true);
                  }}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md"
                >
                  <FaPlus className="mr-2" /> Nouvelle formule
                </button>
              </div>
              
              {formulaLoading ? (
                <div className="flex items-center justify-center py-12">
                  <FaSpinner className="text-3xl text-primary animate-spin" />
                </div>
              ) : formules.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  {formules.map(formula => (
                    <div 
                      key={formula._id}
                      className={`bg-white rounded-xl shadow-md overflow-hidden relative ${
                        formula.recommande ? 'ring-2 ring-purple-500' : ''
                      }`}
                    >
                      {formula.recommande && (
                        <div className="absolute top-0 right-0 px-3 py-1 text-xs font-bold text-white bg-purple-600 rounded-bl-lg">
                          Recommandé
                        </div>
                      )}
                      <div className={`p-6 ${
                        formula.couleur === 'blue' ? 'bg-blue-50' : 
                        formula.couleur === 'purple' ? 'bg-purple-50' : 
                        'bg-amber-50'
                      }`}>
                        <div className="flex justify-center">
                          {formula.iconType === 'medal' ? (
                            <FaMedal className={`text-4xl ${
                              formula.couleur === 'blue' ? 'text-blue-600' : 
                              formula.couleur === 'purple' ? 'text-purple-600' : 
                              'text-amber-600'
                            }`} />
                          ) : formula.iconType === 'crown' ? (
                            <FaCrown className={`text-4xl ${
                              formula.couleur === 'blue' ? 'text-blue-600' : 
                              formula.couleur === 'purple' ? 'text-purple-600' : 
                              'text-amber-600'
                            }`} />
                          ) : (
                            <FaTrophy className={`text-4xl ${
                              formula.couleur === 'blue' ? 'text-blue-600' : 
                              formula.couleur === 'purple' ? 'text-purple-600' : 
                              'text-amber-600'
                            }`} />
                          )}
                        </div>
                        <h3 className="mt-4 text-xl font-bold text-center text-gray-800">{formula.nom}</h3>
                        <div className="mt-2 text-center">
                          <span className="text-3xl font-bold text-gray-900">{formula.prix}€</span>
                          <span className="text-gray-500">/mois</span>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <ul className="space-y-3">
                          {formula.avantages.map((avantage, index) => (
                            <li key={index} className="flex items-start">
                              <FaCheck className="flex-shrink-0 mt-1 mr-2 text-green-500" />
                              <span className="text-gray-700">{avantage}</span>
                            </li>
                          ))}
                        </ul>
                        
                        <div className="flex justify-end mt-4 space-x-2">
                          <button
                            onClick={() => handleEditFormula(formula)}
                            className="p-2 text-blue-600 transition-colors rounded-full hover:bg-blue-50"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => formula._id && handleDeleteFormula(formula._id)}
                            className="p-2 text-red-600 transition-colors rounded-full hover:bg-red-50"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-white rounded-lg">
                  <FaBell className="mx-auto mb-3 text-5xl text-gray-300" />
                  <h3 className="mb-2 text-lg font-medium text-gray-900">Aucune formule d'abonnement</h3>
                  <p className="mb-6 text-gray-500">Vous n'avez pas encore créé de formules d'abonnement pour votre club.</p>
                  <button
                    onClick={() => {
                      setCurrentFormula(initialFormulaState);
                      setIsEditingFormula(false);
                      setShowFormulaModal(true);
                    }}
                    className="inline-flex items-center px-4 py-2 text-white bg-blue-600 rounded-md"
                  >
                    <FaPlus className="mr-2" /> Créer ma première formule
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal pour ajouter/modifier une formule */}
      {showFormulaModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 transition-opacity bg-black/50" aria-hidden="true"></div>
            
            <div className="relative z-10 w-full max-w-md p-6 mx-auto bg-white rounded-lg">
              <h3 className="mb-4 text-lg font-bold text-gray-900">
                {isEditingFormula ? 'Modifier la formule' : 'Nouvelle formule d\'abonnement'}
              </h3>
              
              <form onSubmit={handleFormulaSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Nom de la formule</label>
                    <input
                      type="text"
                      value={currentFormula.nom}
                      onChange={(e) => setCurrentFormula({ ...currentFormula, nom: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Prix mensuel (€)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={currentFormula.prix}
                      onChange={(e) => setCurrentFormula({ ...currentFormula, prix: parseFloat(e.target.value) })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Niveau</label>
                    <select
                      value={currentFormula.niveau}
                      onChange={(e) => setCurrentFormula({ 
                        ...currentFormula, 
                        niveau: e.target.value as 'basic' | 'premium' | 'vip',
                        iconType: e.target.value === 'basic' ? 'medal' : e.target.value === 'premium' ? 'crown' : 'trophy',
                        couleur: e.target.value === 'basic' ? 'blue' : e.target.value === 'premium' ? 'purple' : 'amber'
                      })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary"
                    >
                      <option value="basic">Basic</option>
                      <option value="premium">Premium</option>
                      <option value="vip">VIP</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="recommande"
                      checked={currentFormula.recommande}
                      onChange={(e) => setCurrentFormula({ ...currentFormula, recommande: e.target.checked })}
                      className="w-4 h-4 rounded text-primary focus:ring-primary"
                    />
                    <label htmlFor="recommande" className="ml-2 text-sm text-gray-700">
                      Recommandé
                    </label>
                  </div>
                  
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Avantages</label>
                    {currentFormula.avantages.map((avantage, index) => (
                      <div key={index} className="flex mb-2">
                        <input
                          type="text"
                          value={avantage}
                          onChange={(e) => {
                            const newAvantages = [...currentFormula.avantages];
                            newAvantages[index] = e.target.value;
                            setCurrentFormula({ ...currentFormula, avantages: newAvantages });
                          }}
                          className="flex-1 p-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-primary"
                          placeholder="Ex: Accès aux événements"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newAvantages = currentFormula.avantages.filter((_, i) => i !== index);
                            setCurrentFormula({ ...currentFormula, avantages: newAvantages });
                          }}
                          className="px-3 text-white bg-red-500 rounded-r-md"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentFormula({
                          ...currentFormula,
                          avantages: [...currentFormula.avantages, '']
                        });
                      }}
                      className="w-full p-2 mt-2 text-sm text-gray-700 transition-colors bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      <FaPlus className="inline mr-2" /> Ajouter un avantage
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-end mt-6 space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowFormulaModal(false)}
                    className="px-4 py-2 text-gray-700 transition-colors border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={formulaLoading}
                    className="px-4 py-2 text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    {formulaLoading ? <FaSpinner className="mx-auto animate-spin" /> : isEditingFormula ? 'Mettre à jour' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Composant Card pour unifier l'apparence des sections
const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="p-6 border-2 border-gray-300 bg-slate-700 rounded-xl ">
    <h2 className="pb-2 mb-5 text-lg font-bold text-white border-b-2 border-gray-200">
      {title}
    </h2>
    {children}
  </div>
);

const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  value = '',
  type = "text",
  disabled,
  onChange
}) => (
  <div className="relative">
    <label className="block mb-2 text-sm font-bold text-gray-700">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-lg bg-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none disabled:bg-gray-100 disabled:text-gray-700"
    />
  </div>
);

export default ClubProfile; 