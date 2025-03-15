import { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(item => item !== index) 
        : [...prev, index]
    );
  };

  const faqItems: FAQItem[] = [
    {
      question: "Comment créer un compte sur ZakUp ?",
      answer: "Pour créer un compte sur ZakUp, cliquez sur le bouton 'Inscription' dans le menu principal. Vous devrez fournir votre nom, prénom, adresse e-mail et créer un mot de passe. Une fois le formulaire soumis, vous recevrez un e-mail de confirmation pour activer votre compte. Cliquez sur le lien d'activation et vous pourrez commencer à utiliser ZakUp."
    },
    {
      question: "Comment commander des produits ?",
      answer: "Pour commander des produits, parcourez notre catalogue et ajoutez les articles souhaités à votre panier en cliquant sur le bouton 'Ajouter au panier'. Une fois que vous avez terminé vos achats, cliquez sur l'icône du panier en haut à droite pour accéder à votre panier. Vérifiez votre commande, puis cliquez sur 'Procéder au paiement'. Suivez les instructions pour finaliser votre commande."
    },
    {
      question: "Quels sont les modes de paiement acceptés ?",
      answer: "ZakUp accepte plusieurs modes de paiement pour votre convenance : cartes de crédit et de débit (Visa, Mastercard, American Express), PayPal, et virement bancaire pour certaines commandes. Tous les paiements sont sécurisés et vos informations de paiement sont protégées par un cryptage avancé."
    },
    {
      question: "Comment suivre ma commande ?",
      answer: "Vous pouvez suivre votre commande en vous connectant à votre compte et en accédant à la section 'Mes commandes'. Là, vous verrez le statut de toutes vos commandes. Vous recevrez également des notifications par e-mail concernant l'expédition et la livraison de votre commande. Si vous avez des questions sur le statut de votre commande, n'hésitez pas à contacter notre service client."
    },
    {
      question: "Quelle est la politique de retour ?",
      answer: "Vous pouvez retourner des articles non utilisés dans les 30 jours suivant la réception. Les articles doivent être dans leur état d'origine avec toutes les étiquettes et l'emballage intact. Pour initier un retour, connectez-vous à votre compte, accédez à 'Mes commandes', sélectionnez la commande concernée et suivez les instructions pour le retour. Une fois que nous avons reçu et inspecté l'article retourné, nous procéderons au remboursement sur votre mode de paiement original."
    },
    {
      question: "Comment devenir un sponsor sur la plateforme ?",
      answer: "Pour devenir sponsor sur ZakUp, visitez notre page 'Devenir Sponsor' et remplissez le formulaire de demande. Notre équipe examinera votre demande et vous contactera pour discuter des détails. Les sponsors bénéficient d'une visibilité accrue, peuvent publier des offres spéciales et soutenir les clubs sportifs de leur choix."
    },
    {
      question: "Comment mon club peut-il rejoindre ZakUp ?",
      answer: "Les clubs sportifs peuvent rejoindre ZakUp en remplissant le formulaire sur notre page 'Clubs'. Fournissez des informations sur votre club, votre sport, et vos besoins. Une fois approuvé, votre club sera visible sur la plateforme, pourra recevoir des dons et vendre des produits dérivés. C'est une excellente façon de gagner en visibilité et de recevoir du soutien de sponsors et de supporters."
    },
    {
      question: "Comment contacter le service client ?",
      answer: "Vous pouvez contacter notre service client de plusieurs façons : par e-mail à support@zakup.com, par téléphone au +33 1 23 45 67 89 du lundi au vendredi de 9h à 18h, ou en utilisant le formulaire de contact sur notre page 'Contact'. Nous nous efforçons de répondre à toutes les demandes dans un délai de 24 heures ouvrables."
    },
    {
      question: "ZakUp livre-t-il à l'international ?",
      answer: "Oui, ZakUp propose des livraisons internationales vers de nombreux pays. Les délais et frais de livraison varient selon la destination. Vous pouvez voir les options de livraison disponibles pour votre pays lors du processus de paiement. Notez que des taxes ou droits de douane supplémentaires peuvent s'appliquer selon la réglementation de votre pays."
    },
    {
      question: "Comment puis-je m'abonner à un club ou un sponsor ?",
      answer: "Pour vous abonner à un club ou un sponsor, visitez leur page de profil et cliquez sur le bouton 'S'abonner'. Vous recevrez des notifications concernant leurs nouveaux produits, actualités et offres spéciales. Vous pouvez gérer vos abonnements à tout moment dans votre profil utilisateur sous la section 'Mes abonnements'."
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Foire Aux Questions</h1>
      
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        {faqItems.map((item, index) => (
          <div 
            key={index} 
            className={`border-b border-gray-200 ${index === faqItems.length - 1 ? 'border-b-0' : ''}`}
          >
            <button
              className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 focus:outline-none"
              onClick={() => toggleItem(index)}
            >
              <span className="font-semibold text-gray-800">{item.question}</span>
              {openItems.includes(index) ? (
                <FaChevronUp className="text-gray-500" />
              ) : (
                <FaChevronDown className="text-gray-500" />
              )}
            </button>
            
            <div 
              className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                openItems.includes(index) 
                  ? 'max-h-96 py-4' 
                  : 'max-h-0 py-0'
              }`}
            >
              <p className="text-gray-600">{item.answer}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 max-w-3xl mx-auto bg-primary/10 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-center">Vous n'avez pas trouvé ce que vous cherchiez ?</h2>
        <p className="text-center mb-6">
          N'hésitez pas à nous contacter directement et nous vous répondrons dans les plus brefs délais.
        </p>
        <div className="flex justify-center">
          <a
            href="/contact"
            className="bg-primary text-white py-2 px-6 rounded-md hover:bg-primary/90 transition-colors"
          >
            Contactez-nous
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQ; 