import { useState, useEffect, ChangeEvent } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { FaUser, FaSpinner, FaExclamationTriangle, FaEdit, FaKey, FaSave, FaEye, FaEyeSlash, FaBuilding, FaUsers, FaMapMarkerAlt, FaUpload, FaTimes, FaSignOutAlt, FaHistory, FaBell, FaCog } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import axiosInstance from '../config/axios';
import { AnimatePresence, motion } from 'framer-motion';

// Types pour les formulaires
interface ProfileData {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  ville?: string;
  codePostal?: string;
  acceptNewsletter?: boolean;
  acceptSMS?: boolean;
  avatar?: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Types pour les abonnements
interface Sponsor {
  _id: string;
  raisonSociale: string;
  logo?: string;
}

interface Club {
  _id: string;
  raisonSociale: string;
  logo?: string;
  sport: string;
}

// Interface pour InputField
interface InputFieldProps {
  label: string;
  name: string;
  value?: string;
  type?: string;
  disabled?: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  theme?: string;
}

// Composant réutilisable Card
const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <motion.div
    className="p-6 overflow-hidden text-white transition-all duration-300 shadow-sm rounded-xl hover:shadow-md bg-gradient-to-r from-gray-700 to-gray-800"
    whileHover={{ scale: 1.005 }}
  >
    <h3 className="flex items-center mb-6 text-lg font-bold">
      <span className="inline-block w-2 h-6 mr-3 rounded-sm bg-gradient-to-b from-blue-500 to-indigo-600"></span>
      {title}
    </h3>
    {children}
  </motion.div>
);

