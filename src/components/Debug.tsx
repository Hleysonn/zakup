import { useAuth } from '../context/AuthContext';

const Debug = () => {
  const { user, userType, loading } = useAuth();

  return (
    <div className="fixed bottom-2 right-2 bg-black bg-opacity-80 text-white p-2 rounded-lg z-50 max-w-md text-xs">
      <div>État connexion: {loading ? 'Chargement...' : user ? 'Connecté' : 'Non connecté'}</div>
      <div>Type: {userType || 'Aucun'}</div>
      <div>User: {user ? JSON.stringify(user) : 'null'}</div>
    </div>
  );
};

export default Debug; 