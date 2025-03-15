import { useState } from 'react';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const Contact = () => {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    sujet: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simuler un envoi de formulaire
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Réinitialiser le formulaire
      setFormData({
        nom: '',
        email: '',
        sujet: '',
        message: ''
      });
      
      toast.success('Votre message a été envoyé avec succès!');
    } catch (error) {
      toast.error('Une erreur est survenue lors de l\'envoi du message');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Contactez-nous</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Nos coordonnées</h2>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="text-primary mt-1 mr-3">
                  <FaMapMarkerAlt />
                </div>
                <div>
                  <h3 className="font-medium">Adresse</h3>
                  <p className="text-gray-600">123 Rue du Sport<br />75000 Paris, France</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="text-primary mt-1 mr-3">
                  <FaPhone />
                </div>
                <div>
                  <h3 className="font-medium">Téléphone</h3>
                  <p className="text-gray-600">+33 1 23 45 67 89</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="text-primary mt-1 mr-3">
                  <FaEnvelope />
                </div>
                <div>
                  <h3 className="font-medium">Email</h3>
                  <p className="text-gray-600">
                    <a href="mailto:contact@zakup.com" className="text-primary hover:underline">
                      contact@zakup.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Horaires d'ouverture</h2>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Lundi - Vendredi</span>
                <span>9h00 - 18h00</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Samedi</span>
                <span>10h00 - 16h00</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Dimanche</span>
                <span>Fermé</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">Envoyez-nous un message</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="nom" className="block text-gray-700 mb-2">
                Nom complet
              </label>
              <input
                id="nom"
                name="nom"
                type="text"
                value={formData.nom}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="sujet" className="block text-gray-700 mb-2">
                Sujet
              </label>
              <select
                id="sujet"
                name="sujet"
                value={formData.sujet}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Sélectionnez un sujet</option>
                <option value="question">Question générale</option>
                <option value="assistance">Assistance</option>
                <option value="club">Devenir un club partenaire</option>
                <option value="sponsor">Devenir un sponsor</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            
            <div className="mb-6">
              <label htmlFor="message" className="block text-gray-700 mb-2">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                value={formData.message}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              ></textarea>
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-white py-3 rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Envoi en cours...
                </>
              ) : (
                'Envoyer le message'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact; 