// Composant InputField
const InputField = ({
  label,
  name,
  value = '',
  type = "text",
  disabled,
  onChange,
  theme = "dark"
}: InputFieldProps) => (
  <div className="relative">
    <label 
      htmlFor={name}
      className={`block mb-1 text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
    >
      {label}
    </label>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`w-full p-3 ${theme === "dark" ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-gray-300 text-gray-900"} border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 ${
        disabled ? 'opacity-60 cursor-not-allowed' : ''
      }`}
    />
  </div>
);

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [subscribedSponsors, setSubscribedSponsors] = useState<Sponsor[]>([]);
  const [subscribedClubs, setSubscribedClubs] = useState<Club[]>([]);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState<ProfileData>({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    ville: '',
    codePostal: '',
    acceptNewsletter: false,
    acceptSMS: false,
    avatar: ''
  });

  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm<ProfileData>({
    defaultValues: {
      nom: user?.nom || '',
      prenom: user?.prenom || '',
      email: user?.email || '',
      telephone: user?.telephone || '',
      adresse: user?.adresse || '',
      ville: user?.ville || '',
      codePostal: user?.codePostal || '',
      acceptNewsletter: user?.acceptNewsletter || false,
      acceptSMS: user?.acceptSMS || false
    }
  });

  const { 
    register: registerPassword, 
    handleSubmit: handleSubmitPassword, 
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch
  } = useForm<PasswordData>();

  const newPassword = watch('newPassword');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: '/login' });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      const fetchUserProfile = async () => {
        try {
          setLoading(true);
          console.log("Tentative de récupération du profil utilisateur de type:", user.role || "user");
          let userData;
          
          // Utiliser les bonnes routes API selon le type d'utilisateur
          if (user.role === 'sponsor') {
            const response = await axiosInstance.get('/api/sponsors/me');
            console.log("Réponse de l'API pour le sponsor:", response.data);
            userData = response.data.data;
          } else if (user.role === 'club') {
            const response = await axiosInstance.get('/api/clubs/me');
            console.log("Réponse de l'API pour le club:", response.data);
            userData = response.data.data;
          } else {
            // Utilisateur standard
            const response = await axiosInstance.get('/api/users/me');
            console.log("Réponse de l'API pour l'utilisateur:", response.data);
            userData = response.data.data;
          }
          
          if (!userData) {
            console.error("Données utilisateur vides");
            return;
          }
          
          // Mise à jour de l'état du profil
          setProfileData({
            nom: userData.nom || '',
            prenom: userData.prenom || '',
            email: userData.email || '',
            telephone: userData.telephone || '',
            adresse: userData.adresse || '',
            ville: userData.ville || '',
            codePostal: userData.codePostal || '',
            acceptNewsletter: userData.acceptNewsletter || false,
            acceptSMS: userData.acceptSMS || false,
            avatar: userData.avatar || ''
          });
          
          // Mise à jour des champs du formulaire avec les données du profil
          setValue('nom', userData.nom || '');
          setValue('prenom', userData.prenom || '');
          setValue('email', userData.email || '');
          setValue('telephone', userData.telephone || '');
          setValue('adresse', userData.adresse || '');
          setValue('ville', userData.ville || '');
          setValue('codePostal', userData.codePostal || '');
          setValue('acceptNewsletter', userData.acceptNewsletter || false);
          setValue('acceptSMS', userData.acceptSMS || false);
          
          // Charger les abonnements si c'est un utilisateur standard
          if (!user.role || user.role === 'user') {
            fetchSubscriptions();
          }
        } catch (error) {
          console.error('Erreur lors du chargement du profil:', error);
          toast.error('Impossible de charger votre profil');
        } finally {
          setLoading(false);
        }
      };
      
      fetchUserProfile();
    }
  }, [user, setValue]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setProfileData(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérification basique
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }

    setAvatarLoading(true);

    // Préparation du fichier
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await axiosInstance.post('/api/users/upload-avatar', formData);
      
      if (response.data?.avatar) {
        setProfileData(prev => ({
          ...prev,
          avatar: response.data.avatar
        }));
        toast.success('Avatar mis à jour avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload de l\'avatar:', error);
      toast.error('Erreur lors de l\'upload de l\'avatar');
    } finally {
      setAvatarLoading(false);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      setLoadingSubscriptions(true);
      const [sponsorsRes, clubsRes] = await Promise.all([
        axiosInstance.get('/api/users/sponsors'),
        axiosInstance.get('/api/users/clubs')
      ]);
      setSubscribedSponsors(sponsorsRes.data.data || []);
      setSubscribedClubs(clubsRes.data.data || []);
    } catch (err) {
      console.error('Erreur lors du chargement des abonnements:', err);
      toast.error('Impossible de charger vos abonnements');
    } finally {
      setLoadingSubscriptions(false);
    }
  };

  const onSubmitProfile = async (data: ProfileData) => {
    try {
      setLoading(true);
      let response;
      
      if (user?.role === 'sponsor') {
        response = await axiosInstance.put('/api/sponsors/me', data);
      } else if (user?.role === 'club') {
        response = await axiosInstance.put('/api/clubs/me', data);
      } else {
        // Utilisateur standard
        response = await axiosInstance.put('/api/users/profile', data);
      }
      
      console.log("Réponse de mise à jour du profil:", response.data);
      toast.success('Profil mis à jour avec succès');
      setEditMode(false);
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitPassword = async (data: PasswordData) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      setPasswordLoading(true);
      await axiosInstance.put('/api/auth/updatepassword', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      toast.success('Mot de passe mis à jour avec succès');
      setPasswordMode(false);
      resetPassword();
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la mise à jour du mot de passe');
    } finally {
      setPasswordLoading(false);
    }
  };

  const unsubscribeFromSponsor = async (sponsorId: string) => {
    try {
      await axiosInstance.put(`/api/users/unsubscribe-sponsor/${sponsorId}`);
      toast.success('Désabonnement réussi');
      // Mettre à jour la liste des abonnements
      setSubscribedSponsors(prev => prev.filter(sponsor => sponsor._id !== sponsorId));
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors du désabonnement');
    }
  };

  const unsubscribeFromClub = async (clubId: string) => {
    try {
      await axiosInstance.put(`/api/users/unsubscribe-club/${clubId}`);
      toast.success('Désabonnement réussi');
      // Mettre à jour la liste des abonnements
      setSubscribedClubs(prev => prev.filter(club => club._id !== clubId));
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors du désabonnement');
    }
  };

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const tabs = [
    { id: 'profile', label: 'Profil', icon: <FaUser /> },
    { id: 'security', label: 'Sécurité', icon: <FaKey /> },
    { id: 'notifications', label: 'Notifications', icon: <FaBell /> },
    { id: 'history', label: 'Historique', icon: <FaHistory /> },
    { id: 'settings', label: 'Paramètres', icon: <FaCog /> }
  ];

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <FaSpinner className="text-4xl animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container px-4 py-8 mx-auto text-center">
        <FaExclamationTriangle className="mx-auto mb-4 text-5xl text-red-500" />
        <h1 className="mb-4 text-2xl font-bold text-red-600">
          Accès non autorisé
        </h1>
        <p className="mb-6 text-gray-600">
          Vous devez être connecté pour accéder à cette page.
        </p>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="max-w-6xl mx-auto">
        {/* En-tête du profil */}
        <div className="mb-8 overflow-hidden shadow-xl bg-slate-800 rounded-xl">
          <div className="relative h-48 text-white bg-gradient-to-r from-gray-700 to-gray-800">
            <div className="absolute inset-0 bg-pattern opacity-20"></div>
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-end gap-6">
                <div className="relative">
                  <div className="w-32 h-32 overflow-hidden bg-white border-4 border-white rounded-full">
                    {profileData.avatar ? (
                      <img
                        src={profileData.avatar}
                        alt="Avatar"
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full bg-gray-100">
                        <FaUser className="text-4xl text-gray-400" />
                      </div>
                    )}
                    {editMode && (
                      <label
                        htmlFor="avatar-upload"
                        className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/60"
                      >
                        <div className="p-2 bg-white rounded-lg">
                          <FaUpload className="text-xl text-primary" />
                        </div>
                      </label>
                    )}
                    <input
                      type="file"
                      id="avatar-upload"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                      disabled={!editMode}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <h1 className="mb-2 text-3xl font-bold text-white">
                    {profileData.prenom} {profileData.nom}
                  </h1>
                  <p className="text-gray-200">{profileData.email}</p>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setEditMode(!editMode);
                      setPasswordMode(false);
                    }}
                    className={`flex items-center justify-center p-3 rounded-xl transition-colors ${
                      editMode 
                        ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                        : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                    }`}
                  >
                    {editMode ? <FaTimes className="text-xl" /> : <FaEdit className="text-xl" />}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setPasswordMode(!passwordMode);
                      setEditMode(false);
                    }}
                    className={`flex items-center justify-center p-3 rounded-xl transition-colors ${
                      passwordMode 
                        ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                        : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                    }`}
                  >
                    <FaKey className="text-xl" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => logout()}
                    className="flex items-center justify-center p-3 text-red-600 transition-colors bg-red-100 rounded-xl hover:bg-red-200"
                  >
                    <FaSignOutAlt className="text-xl" />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="mb-8 overflow-hidden shadow-xl bg-slate-800 rounded-xl">
          <div className="flex overflow-x-auto border-b border-slate-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contenu des onglets */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center py-10 "
            >
              <FaSpinner className="w-10 h-10 text-primary animate-spin" />
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'profile' && (
                <div className="space-y-8">
                  <Card title="Informations personnelles">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <InputField
                        label="Prénom"
                        name="prenom"
                        value={profileData.prenom}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        theme="dark"
                      />
                      <InputField
                        label="Nom"
                        name="nom"
                        value={profileData.nom}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        theme="dark"
                      />
                    </div>
                  </Card>

                  <Card title="Coordonnées">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <InputField
                        label="Email"
                        name="email"
                        value={profileData.email}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        theme="dark"
                      />
                      <InputField
                        label="Téléphone"
                        name="telephone"
                        value={profileData.telephone}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        theme="dark"
                      />
                    </div>
                  </Card>

                  <Card title="Adresse">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="md:col-span-2">
                        <InputField
                          label="Adresse"
                          name="adresse"
                          value={profileData.adresse}
                          onChange={handleInputChange}
                          disabled={!editMode}
                          theme="dark"
                        />
                      </div>
                      <InputField
                        label="Ville"
                        name="ville"
                        value={profileData.ville}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        theme="dark"
                      />
                      <InputField
                        label="Code Postal"
                        name="codePostal"
                        value={profileData.codePostal}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        theme="dark"
                      />
                    </div>
                  </Card>

                  {editMode && (
                    <div className="flex justify-end">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        onClick={handleSubmit(onSubmitProfile)}
                        disabled={loading}
                        className="flex items-center justify-center px-6 py-3 text-white transition-all duration-300 shadow-md bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl hover:shadow-lg"
                      >
                        {loading ? (
                          <>
                            <FaSpinner className="mr-2 animate-spin" />
                            Enregistrement...
                          </>
                        ) : (
                          <>
                            <FaSave className="mr-2" />
                            Enregistrer les modifications
                          </>
                        )}
                      </motion.button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'security' && (
                <Card title="Changer le mot de passe">
                  <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-6">
                    <div>
                      <label htmlFor="currentPassword" className="block mb-1 text-sm font-medium text-gray-300">
                        Mot de passe actuel
                      </label>
                      <div className="relative">
                        <input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          {...registerPassword("currentPassword", { 
                            required: "Le mot de passe actuel est requis" 
                          })}
                          className="w-full p-3 text-white transition-all duration-300 border rounded-lg bg-slate-700 border-slate-600 focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        <button
                          type="button"
                          className="absolute text-gray-400 right-3 top-3"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      {passwordErrors.currentPassword && (
                        <p className="mt-1 text-sm text-red-500">{passwordErrors.currentPassword.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="newPassword" className="block mb-1 text-sm font-medium text-gray-300">
                        Nouveau mot de passe
                      </label>
                      <div className="relative">
                        <input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          {...registerPassword("newPassword", { 
                            required: "Le nouveau mot de passe est requis",
                            minLength: {
                              value: 6,
                              message: "Le mot de passe doit contenir au moins 6 caractères"
                            }
                          })}
                          className="w-full p-3 text-white transition-all duration-300 border rounded-lg bg-slate-700 border-slate-600 focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        <button
                          type="button"
                          className="absolute text-gray-400 right-3 top-3"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      {passwordErrors.newPassword && (
                        <p className="mt-1 text-sm text-red-500">{passwordErrors.newPassword.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block mb-1 text-sm font-medium text-gray-300">
                        Confirmer le nouveau mot de passe
                      </label>
                      <div className="relative">
                        <input
                          id="confirmPassword"
                          type={showNewPassword ? "text" : "password"}
                          {...registerPassword("confirmPassword", { 
                            required: "La confirmation du mot de passe est requise",
                            validate: value => value === newPassword || "Les mots de passe ne correspondent pas"
                          })}
                          className="w-full p-3 text-white transition-all duration-300 border rounded-lg bg-slate-700 border-slate-600 focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      {passwordErrors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-500">{passwordErrors.confirmPassword.message}</p>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={passwordLoading}
                        className="flex items-center justify-center px-6 py-3 text-white transition-all duration-300 shadow-md bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl hover:shadow-lg"
                      >
                        {passwordLoading ? (
                          <>
                            <FaSpinner className="mr-2 animate-spin" />
                            Mise à jour...
                          </>
                        ) : (
                          <>
                            <FaKey className="mr-2" />
                            Mettre à jour le mot de passe
                          </>
                        )}
                      </motion.button>
                    </div>
                  </form>
                </Card>
              )}

              {activeTab === 'notifications' && (
                <Card title="Préférences de notifications">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-slate-700">
                      <div>
                        <h3 className="text-lg font-medium text-white">Newsletter</h3>
                        <p className="text-gray-400">Recevoir des actualités et des offres</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="acceptNewsletter"
                          checked={profileData.acceptNewsletter}
                          onChange={handleInputChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-slate-700">
                      <div>
                        <h3 className="text-lg font-medium text-white">Notifications SMS</h3>
                        <p className="text-gray-400">Recevoir des notifications par SMS</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="acceptSMS"
                          checked={profileData.acceptSMS}
                          onChange={handleInputChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </div>
                </Card>
              )}

              {activeTab === 'history' && (
                <Card title="Historique des commandes">
                  <div className="py-8 text-center text-gray-400">
                    <FaHistory className="mx-auto mb-4 text-4xl" />
                    <p>Cette fonctionnalité sera bientôt disponible</p>
                  </div>
                </Card>
              )}

              {activeTab === 'settings' && (
                <Card title="Paramètres du compte">
                  <div className="py-8 text-center text-gray-400">
                    <FaCog className="mx-auto mb-4 text-4xl" />
                    <p>Cette fonctionnalité sera bientôt disponible</p>
                  </div>
                </Card>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Profile; 