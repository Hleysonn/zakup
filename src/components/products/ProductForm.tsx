import { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../config/axios';
import { FaPlus, FaSpinner, FaUpload, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

export default function ProductForm({ onSuccess }: { onSuccess?: () => void }) {
  const { userType } = useAuth();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isVisible, setIsVisible] = useState(true);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorDetails(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.append('vendeurModel', userType === 'sponsor' ? 'Sponsor' : 'Club');
    formData.append('estVisible', isVisible.toString());

    try {
      const endpoint = `/api/${userType}s/products`;
      console.log('Type utilisateur:', userType);
      console.log('Endpoint utilisé:', endpoint);
      console.log('Données du formulaire:', Object.fromEntries(formData));
      
      const response = await axiosInstance.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });
      
      console.log('Réponse du serveur:', response.data);
      
      toast.success('Produit ajouté avec succès!', {
        style: {
          background: '#10B981',
          color: '#FFF'
        },
        iconTheme: {
          primary: '#FFF',
          secondary: '#10B981'
        }
      });
      
      form.reset();
      setImagePreview(null);
      setFileName('');
      onSuccess?.();
    } catch (error: any) {
      console.error('Erreur détaillée:', error);
      
      const errorMessage = error.response?.data?.message || 
                           error.message || 
                           'Erreur inconnue lors de l\'ajout du produit';
      
      setErrorDetails(errorMessage);
      
      toast.error('Erreur lors de l\'ajout du produit', {
        style: {
          background: '#EF4444',
          color: '#FFF'
        },
        iconTheme: {
          primary: '#FFF',
          secondary: '#EF4444'
        }
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      {errorDetails && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Détails de l'erreur: {errorDetails}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-5">
        {/* Nom du produit */}
        <div>
          <label 
            htmlFor="nom" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Nom du produit
          </label>
          <input 
            type="text" 
            id="nom" 
            name="nom" 
            required 
            className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-white/80 backdrop-blur-sm text-gray-800 focus:border-blue-500 focus:outline-none shadow-md transition-colors"
          />
        </div>

        {/* Description */}
        <div>
          <label 
            htmlFor="description" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description
          </label>
          <textarea 
            id="description" 
            name="description" 
            required 
            rows={4} 
            className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-white/80 backdrop-blur-sm text-gray-800 focus:border-purple-500 focus:outline-none shadow-md transition-colors resize-none"
          ></textarea>
        </div>

        {/* Prix et Stock */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Prix */}
          <div>
            <label 
              htmlFor="prix" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Prix
            </label>
            <div className="relative">
              <input 
                type="number" 
                id="prix" 
                name="prix" 
                min="0" 
                step="0.01" 
                required 
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-white/80 backdrop-blur-sm text-gray-800 focus:border-blue-500 focus:outline-none shadow-md transition-colors pl-4 pr-8"
              />
              <span className="absolute right-4 top-3 text-gray-700 font-medium">€</span>
            </div>
          </div>

          {/* Stock */}
          <div>
            <label 
              htmlFor="stock" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Stock
            </label>
            <input 
              type="number" 
              id="stock" 
              name="stock" 
              min="0" 
              required 
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-white/80 backdrop-blur-sm text-gray-800 focus:border-purple-500 focus:outline-none shadow-md transition-colors"
            />
          </div>
        </div>

        {/* Catégorie */}
        <div>
          <label 
            htmlFor="categorie" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Catégorie
          </label>
          <div className="relative">
            <select 
              id="categorie" 
              name="categorie" 
              required 
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-white/80 backdrop-blur-sm text-gray-800 focus:border-pink-500 focus:outline-none shadow-md transition-colors appearance-none"
            >
              <option value="" className="text-gray-400">Sélectionner une catégorie...</option>
              <option>Vêtements</option>
              <option>Équipements</option>
              <option>Accessoires</option>
              <option>Nutrition</option>
              <option>Autres</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        {/* Image du produit */}
        <div>
          <p className="block text-sm font-medium text-gray-700 mb-1">
            Image du produit
          </p>
          <div 
            onClick={triggerFileInput}
            className={`w-full h-40 flex flex-col items-center justify-center rounded-lg border-2 border-dashed ${imagePreview ? 'border-purple-300 bg-white/20' : 'border-gray-300 bg-white/10'} backdrop-blur-sm transition-all duration-300 overflow-hidden cursor-pointer shadow-md hover:shadow-lg hover:border-purple-500`}
          >
            {imagePreview ? (
              <div className="relative w-full h-full">
                <img 
                  src={imagePreview} 
                  alt="Aperçu" 
                  className="w-full h-full object-contain p-2" 
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <p className="text-white font-medium flex items-center">
                    <FaUpload className="mr-2" /> Changer l'image
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center p-4 space-y-2">
                <FaUpload className="w-10 h-10 mx-auto text-gray-400" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-700">Importer une image</p>
                  <p className="text-xs text-gray-500">ou glisser-déposer</p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF jusqu'à 10MB</p>
                </div>
              </div>
            )}
          </div>
          <input 
            ref={fileInputRef}
            type="file" 
            id="image" 
            name="image" 
            accept="image/*" 
            required 
            className="hidden" 
            onChange={handleFileChange}
          />
          {fileName && (
            <p className="mt-2 text-xs text-gray-500 truncate">
              {fileName}
            </p>
          )}
        </div>

        {/* Visibilité */}
        <div 
          className="flex items-center space-x-3 bg-white/50 p-3 rounded-lg shadow-md cursor-pointer hover:bg-white/60 transition-all duration-300"
          onClick={() => setIsVisible(!isVisible)}
        >
          <div className={`w-12 h-6 flex items-center rounded-full p-1 duration-300 ease-in-out ${isVisible ? 'bg-blue-600' : 'bg-gray-400'}`}>
            <div className={`bg-white w-5 h-5 rounded-full shadow-md transform duration-300 ease-in-out ${isVisible ? 'translate-x-6' : ''}`}></div>
          </div>
          <label className="text-sm text-gray-700 cursor-pointer select-none">
            {isVisible ? (
              <span className="flex items-center">
                <FaEye className="mr-2 text-blue-600" /> Produit visible dans la boutique
              </span>
            ) : (
              <span className="flex items-center">
                <FaEyeSlash className="mr-2 text-gray-500" /> Produit masqué
              </span>
            )}
          </label>
        </div>
      </div>

      {/* Bouton d'ajout */}
      <div className="pt-4">
        <button 
          type="submit" 
          disabled={loading} 
          className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-medium shadow-lg transform hover:scale-[1.02] focus:scale-[1.02] active:scale-100 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              Ajout en cours...
            </>
          ) : (
            <>
              <FaPlus className="mr-2" />
              Ajouter le produit
            </>
          )}
        </button>
      </div>
    </form>
  );
} 