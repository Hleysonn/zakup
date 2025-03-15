import { useState, useEffect, ChangeEvent } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { FaUser, FaSpinner, FaExclamationTriangle, FaEdit, FaKey, FaSave, FaEye, FaEyeSlash, FaBuilding, FaUsers, FaMapMarkerAlt, FaUpload, FaTimes, FaSignOutAlt } from 'react-icons/fa';
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
}

// Composant réutilisable Card
const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <motion.div
    className="p-6 overflow-hidden bg-white/60 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
    whileHover={{ scale: 1.005 }}
  >
    <h3 className="flex items-center mb-6 text-lg font-bold">
      <span className="inline-block w-2 h-6 mr-3 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-sm"></span>
      {title}
    </h3>
    {children}
  </motion.div>
);

// Composant InputField
const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  value = '',
  type = "text",
  disabled,
  onChange
}) => (
  <div className="relative">
    <label 
      htmlFor={name}
      className="block mb-1 text-sm font-medium text-gray-700"
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
      className={`w-full p-3 bg-transparent border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 ${
        disabled ? 'bg-gray-100 text-gray-500' : 'text-gray-900'
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

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <FaSpinner className="animate-spin text-4xl text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <FaExclamationTriangle className="text-red-500 text-5xl mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Accès non autorisé
        </h1>
        <p className="text-gray-600 mb-6">
          Vous devez être connecté pour accéder à cette page.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl shadow-lg overflow-hidden">
        {/* Header avec bannière stylisée - inspiration du ClubProfile */}
        <div className="h-36 bg-gradient-to-r from-blue-500 to-indigo-600 flex flex-col justify-end relative p-6">
          <div className="absolute top-0 left-0 w-full h-full bg-pattern opacity-10"></div>
          <h1 className="text-3xl font-bold text-white z-10 mb-2">
            {user?.role === 'sponsor' ? 'Profil Sponsor' : 
             user?.role === 'club' ? 'Profil Club' : 
             'Mon Profil'}
          </h1>
        </div>

        <div className="p-6 md:p-8">
          {/* En-tête avec avatar et actions */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="relative shrink-0">
                <div className="relative w-28 h-28 overflow-hidden bg-white border-2 border-gray-300 rounded-xl shadow-md transition-all duration-300">
                  <img
                    src={profileData.avatar || '/placeholder-avatar.png'}
                    alt="Avatar"
                    className="object-cover w-full h-full"
                  />
                  
                  {editMode && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="absolute inset-0 bg-black/40"></div>
                      <label 
                        htmlFor="avatar-upload"
                        className="relative cursor-pointer z-10"
                      >
                        <div className="p-2 bg-white rounded-lg shadow-md transition-transform hover:scale-110">
                          {avatarLoading ? (
                            <FaSpinner className="text-xl text-primary animate-spin" />
                          ) : (
                            <FaUpload className="text-xl text-primary" />
                          )}
                        </div>
                      </label>
                    </div>
                  )}
                  
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    disabled={!editMode || avatarLoading}
                  />
                </div>
              </div>
              
              <div className="flex-1">
                {/* Nom et actions */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="mb-4 md:mb-0">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {profileData.nom} {profileData.prenom}
                    </h1>
                    <p className="text-gray-600">{profileData.email}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
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
                      className="flex items-center justify-center p-3 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                    >
                      <FaSignOutAlt className="text-xl" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="grid grid-cols-1 gap-8">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-center py-10"
                >
                  <FaSpinner className="w-10 h-10 text-primary animate-spin" />
                </motion.div>
              ) : editMode ? (
                <motion.div
                  key="edit-form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <form onSubmit={handleSubmit(onSubmitProfile)}>
                    <div className="space-y-8">
                      <Card title="Informations personnelles">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <InputField
                            label="Nom"
                            name="nom"
                            value={profileData.nom}
                            onChange={handleInputChange}
                          />
                          <InputField
                            label="Prénom"
                            name="prenom"
                            value={profileData.prenom}
                            onChange={handleInputChange}
                          />
                          <InputField
                            label="Email"
                            name="email"
                            type="email"
                            value={profileData.email}
                            disabled={true}
                            onChange={handleInputChange}
                          />
                          <InputField
                            label="Téléphone"
                            name="telephone"
                            type="tel"
                            value={profileData.telephone}
                            onChange={handleInputChange}
                          />
                        </div>
                      </Card>
                      
                      <Card title="Adresse">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="md:col-span-2">
                            <InputField
                              label="Adresse"
                              name="adresse"
                              value={profileData.adresse}
                              onChange={handleInputChange}
                            />
                          </div>
                          <InputField
                            label="Ville"
                            name="ville"
                            value={profileData.ville}
                            onChange={handleInputChange}
                          />
                          <InputField
                            label="Code Postal"
                            name="codePostal"
                            value={profileData.codePostal}
                            onChange={handleInputChange}
                          />
                        </div>
                      </Card>
                      
                      <div className="flex justify-end">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          disabled={loading}
                          className="flex items-center justify-center px-6 py-3 text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                        >
                          {loading ? (
                            <>
                              <FaSpinner className="animate-spin mr-2" />
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
                    </div>
                  </form>
                </motion.div>
              ) : passwordMode ? (
                <motion.div
                  key="password-form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card title="Changer le mot de passe">
                    <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-6">
                      <div>
                        <label htmlFor="currentPassword" className="block text-gray-700 mb-1 text-sm font-medium">
                          Mot de passe actuel
                        </label>
                        <div className="relative">
                          <input
                            id="currentPassword"
                            type={showCurrentPassword ? "text" : "password"}
                            {...registerPassword("currentPassword", { 
                              required: "Le mot de passe actuel est requis" 
                            })}
                            className="w-full p-3 bg-transparent border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-3 text-gray-500"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          >
                            {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                        {passwordErrors.currentPassword && (
                          <p className="text-red-500 text-sm mt-1">{passwordErrors.currentPassword.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="newPassword" className="block text-gray-700 mb-1 text-sm font-medium">
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
                            className="w-full p-3 bg-transparent border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-3 text-gray-500"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                        {passwordErrors.newPassword && (
                          <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="confirmPassword" className="block text-gray-700 mb-1 text-sm font-medium">
                          Confirmer le mot de passe
                        </label>
                        <input
                          id="confirmPassword"
                          type="password"
                          {...registerPassword("confirmPassword", { 
                            required: "Veuillez confirmer votre mot de passe",
                            validate: value => value === newPassword || "Les mots de passe ne correspondent pas"
                          })}
                          className="w-full p-3 bg-transparent border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                        />
                        {passwordErrors.confirmPassword && (
                          <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmPassword.message}</p>
                        )}
                      </div>
                      
                      <div className="flex justify-end">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          disabled={passwordLoading}
                          className="flex items-center justify-center px-6 py-3 text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                        >
                          {passwordLoading ? (
                            <>
                              <FaSpinner className="animate-spin mr-2" />
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
                </motion.div>
              ) : (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                  >
                    <Card title="Informations personnelles">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Nom</h3>
                          <p className="font-medium text-gray-900">{profileData.nom || 'Non renseigné'}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Prénom</h3>
                          <p className="font-medium text-gray-900">{profileData.prenom || 'Non renseigné'}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Email</h3>
                          <p className="font-medium text-gray-900">{profileData.email}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Téléphone</h3>
                          <p className="font-medium text-gray-900">{profileData.telephone || 'Non renseigné'}</p>
                        </div>
                      </div>
                    </Card>
                    
                    <Card title="Adresse">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <h3 className="text-sm font-medium text-gray-500">Adresse</h3>
                          <p className="font-medium text-gray-900">{profileData.adresse || 'Non renseignée'}</p>
                        </div>
                        
                        {profileData.ville && (
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Ville</h3>
                            <p className="font-medium text-gray-900">{profileData.ville}</p>
                          </div>
                        )}
                        
                        {profileData.codePostal && (
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Code Postal</h3>
                            <p className="font-medium text-gray-900">{profileData.codePostal}</p>
                          </div>
                        )}
                      </div>
                    </Card>
                    
                    {/* Afficher la section abonnements uniquement pour les utilisateurs standards */}
                    {(!user?.role || user?.role === 'user') && (
                      <Card title="Mes abonnements">
                        {loadingSubscriptions ? (
                          <div className="flex justify-center items-center py-8">
                            <FaSpinner className="animate-spin text-3xl text-primary" />
                          </div>
                        ) : (
                          <div className="space-y-8">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <FaBuilding className="mr-2 text-blue-500" /> Sponsors
                              </h3>
                              
                              {subscribedSponsors.length === 0 ? (
                                <p className="text-gray-500 italic">Vous n'êtes abonné à aucun sponsor</p>
                              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                  {subscribedSponsors.map(sponsor => (
                                    <motion.div 
                                      key={sponsor._id} 
                                      className="bg-white/60 backdrop-blur-sm rounded-xl p-4 flex flex-col items-center shadow-sm hover:shadow-md transition-all duration-300"
                                      whileHover={{ scale: 1.02 }}
                                    >
                                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3 shadow-sm overflow-hidden">
                                        {sponsor.logo ? (
                                          <img
                                            src={sponsor.logo}
                                            alt={sponsor.raisonSociale}
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <FaBuilding className="text-gray-400" size={28} />
                                        )}
                                      </div>
                                      <h4 className="font-medium text-center mb-2">{sponsor.raisonSociale}</h4>
                                      <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => unsubscribeFromSponsor(sponsor._id)}
                                        className="mt-2 text-sm px-3 py-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-all duration-300"
                                      >
                                        Se désabonner
                                      </motion.button>
                                    </motion.div>
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            <div>
                              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <FaUsers className="mr-2 text-blue-500" /> Clubs
                              </h3>
                              
                              {subscribedClubs.length === 0 ? (
                                <p className="text-gray-500 italic">Vous n'êtes abonné à aucun club</p>
                              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                  {subscribedClubs.map(club => (
                                    <motion.div 
                                      key={club._id} 
                                      className="bg-white/60 backdrop-blur-sm rounded-xl p-4 flex flex-col items-center shadow-sm hover:shadow-md transition-all duration-300"
                                      whileHover={{ scale: 1.02 }}
                                    >
                                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3 shadow-sm overflow-hidden">
                                        {club.logo ? (
                                          <img
                                            src={club.logo}
                                            alt={club.raisonSociale}
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <FaUsers className="text-gray-400" size={28} />
                                        )}
                                      </div>
                                      <h4 className="font-medium text-center">{club.raisonSociale}</h4>
                                      <div className="text-xs text-gray-600 mb-2">{club.sport}</div>
                                      <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => unsubscribeFromClub(club._id)}
                                        className="text-sm px-3 py-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-all duration-300"
                                      >
                                        Se désabonner
                                      </motion.button>
                                    </motion.div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </Card>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 