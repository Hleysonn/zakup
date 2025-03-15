import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaSpinner, FaEye, FaEyeSlash, FaUser, FaEnvelope, FaLock, FaPhone, FaBuilding } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { useNavigate } from '@tanstack/react-router';

interface RegisterFormData {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  confirmPassword: string;
  telephone: string;
  adresse: string;
  userType: 'user' | 'sponsor' | 'club';
  nomEntreprise?: string;
  nomClub?: string;
  acceptRGPD: boolean;
}

const RegisterForm = () => {
  const navigate = useNavigate();
  const { register: authRegister, registerSponsor, registerClub } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userType, setUserType] = useState<'user' | 'sponsor' | 'club'>('user');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<RegisterFormData>();

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setLoading(true);
      
      // Utiliser la fonction appropriée selon le type d'utilisateur
      if (data.userType === 'sponsor') {
        // Transformer les données pour le format attendu par le serveur
        const sponsorData = {
          raisonSociale: data.nomEntreprise || '',
          nom: data.nom,
          prenom: data.prenom,
          email: data.email,
          telephone: data.telephone,
          adresse: data.adresse,
          numeroTVA: data.nomEntreprise || 'FR0000000000', // Par défaut
          password: data.password,
          acceptRGPD: data.acceptRGPD
        };
        await registerSponsor(sponsorData);
      } else if (data.userType === 'club') {
        // Transformer les données pour le format attendu par le serveur
        const clubData = {
          raisonSociale: data.nomClub || '',
          nom: data.nom,
          prenom: data.prenom,
          email: data.email,
          telephone: data.telephone,
          adresse: data.adresse,
          numeroTVA: data.nomClub || 'FR0000000000', // Par défaut
          password: data.password,
          acceptRGPD: data.acceptRGPD,
          sport: ''
        };
        await registerClub(clubData);
      } else {
        // Utilisateur standard
        await authRegister(data);
      }
      
      toast.success('Inscription réussie !');
      navigate({ to: '/login' });
    } catch (err) {
      console.error('Erreur lors de l\'inscription:', err);
      toast.error('Une erreur est survenue lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl p-8 bg-white rounded-lg shadow-md">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Créer un compte</h2>
          <p className="mt-2 text-sm text-gray-600">
            Rejoignez notre communauté et profitez de tous nos services
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {['user', 'sponsor', 'club'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                setUserType(type as 'user' | 'sponsor' | 'club');
                setValue('userType', type as 'user' | 'sponsor' | 'club');
              }}
              className={`p-4 rounded-lg flex flex-col items-center justify-center gap-2 transition-all duration-200 ${
                userType === type
                  ? 'bg-blue-50 border-2 border-blue-500 text-blue-700'
                  : 'bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700'
              }`}
            >
              <FaUser className={`text-xl ${userType === type ? 'text-blue-500' : 'text-gray-400'}`} />
              <span className="text-sm font-medium capitalize">
                {type === 'user' ? 'Particulier' : type}
              </span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <input type="hidden" {...register('userType')} value={userType} />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Nom
              </label>
              <div className="relative">
                <FaUser className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="text"
                  {...register('nom', { required: 'Le nom est requis' })}
                  className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Votre nom"
                />
              </div>
              {errors.nom && (
                <p className="mt-1 text-sm text-red-600">{errors.nom.message}</p>
              )}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Prénom
              </label>
              <div className="relative">
                <FaUser className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="text"
                  {...register('prenom', { required: 'Le prénom est requis' })}
                  className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Votre prénom"
                />
              </div>
              {errors.prenom && (
                <p className="mt-1 text-sm text-red-600">{errors.prenom.message}</p>
              )}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="relative">
                <FaEnvelope className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="email"
                  {...register('email', {
                    required: 'L\'email est requis',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Adresse email invalide',
                    },
                  })}
                  className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="votre@email.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Adresse
              </label>
              <div className="relative">
                <FaBuilding className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="text"
                  {...register('adresse', { required: 'L\'adresse est requise' })}
                  className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Votre adresse complète"
                />
              </div>
              {errors.adresse && (
                <p className="mt-1 text-sm text-red-600">{errors.adresse.message}</p>
              )}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <div className="relative">
                <FaLock className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', {
                    required: 'Le mot de passe est requis',
                    minLength: {
                      value: 6,
                      message: 'Le mot de passe doit contenir au moins 6 caractères',
                    },
                  })}
                  className="w-full py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <FaLock className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirmPassword', {
                    required: 'Veuillez confirmer votre mot de passe',
                    validate: value =>
                      value === password || 'Les mots de passe ne correspondent pas',
                  })}
                  className="w-full py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Téléphone
              </label>
              <div className="relative">
                <FaPhone className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="tel"
                  {...register('telephone', {
                    required: 'Le numéro de téléphone est requis',
                    pattern: {
                      value: /^[0-9+\s-]{10,}$/,
                      message: 'Numéro de téléphone invalide',
                    },
                  })}
                  className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Votre numéro"
                />
              </div>
              {errors.telephone && (
                <p className="mt-1 text-sm text-red-600">{errors.telephone.message}</p>
              )}
            </div>

            {userType === 'sponsor' && (
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Nom de l'entreprise
                </label>
                <div className="relative">
                  <FaBuilding className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                  <input
                    type="text"
                    {...register('nomEntreprise', {
                      required: userType === 'sponsor' ? 'Le nom de l\'entreprise est requis' : false,
                    })}
                    className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nom de l'entreprise"
                  />
                </div>
                {errors.nomEntreprise && (
                  <p className="mt-1 text-sm text-red-600">{errors.nomEntreprise.message}</p>
                )}
              </div>
            )}

            {userType === 'club' && (
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Nom du club
                </label>
                <div className="relative">
                  <FaBuilding className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                  <input
                    type="text"
                    {...register('nomClub', {
                      required: userType === 'club' ? 'Le nom du club est requis' : false,
                    })}
                    className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nom du club"
                  />
                </div>
                {errors.nomClub && (
                  <p className="mt-1 text-sm text-red-600">{errors.nomClub.message}</p>
                )}
              </div>
            )}
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="acceptRGPD"
                  type="checkbox"
                  {...register('acceptRGPD', {
                    required: 'Vous devez accepter les conditions générales'
                  })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
              <div className="ml-3">
                <label htmlFor="acceptRGPD" className="text-sm text-gray-700">
                  J'accepte les conditions générales
                </label>
                <p className="text-xs text-gray-500">
                  En cochant cette case, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
                </p>
              </div>
            </div>
            {errors.acceptRGPD && (
              <p className="text-sm text-red-600">{errors.acceptRGPD.message}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white transition-colors duration-200 bg-blue-600 border border-transparent rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {loading ? (
                <>
                  <FaSpinner className="mr-2 animate-spin" />
                  Inscription en cours...
                </>
              ) : (
                'S\'inscrire'
              )}
            </button>
          </div>
        </form>

        <p className="mt-8 text-sm text-center text-gray-600">
          Déjà inscrit ?{' '}
          <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Se connecter
          </a>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm; 