import { useAuth } from '../context/AuthContext';

const Debug = () => {
  const { user, userType, loading } = useAuth();

  return (
    <div className="fixed z-50 max-w-md p-2 text-xs text-white bg-black rounded-lg bottom-2 right-2 bg-opacity-80">
      <div>État connexion: {loading ? 'Chargement...' : user ? 'Connecté' : 'Non connecté'}</div>
      <div>Type: {userType || 'Aucun'}</div>
      <div>User: {user ? JSON.stringify(user) : 'null'}</div>
    </div>
  );
};

export default Debug; 