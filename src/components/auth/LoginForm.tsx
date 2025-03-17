import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaSpinner, FaEye, FaEyeSlash, FaUser, FaEnvelope, FaLock } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { useNavigate } from '@tanstack/react-router';

interface LoginFormData {
  email: string;
  password: string;
  userType: 'user' | 'sponsor' | 'club';
}

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<'user' | 'sponsor' | 'club'>('user');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);
      // S'assurer que le userType est défini
      const loginData = {
        ...data,
        userType: userType
      };
      await login(loginData);
      toast.success('Connexion réussie !');

      // Rediriger vers la page appropriée selon le type d'utilisateur
      switch (userType) {
        case 'sponsor':
          navigate({ to: '/sponsor/dashboard' });
          break;
        case 'club':
          navigate({ to: '/club/dashboard' });
          break;
        default:
          navigate({ to: '/' });
      }
    } catch (err: any) {
      console.error('Erreur lors de la connexion:', err);
      
      // Afficher un message d'erreur plus précis
      if (err.response) {
        const { status, data } = err.response;
        if (status === 401) {
          toast.error('Email ou mot de passe incorrect');
        } else if (status === 400) {
          toast.error(data.error || 'Données de connexion invalides');
        } else {
          toast.error(`Erreur serveur: ${data.error || 'Problème de connexion'}`);
        }
      } else if (err.request) {
        toast.error('Impossible de joindre le serveur. Vérifiez votre connexion Internet.');
      } else {
        toast.error('Une erreur est survenue lors de la connexion');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md p-8 rounded-lg shadow-md bg-gradient-to-r from-gray-700 to-gray-800">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-white">Connexion</h2>
          <p className="mt-2 text-sm text-gray-600">
            Connectez-vous pour accéder à votre compte
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

          <div className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="relative group">
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
                Mot de passe
              </label>
              <div className="relative group">
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
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="remember-me" className="block ml-2 text-sm text-gray-700">
                Se souvenir de moi
              </label>
            </div>

            <a href="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-500">
              Mot de passe oublié ?
            </a>
          </div>

          <div className="flex items-center justify-between mt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white transition-colors duration-200 bg-blue-600 border border-transparent rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {loading ? (
                <>
                  <FaSpinner className="mr-2 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </div>
        </form>

        <p className="mt-8 text-sm text-center text-gray-600">
          Pas encore de compte ?{' '}
          <a href="/register" className="font-medium text-blue-600 hover:text-blue-500">
            S'inscrire
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginForm; 