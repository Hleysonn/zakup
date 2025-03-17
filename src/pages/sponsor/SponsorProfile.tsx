import { useState, useEffect, ChangeEvent } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { FaSpinner, FaUpload, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { AxiosError } from 'axios';
import axiosInstance from '../../config/axios';
import { useAuth } from '../../context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';

interface SponsorProfile {
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
  clubsSponsored?: Array<{
    _id: string;
    raisonSociale: string;
    logo?: string;
    sport?: string;
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

const SponsorProfile = () => {
  const navigate = useNavigate();
  const { user, userType, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [sponsorData, setSponsorData] = useState<SponsorProfile>({
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
    description: '',
    logo: '',
    acceptRGPD: false
  });

  useEffect(() => {
    if (!authLoading && (!user || userType !== 'sponsor')) {
      toast.error('Vous devez être connecté en tant que sponsor pour accéder à cette page');
      navigate({ to: '/login' });
    }
  }, [user, userType, authLoading, navigate]);

  useEffect(() => {
    const fetchSponsorProfile = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get<ApiResponse<SponsorProfile>>('/api/sponsors/me');
        setSponsorData(response.data.data);
      } catch (err: unknown) {
        const error = err as AxiosError<{ message: string }>;
        setError(error.response?.data?.message || 'Erreur lors du chargement du profil');
        toast.error('Impossible de charger le profil du sponsor');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user && userType === 'sponsor') {
      fetchSponsorProfile();
    }
  }, [authLoading, user, userType]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSponsorData(prev => ({
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
      const response = await axiosInstance.post('/api/sponsors/upload-logo', formData);
      
      if (response.data?.logo) {
        setSponsorData(prev => ({
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
      console.log('Données envoyées au serveur:', sponsorData);
      await axiosInstance.put<ApiResponse<SponsorProfile>>('/api/sponsors/me', sponsorData);
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
    <div className="min-h-screen bg-gradient-to-r from-gray-700 to-gray-800">
      <div className="max-w-4xl px-4 py-10 mx-auto">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* En-tête */}
          <div className="pb-6 mb-8 border-b-2 border-gray-300">
            <div className="flex items-start gap-6">
              <div className="relative shrink-0">
                <div className="relative w-24 h-24 overflow-hidden bg-white border-2 border-gray-300 rounded-xl">
                  <img
                    src={sponsorData.logo || '/placeholder-logo.png'}
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
                          value={sponsorData.raisonSociale}
                          onChange={handleInputChange}
                          className="w-full px-2 py-1 font-bold text-gray-900 bg-white border-2 border-primary focus:border-primary focus:outline-none"
                          placeholder="Nom de l'entreprise"
                        />
                      ) : (
                        sponsorData.raisonSociale || "Nom de l'entreprise"
                      )}
                    </h1>
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

          {/* Formulaire */}
          <div className="grid grid-cols-1 gap-8 ">
            <AnimatePresence>
              {loading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
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
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 ">
                      <InputField
                        label="Nom"
                        name="nom"
                        value={sponsorData.nom}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                      <InputField
                        label="Prénom"
                        name="prenom"
                        value={sponsorData.prenom}
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
                        value={sponsorData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                      <InputField
                        label="Téléphone"
                        name="telephone"
                        type="tel"
                        value={sponsorData.telephone}
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
                        value={sponsorData.adresse}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <InputField
                          label="Ville"
                          name="ville"
                          value={sponsorData.ville}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                        <InputField
                          label="Code Postal"
                          name="codePostal"
                          value={sponsorData.codePostal}
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
                        value={sponsorData.numeroTVA}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                      <InputField
                        label="Compte bancaire"
                        name="compteBancaire"
                        value={sponsorData.compteBancaire}
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
                        checked={sponsorData.acceptRGPD}
                        onChange={(e) => 
                          setSponsorData({
                            ...sponsorData,
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

                  {/* Clubs sponsorisés */}
                  <Card title="Clubs sponsorisés">
                    <div className="space-y-4">
                      {sponsorData.clubsSponsored && sponsorData.clubsSponsored.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                          {sponsorData.clubsSponsored.map(club => (
                            <div key={club._id} className="p-3 border border-gray-200 rounded-lg">
                              <div className="flex items-center gap-3">
                                {club.logo && (
                                  <img 
                                    src={club.logo} 
                                    alt={club.raisonSociale} 
                                    className="object-cover w-10 h-10 rounded-full"
                                  />
                                )}
                                <div>
                                  <div className="text-sm font-medium">{club.raisonSociale}</div>
                                  {club.sport && <div className="text-xs text-gray-500">{club.sport}</div>}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">Aucun club sponsorisé.</div>
                      )}
                    </div>
                  </Card>

                  {/* Abonnés */}
                  <Card title="Abonnés">
                    <div className="space-y-4">
                      {sponsorData.subscribers && sponsorData.subscribers.length > 0 ? (
                        <div className="grid grid-cols-1 gap-2">
                          {sponsorData.subscribers.map(subscriber => (
                            <div key={subscriber._id} className="flex items-center p-2 border border-gray-100 rounded-lg">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                                {subscriber.prenom.charAt(0)}{subscriber.nom.charAt(0)}
                              </div>
                              <div className="ml-3 text-sm">{subscriber.prenom} {subscriber.nom}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">Aucun abonné pour ce sponsor.</div>
                      )}
                    </div>
                  </Card>

                  {/* Description */}
                  <Card title="Description">
                    <textarea
                      name="description"
                      value={sponsorData.description}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      rows={3}
                      className="w-full px-4 py-3 text-sm bg-white border-2 border-gray-300 rounded-lg resize-none focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none disabled:bg-gray-100 disabled:text-gray-700"
                      placeholder="Description de l'entreprise..."
                    />
                  </Card>

                  {/* Boutons d'action */}
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
      </div>
    </div>
  );
};

// Composant Card pour unifier l'apparence des sections
const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="p-6 text-white border-2 border-gray-300 rounded-xl bg-gradient-to-r from-gray-700 to-gray-800">
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
    <label className="block mb-2 text-sm font-bold text-white">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-lg bg-slate-500 focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none disabled:bg-gray-100 disabled:text-gray-700"
    />
  </div>
);

export default SponsorProfile; 