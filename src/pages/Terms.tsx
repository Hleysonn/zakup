import React from 'react';

const Terms = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Conditions Générales d'Utilisation</h1>
      
      <div className="max-w-4xl mx-auto bg-slate-800 rounded-lg shadow-md p-8 text-white">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
          <p className="mb-4">
            Bienvenue sur ZakUp ! Les présentes Conditions Générales d'Utilisation régissent votre utilisation de la plateforme ZakUp, 
            y compris tous les services associés. En accédant à notre plateforme ou en l'utilisant, vous acceptez d'être lié par ces conditions. 
            Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre plateforme.
          </p>
          <p>
            ZakUp est une plateforme qui met en relation des utilisateurs, des clubs sportifs et des sponsors pour faciliter 
            l'achat de produits sportifs et le soutien aux clubs. Ces conditions définissent les droits et obligations de 
            chaque partie impliquée dans cette relation.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">2. Définitions</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>"Plateforme"</strong> désigne le site web ZakUp, ses applications mobiles et tous les services associés.</li>
            <li><strong>"Utilisateur"</strong> désigne toute personne qui accède à la Plateforme ou l'utilise, qu'elle soit inscrite ou non.</li>
            <li><strong>"Membre"</strong> désigne un Utilisateur qui s'est inscrit et a créé un compte sur la Plateforme.</li>
            <li><strong>"Club"</strong> désigne une organisation sportive enregistrée sur la Plateforme.</li>
            <li><strong>"Sponsor"</strong> désigne une entreprise ou organisation qui soutient financièrement des Clubs via la Plateforme.</li>
            <li><strong>"Contenu"</strong> désigne tout texte, graphique, photo, vidéo ou autre matériel téléchargé, publié ou affiché sur la Plateforme.</li>
          </ul>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">3. Inscription et compte</h2>
          <p className="mb-4">
            Pour utiliser certaines fonctionnalités de la Plateforme, vous devez créer un compte. Lors de l'inscription, vous vous engagez à :
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Fournir des informations exactes, complètes et à jour.</li>
            <li>Maintenir la confidentialité de votre mot de passe et de votre compte.</li>
            <li>Notifier immédiatement ZakUp de toute utilisation non autorisée de votre compte.</li>
            <li>Assumer l'entière responsabilité de toutes les activités qui se produisent sous votre compte.</li>
          </ul>
          <p>
            ZakUp se réserve le droit de suspendre ou de résilier un compte si des activités frauduleuses, 
            abusives ou illégales sont suspectées.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">4. Utilisation de la Plateforme</h2>
          <p className="mb-4">En utilisant notre Plateforme, vous acceptez de :</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Respecter toutes les lois et réglementations applicables.</li>
            <li>Ne pas utiliser la Plateforme à des fins illégales ou non autorisées.</li>
            <li>Ne pas perturber ou interférer avec le fonctionnement de la Plateforme.</li>
            <li>Ne pas tenter d'accéder à des zones restreintes de la Plateforme.</li>
            <li>Ne pas collecter ou stocker des données personnelles d'autres utilisateurs.</li>
          </ul>
          <p>
            ZakUp se réserve le droit de refuser l'accès à la Plateforme à tout utilisateur qui ne respecte pas ces conditions.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">5. Contenu de l'utilisateur</h2>
          <p className="mb-4">
            En publiant du Contenu sur la Plateforme, vous garantissez que :
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Vous êtes le propriétaire du Contenu ou avez les droits nécessaires pour le publier.</li>
            <li>Le Contenu n'enfreint pas les droits d'un tiers, y compris les droits de propriété intellectuelle.</li>
            <li>Le Contenu ne contient pas de matériel diffamatoire, obscène, offensant ou illégal.</li>
          </ul>
          <p className="mb-4">
            Vous accordez à ZakUp une licence mondiale, non exclusive, libre de redevance pour utiliser, 
            modifier, reproduire et distribuer votre Contenu sur la Plateforme.
          </p>
          <p>
            ZakUp se réserve le droit de supprimer tout Contenu qui viole ces conditions ou qui est jugé inapproprié.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">6. Achats et paiements</h2>
          <p className="mb-4">
            Lorsque vous effectuez un achat sur ZakUp, vous acceptez de :
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Fournir des informations de paiement exactes et complètes.</li>
            <li>Payer tous les frais encourus à travers votre compte.</li>
            <li>Payer les taxes applicables associées à vos achats.</li>
          </ul>
          <p className="mb-4">
            Les prix des produits sont indiqués en euros et n'incluent pas les frais de livraison, qui sont calculés séparément.
          </p>
          <p>
            ZakUp utilise des prestataires de services de paiement tiers pour traiter les transactions. 
            En utilisant ces services, vous acceptez également leurs conditions d'utilisation.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">7. Politique de retour et de remboursement</h2>
          <p className="mb-4">
            Les demandes de retour doivent être effectuées dans les 30 jours suivant la réception du produit. 
            Les produits doivent être retournés dans leur état d'origine, non utilisés et avec tous les emballages et étiquettes.
          </p>
          <p className="mb-4">
            Les remboursements seront effectués sur le mode de paiement original dans un délai de 14 jours 
            après réception et vérification du produit retourné.
          </p>
          <p>
            Certains produits, comme les articles personnalisés ou les denrées périssables, peuvent ne pas être éligibles au retour.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">8. Propriété intellectuelle</h2>
          <p className="mb-4">
            Tous les droits de propriété intellectuelle relatifs à la Plateforme et à son contenu original 
            (à l'exclusion du Contenu fourni par les utilisateurs) sont la propriété exclusive de ZakUp. 
            L'utilisation de la Plateforme ne vous confère aucun droit de propriété intellectuelle sur la Plateforme ou son contenu.
          </p>
          <p>
            Les marques, logos et noms commerciaux affichés sur la Plateforme appartiennent à leurs propriétaires respectifs 
            et ne peuvent pas être utilisés sans autorisation préalable.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">9. Limitation de responsabilité</h2>
          <p className="mb-4">
            ZakUp fournit la Plateforme "telle quelle" et "selon disponibilité", sans aucune garantie d'aucune sorte, 
            expresse ou implicite. ZakUp ne garantit pas que la Plateforme sera ininterrompue, opportune, sécurisée ou sans erreur.
          </p>
          <p className="mb-4">
            Dans toute la mesure permise par la loi, ZakUp décline toute responsabilité pour les dommages directs, 
            indirects, accessoires, spéciaux, consécutifs ou punitifs résultant de votre utilisation de la Plateforme.
          </p>
          <p>
            La responsabilité totale de ZakUp envers vous pour toute réclamation liée à l'utilisation de la Plateforme 
            ne dépassera pas le montant que vous avez payé à ZakUp au cours des 12 mois précédant la réclamation.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">10. Indemnisation</h2>
          <p>
            Vous acceptez d'indemniser et de dégager ZakUp, ses directeurs, employés et agents de toute responsabilité, 
            réclamation, demande, dommage, ou dépense (y compris les frais juridiques raisonnables) découlant de 
            votre utilisation de la Plateforme, de votre violation des présentes Conditions ou de votre violation 
            des droits d'un tiers.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">11. Modification des conditions</h2>
          <p>
            ZakUp se réserve le droit de modifier ces Conditions à tout moment. Les modifications entrent en vigueur 
            dès leur publication sur la Plateforme. Votre utilisation continue de la Plateforme après la publication 
            des modifications constitue votre acceptation des Conditions modifiées. Nous vous encourageons à consulter 
            régulièrement ces Conditions.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">12. Résiliation</h2>
          <p className="mb-4">
            ZakUp peut, à sa seule discrétion, suspendre ou résilier votre accès à la Plateforme pour toute raison, 
            y compris, sans limitation, une violation des présentes Conditions.
          </p>
          <p>
            Vous pouvez résilier votre compte à tout moment en suivant les instructions sur la Plateforme ou en contactant 
            le service client.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">13. Droit applicable et juridiction</h2>
          <p>
            Les présentes Conditions sont régies par le droit français. Tout litige relatif à l'interprétation ou à l'exécution 
            des présentes Conditions sera soumis à la compétence exclusive des tribunaux français, sauf disposition contraire 
            de la loi applicable.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">14. Contact</h2>
          <p>
            Si vous avez des questions concernant ces Conditions, veuillez nous contacter à l'adresse suivante : 
            legal@zakup.com
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-600">
          <p>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
        </div>
      </div>
    </div>
  );
};

export default Terms; 