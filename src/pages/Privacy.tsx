import React from 'react';

const Privacy = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Politique de Confidentialité</h1>
      
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
          <p className="mb-4">
            Chez ZakUp, nous accordons une grande importance à la protection de vos données personnelles. 
            La présente Politique de Confidentialité explique comment nous collectons, utilisons, partageons 
            et protégeons vos informations lorsque vous utilisez notre plateforme.
          </p>
          <p>
            En utilisant ZakUp, vous consentez à la collecte et à l'utilisation de vos informations conformément 
            à cette politique. Si vous n'acceptez pas les termes de cette politique, veuillez ne pas utiliser notre plateforme.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">2. Informations que nous collectons</h2>
          <p className="mb-4">Nous collectons plusieurs types d'informations, notamment :</p>
          
          <h3 className="text-xl font-semibold mb-2">2.1 Informations que vous nous fournissez</h3>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Informations d'inscription : nom, prénom, adresse e-mail, mot de passe</li>
            <li>Informations de profil : photo, adresse, numéro de téléphone</li>
            <li>Informations de paiement : numéro de carte bancaire, date d'expiration, code de sécurité</li>
            <li>Contenu que vous partagez : avis, commentaires, messages</li>
          </ul>
          
          <h3 className="text-xl font-semibold mb-2">2.2 Informations collectées automatiquement</h3>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Informations d'utilisation : pages visitées, fonctionnalités utilisées, temps passé sur la plateforme</li>
            <li>Informations sur l'appareil : type d'appareil, système d'exploitation, navigateur, adresse IP</li>
            <li>Informations de localisation : localisation géographique approximative</li>
            <li>Cookies et technologies similaires : pour plus d'informations, voir notre section sur les cookies</li>
          </ul>
          
          <h3 className="text-xl font-semibold mb-2">2.3 Informations provenant de tiers</h3>
          <p>
            Nous pouvons recevoir des informations vous concernant de la part de tiers, tels que des partenaires commerciaux, 
            des plateformes de médias sociaux si vous choisissez de vous connecter via ces services, ou des fournisseurs de 
            services de paiement.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">3. Comment nous utilisons vos informations</h2>
          <p className="mb-4">Nous utilisons vos informations pour :</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Fournir, maintenir et améliorer notre plateforme</li>
            <li>Traiter vos transactions et gérer votre compte</li>
            <li>Vous envoyer des communications relatives à votre compte, vos commandes et nos services</li>
            <li>Personnaliser votre expérience et vous proposer des contenus et des offres adaptés</li>
            <li>Analyser l'utilisation de notre plateforme pour améliorer nos services</li>
            <li>Détecter, prévenir et résoudre les activités frauduleuses ou illégales</li>
            <li>Respecter nos obligations légales</li>
          </ul>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">4. Partage de vos informations</h2>
          <p className="mb-4">Nous pouvons partager vos informations avec :</p>
          
          <h3 className="text-xl font-semibold mb-2">4.1 Partenaires commerciaux</h3>
          <p className="mb-4">
            Nous partageons certaines informations avec les clubs sportifs et les sponsors présents sur notre plateforme 
            lorsque vous interagissez avec eux (achat de produits, abonnement, etc.).
          </p>
          
          <h3 className="text-xl font-semibold mb-2">4.2 Prestataires de services</h3>
          <p className="mb-4">
            Nous travaillons avec des prestataires de services tiers qui nous aident à fournir et à améliorer notre plateforme 
            (hébergement, traitement des paiements, analyse de données, service client, etc.).
          </p>
          
          <h3 className="text-xl font-semibold mb-2">4.3 Obligations légales</h3>
          <p className="mb-4">
            Nous pouvons divulguer vos informations si nous estimons de bonne foi que cette divulgation est nécessaire pour :
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Respecter la loi ou une procédure judiciaire</li>
            <li>Protéger les droits, la propriété ou la sécurité de ZakUp, de nos utilisateurs ou du public</li>
            <li>Détecter, prévenir ou traiter les fraudes, les violations de nos conditions d'utilisation ou tout autre activité illégale</li>
          </ul>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">5. Conservation des données</h2>
          <p>
            Nous conservons vos informations aussi longtemps que nécessaire pour fournir nos services, respecter nos obligations légales, 
            résoudre les litiges et faire appliquer nos accords. La durée de conservation spécifique dépend du type d'information et des 
            exigences légales applicables. Lorsque nous n'avons plus besoin de vos informations personnelles, nous les supprimons ou les 
            anonymisons de manière sécurisée.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">6. Sécurité des données</h2>
          <p className="mb-4">
            Nous mettons en œuvre des mesures de sécurité techniques, administratives et physiques appropriées pour protéger 
            vos informations contre la perte, le vol, l'utilisation abusive, l'accès non autorisé, la divulgation, l'altération 
            et la destruction.
          </p>
          <p>
            Cependant, aucune méthode de transmission sur Internet ou de stockage électronique n'est totalement sécurisée. 
            Par conséquent, nous ne pouvons pas garantir la sécurité absolue de vos informations.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">7. Vos droits concernant vos données</h2>
          <p className="mb-4">Selon les lois applicables, vous pouvez avoir le droit de :</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Accéder à vos informations personnelles</li>
            <li>Rectifier ou mettre à jour vos informations inexactes ou incomplètes</li>
            <li>Supprimer vos informations personnelles</li>
            <li>Restreindre ou vous opposer au traitement de vos informations</li>
            <li>Recevoir vos informations dans un format structuré pour les transférer à un autre service</li>
            <li>Retirer votre consentement à tout moment</li>
            <li>Déposer une plainte auprès d'une autorité de protection des données</li>
          </ul>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">8. Cookies et technologies similaires</h2>
          <p className="mb-4">
            Nous utilisons des cookies et des technologies similaires pour collecter des informations sur votre activité, 
            votre navigateur et votre appareil. Ces technologies nous aident à fournir des fonctionnalités essentielles, 
            à mémoriser vos préférences, à analyser l'utilisation de notre plateforme et à personnaliser votre expérience.
          </p>
          <p className="mb-4">Nous utilisons différents types de cookies :</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Cookies essentiels :</strong> nécessaires au fonctionnement de la plateforme</li>
            <li><strong>Cookies de préférences :</strong> permettent de mémoriser vos choix et préférences</li>
            <li><strong>Cookies analytiques :</strong> nous aident à comprendre comment les utilisateurs interagissent avec notre plateforme</li>
            <li><strong>Cookies de marketing :</strong> utilisés pour vous montrer des publicités pertinentes</li>
          </ul>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">9. Transferts internationaux de données</h2>
          <p>
            Vos informations peuvent être transférées et traitées dans des pays autres que celui où vous résidez. 
            Ces pays peuvent avoir des lois de protection des données différentes de celles de votre pays. 
            Lorsque nous transférons vos informations en dehors de l'Espace économique européen, nous mettons en place 
            des garanties appropriées pour assurer la protection de vos informations conformément à cette politique et 
            aux lois applicables.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">10. Protection de la vie privée des enfants</h2>
          <p>
            Notre plateforme n'est pas destinée aux enfants de moins de 16 ans et nous ne collectons pas sciemment 
            des informations personnelles auprès d'enfants de moins de 16 ans. Si nous apprenons que nous avons collecté 
            des informations personnelles d'un enfant de moins de 16 ans sans vérification du consentement parental, 
            nous prendrons des mesures pour supprimer ces informations dès que possible.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">11. Modifications de cette politique</h2>
          <p>
            Nous pouvons modifier cette Politique de Confidentialité de temps à autre. La version la plus récente sera 
            toujours disponible sur notre plateforme avec la date de dernière mise à jour. Nous vous encourageons à 
            consulter régulièrement cette politique. Votre utilisation continue de notre plateforme après la publication 
            des modifications constitue votre acceptation de ces modifications.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">12. Nous contacter</h2>
          <p>
            Si vous avez des questions ou des préoccupations concernant cette Politique de Confidentialité ou le traitement 
            de vos informations personnelles, veuillez nous contacter à l'adresse suivante : privacy@zakup.com
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-600">
          <p>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
        </div>
      </div>
    </div>
  );
};

export default Privacy; 