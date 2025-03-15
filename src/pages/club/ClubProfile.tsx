import { useState, useEffect, ChangeEvent } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { FaSpinner, FaUpload, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { AxiosError } from 'axios';
import axiosInstance from '../../config/axios';
import { useAuth } from '../../context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';

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

const ClubProfile = () => {
  const navigate = useNavigate();
  const { user, userType, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
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
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl px-4 py-10 mx-auto">
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
                                    className="w-10 h-10 rounded-full object-cover"
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
                              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                                {subscriber.prenom.charAt(0)}{subscriber.nom.charAt(0)}
                              </div>
                              <div className="ml-3 text-sm">{subscriber.prenom} {subscriber.nom}</div>
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
                      className="w-full px-4 py-3 text-sm bg-white border-2 border-gray-300 rounded-lg resize-none focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none disabled:bg-gray-100 disabled:text-gray-700"
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
      </div>
    </div>
  );
};

// Composant Card pour unifier l'apparence des sections
const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="p-6 bg-white border-2 border-gray-300 rounded-xl">
    <h2 className="pb-2 mb-5 text-lg font-bold text-gray-900 border-b-2 border-gray-200">
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
      className="w-full px-4 py-3 text-sm bg-white border-2 border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none disabled:bg-gray-100 disabled:text-gray-700"
    />
  </div>
);

export default ClubProfile; 