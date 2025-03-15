import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { FaUser, FaSpinner, FaExclamationTriangle, FaEdit, FaKey, FaSave, FaEye, FaEyeSlash, FaBuilding, FaUsers } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

// Types pour les formulaires
interface ProfileData {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
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

const Profile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [subscribedSponsors, setSubscribedSponsors] = useState<Sponsor[]>([]);
  const [subscribedClubs, setSubscribedClubs] = useState<Club[]>([]);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProfileData>();
  const { 
    register: registerPassword, 
    handleSubmit: handleSubmitPassword, 
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch
  } = useForm<PasswordData>();

  const newPassword = watch('newPassword');

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      navigate({ to: '/login' });
    }

    if (user) {
      reset({
        nom: user.nom || '',
        prenom: user.prenom || '',
        email: user.email || '',
        telephone: user.telephone || '',
        adresse: user.adresse || '',
      });
    }
  }, [user, isAuthenticated, authLoading, navigate, reset]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchSubscriptions();
    }
  }, [isAuthenticated, user]);

  const fetchSubscriptions = async () => {
    try {
      setLoadingSubscriptions(true);
      const response = await axios.get('/api/users/subscriptions');
      setSubscribedSponsors(response.data.sponsors || []);
      setSubscribedClubs(response.data.clubs || []);
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
      await axios.put('/api/users/profile', data);
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
      await axios.put('/api/users/password', {
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
      await axios.put(`/api/users/unsubscribe-sponsor/${sponsorId}`);
      toast.success('Désabonnement réussi');
      // Mettre à jour l'état local
      setSubscribedSponsors(prev => prev.filter(s => s._id !== sponsorId));
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors du désabonnement');
    }
  };

  const unsubscribeFromClub = async (clubId: string) => {
    try {
      await axios.put(`/api/users/unsubscribe-club/${clubId}`);
      toast.success('Désabonnement réussi');
      // Mettre à jour l'état local
      setSubscribedClubs(prev => prev.filter(c => c._id !== clubId));
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

  if (!isAuthenticated) {
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                <FaUser className="text-gray-500" size={48} />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-center mb-2">
              {user?.nom} {user?.prenom}
            </h1>
            <p className="text-gray-600 text-center mb-6">{user?.email}</p>
            
            <div className="space-y-3">
              <button
                onClick={() => {
                  setEditMode(!editMode);
                  setPasswordMode(false);
                }}
                className="w-full py-2 px-4 rounded-md bg-primary text-white hover:bg-primary/90 flex items-center justify-center"
              >
                <FaEdit className="mr-2" /> 
                {editMode ? 'Annuler' : 'Modifier le profil'}
              </button>
              
              <button
                onClick={() => {
                  setPasswordMode(!passwordMode);
                  setEditMode(false);
                }}
                className="w-full py-2 px-4 rounded-md bg-gray-700 text-white hover:bg-gray-800 flex items-center justify-center"
              >
                <FaKey className="mr-2" /> 
                {passwordMode ? 'Annuler' : 'Changer le mot de passe'}
              </button>
              
              <button
                onClick={() => logout()}
                className="w-full py-2 px-4 rounded-md bg-red-600 text-white hover:bg-red-700 flex items-center justify-center"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-2">
          {editMode ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-6">Modifier le profil</h2>
              
              <form onSubmit={handleSubmit(onSubmitProfile)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="nom" className="block text-gray-700 mb-1">Nom</label>
                    <input
                      id="nom"
                      type="text"
                      {...register("nom", { required: "Le nom est requis" })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {errors.nom && (
                      <p className="text-red-500 text-sm mt-1">{errors.nom.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="prenom" className="block text-gray-700 mb-1">Prénom</label>
                    <input
                      id="prenom"
                      type="text"
                      {...register("prenom", { required: "Le prénom est requis" })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {errors.prenom && (
                      <p className="text-red-500 text-sm mt-1">{errors.prenom.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="email" className="block text-gray-700 mb-1">Email</label>
                  <input
                    id="email"
                    type="email"
                    {...register("email", { 
                      required: "L'email est requis",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Format d'email invalide"
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>
                
                <div className="mb-4">
                  <label htmlFor="telephone" className="block text-gray-700 mb-1">Téléphone</label>
                  <input
                    id="telephone"
                    type="tel"
                    {...register("telephone")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="adresse" className="block text-gray-700 mb-1">Adresse</label>
                  <input
                    id="adresse"
                    type="text"
                    {...register("adresse")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 px-4 rounded-md bg-primary text-white hover:bg-primary/90 flex items-center justify-center"
                >
                  {loading ? (
                    <FaSpinner className="animate-spin mr-2" />
                  ) : (
                    <FaSave className="mr-2" />
                  )}
                  Enregistrer les modifications
                </button>
              </form>
            </div>
          ) : passwordMode ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-6">Changer le mot de passe</h2>
              
              <form onSubmit={handleSubmitPassword(onSubmitPassword)}>
                <div className="mb-4">
                  <label htmlFor="currentPassword" className="block text-gray-700 mb-1">Mot de passe actuel</label>
                  <div className="relative">
                    <input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      {...registerPassword("currentPassword", { 
                        required: "Le mot de passe actuel est requis" 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-2 text-gray-500"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className="text-red-500 text-sm mt-1">{passwordErrors.currentPassword.message}</p>
                  )}
                </div>
                
                <div className="mb-4">
                  <label htmlFor="newPassword" className="block text-gray-700 mb-1">Nouveau mot de passe</label>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-2 text-gray-500"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword.message}</p>
                  )}
                </div>
                
                <div className="mb-6">
                  <label htmlFor="confirmPassword" className="block text-gray-700 mb-1">Confirmer le mot de passe</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    {...registerPassword("confirmPassword", { 
                      required: "Veuillez confirmer votre mot de passe",
                      validate: value => value === newPassword || "Les mots de passe ne correspondent pas"
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmPassword.message}</p>
                  )}
                </div>
                
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="w-full py-2 px-4 rounded-md bg-primary text-white hover:bg-primary/90 flex items-center justify-center"
                >
                  {passwordLoading ? (
                    <FaSpinner className="animate-spin mr-2" />
                  ) : (
                    <FaKey className="mr-2" />
                  )}
                  Mettre à jour le mot de passe
                </button>
              </form>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-bold mb-6">Informations personnelles</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-gray-500 text-sm">Nom</h3>
                    <p className="font-medium">{user?.nom || 'Non renseigné'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-gray-500 text-sm">Prénom</h3>
                    <p className="font-medium">{user?.prenom || 'Non renseigné'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-gray-500 text-sm">Email</h3>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-gray-500 text-sm">Téléphone</h3>
                    <p className="font-medium">{user?.telephone || 'Non renseigné'}</p>
                  </div>
                  
                  <div className="md:col-span-2">
                    <h3 className="text-gray-500 text-sm">Adresse</h3>
                    <p className="font-medium">{user?.adresse || 'Non renseignée'}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-6">Mes abonnements</h2>
                
                {loadingSubscriptions ? (
                  <div className="flex justify-center items-center py-12">
                    <FaSpinner className="animate-spin text-2xl text-primary" />
                  </div>
                ) : (
                  <>
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <FaBuilding className="mr-2 text-primary" /> Sponsors
                      </h3>
                      
                      {subscribedSponsors.length === 0 ? (
                        <p className="text-gray-500 italic">Vous n'êtes abonné à aucun sponsor</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {subscribedSponsors.map(sponsor => (
                            <div 
                              key={sponsor._id} 
                              className="bg-gray-50 rounded-lg p-4 flex flex-col items-center"
                            >
                              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                                {sponsor.logo ? (
                                  <img
                                    src={sponsor.logo}
                                    alt={sponsor.raisonSociale}
                                    className="w-full h-full object-cover rounded-full"
                                  />
                                ) : (
                                  <FaBuilding className="text-gray-400" size={24} />
                                )}
                              </div>
                              <h4 className="font-medium text-center">{sponsor.raisonSociale}</h4>
                              <button
                                onClick={() => unsubscribeFromSponsor(sponsor._id)}
                                className="mt-2 text-sm text-red-600 hover:text-red-700"
                              >
                                Se désabonner
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <FaUsers className="mr-2 text-primary" /> Clubs
                      </h3>
                      
                      {subscribedClubs.length === 0 ? (
                        <p className="text-gray-500 italic">Vous n'êtes abonné à aucun club</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {subscribedClubs.map(club => (
                            <div 
                              key={club._id} 
                              className="bg-gray-50 rounded-lg p-4 flex flex-col items-center"
                            >
                              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                                {club.logo ? (
                                  <img
                                    src={club.logo}
                                    alt={club.raisonSociale}
                                    className="w-full h-full object-cover rounded-full"
                                  />
                                ) : (
                                  <FaUsers className="text-gray-400" size={24} />
                                )}
                              </div>
                              <h4 className="font-medium text-center">{club.raisonSociale}</h4>
                              <div className="text-xs text-gray-600 mb-1">{club.sport}</div>
                              <button
                                onClick={() => unsubscribeFromClub(club._id)}
                                className="text-sm text-red-600 hover:text-red-700"
                              >
                                Se désabonner
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 