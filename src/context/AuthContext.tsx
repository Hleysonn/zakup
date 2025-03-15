import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  role?: string;
  raisonSociale?: string;
}

interface AuthContextType {
  user: User | null;
  userType: 'user' | 'sponsor' | 'club' | null;
  loading: boolean;
  error: string | null;
  login: (data: LoginData) => Promise<void>;
  register: (userData: any) => Promise<void>;
  registerSponsor: (sponsorData: any) => Promise<void>;
  registerClub: (clubData: any) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface LoginData {
  email: string;
  password: string;
  userType: 'user' | 'sponsor' | 'club';
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<'user' | 'sponsor' | 'club' | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Configurer axios
  axios.defaults.baseURL = 'http://localhost:5000';
  axios.defaults.withCredentials = true;

  // Vérifier si l'utilisateur est connecté
  useEffect(() => {
    const loadUser = async () => {
      try {
        console.log('Tentative de récupération de l\'utilisateur connecté...');
        const res = await axios.get('/api/auth/me');
        console.log('Réponse de /api/auth/me:', res.data);
        console.log('Type d\'utilisateur reçu:', res.data.userType);
        
        setUser({ ...res.data.data });
        setUserType(res.data.userType);
        
        console.log('État après mise à jour:', {
          user: res.data.data,
          userType: res.data.userType
        });
      } catch (err: any) {
        console.log('Aucun utilisateur connecté ou erreur:', err.response?.status);
        setUser(null);
        setUserType(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Connexion
  const login = async (data: LoginData) => {
    setLoading(true);
    try {
      console.log('Tentative de connexion avec:', { email: data.email, userType: data.userType });
      
      const res = await axios.post('/api/auth/login', { 
        email: data.email, 
        password: data.password, 
        userType: data.userType 
      });
      
      console.log('Réponse de connexion:', res.data);
      
      if (res.data.success) {
        // Définir directement l'utilisateur et le type d'utilisateur à partir de la réponse
        setUser({ ...res.data.data });
        setUserType(res.data.userType);
        setError(null);
      } else {
        throw new Error('Échec de la connexion');
      }
    } catch (err: any) {
      console.error('Erreur de connexion:', err.message);
      if (err.response) {
        console.error('Status:', err.response.status);
        console.error('Données:', err.response.data);
      } else if (err.request) {
        console.error('Pas de réponse reçue:', err.request);
      }
      setError(err.response?.data?.error || 'Une erreur est survenue lors de la connexion');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Inscription utilisateur
  const register = async (userData: any) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/register', userData);
      setUser(res.data.data);
      setUserType('user');
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Une erreur est survenue lors de l\'inscription');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Inscription sponsor
  const registerSponsor = async (sponsorData: any) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/register-sponsor', sponsorData);
      setUser(res.data.data);
      setUserType('sponsor');
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Une erreur est survenue lors de l\'inscription');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Inscription club
  const registerClub = async (clubData: any) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/register-club', clubData);
      setUser(res.data.data);
      setUserType('club');
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Une erreur est survenue lors de l\'inscription');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Déconnexion
  const logout = async () => {
    setLoading(true);
    try {
      await axios.get('/api/auth/logout');
      setUser(null);
      setUserType(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Une erreur est survenue lors de la déconnexion');
    } finally {
      setLoading(false);
    }
  };

  // Effacer les erreurs
  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        userType,
        loading,
        error,
        login,
        register,
        registerSponsor,
        registerClub,
        logout,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
}; 