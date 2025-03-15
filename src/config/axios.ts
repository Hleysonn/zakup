import axios from 'axios';

// Configuration globale d'Axios
const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000',
  timeout: 15000,
  withCredentials: true
});

// Intercepteur pour les requêtes
axiosInstance.interceptors.request.use((config) => {
  // Si c'est une requête d'upload (contient FormData), augmenter le timeout
  if (config.data instanceof FormData) {
    config.timeout = 30000; // 30 secondes pour les uploads
  }
  return config;
});

export default axiosInstance; 