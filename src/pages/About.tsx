const About = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">À propos de ZakUp</h1>
      
      <div className="bg-slate-800 rounded-lg shadow-md p-6 mb-8 text-white">
        <h2 className="text-xl font-semibold mb-4">Notre mission</h2>
        <p className="mb-4">
          ZakUp est né d'une passion pour le sport et d'une volonté de créer des liens plus forts entre les clubs sportifs, leurs sponsors et leurs supporters. Notre plateforme offre un espace où tous les acteurs du monde sportif peuvent se rencontrer, échanger et prospérer ensemble.
        </p>
        <p>
          Notre mission est de faciliter le soutien aux clubs sportifs en permettant aux supporters d'acheter directement leurs produits, tout en offrant aux sponsors un canal direct pour présenter leurs marques et produits à une communauté passionnée.
        </p>
      </div>
      
      <div className="bg-slate-800 rounded-lg shadow-md p-6 mb-8 text-white">
        <h2 className="text-xl font-semibold mb-4">Nos valeurs</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Passion :</strong> Le sport est au cœur de tout ce que nous faisons.</li>
          <li><strong>Communauté :</strong> Nous croyons en la force des liens qui unissent supporters, clubs et sponsors.</li>
          <li><strong>Transparence :</strong> Nous fonctionnons avec intégrité et honnêteté dans toutes nos actions.</li>
          <li><strong>Innovation :</strong> Nous recherchons constamment de nouvelles façons d'améliorer l'expérience sportive.</li>
          <li><strong>Durabilité :</strong> Nous nous engageons à promouvoir des pratiques responsables dans le sport.</li>
        </ul>
      </div>
      
      <div className="bg-slate-800 rounded-lg shadow-md p-6 mb-8 text-white">
        <h2 className="text-xl font-semibold mb-4">Notre équipe</h2>
        <p className="mb-4">
          Nous sommes une équipe de passionnés de sport et de technologie, déterminés à transformer la façon dont les clubs sportifs interagissent avec leurs supporters et sponsors.
        </p>
        <p>
          Notre équipe diversifiée combine des compétences en développement web, en marketing sportif, en gestion d'événements et en relations publiques pour offrir une plateforme complète qui répond aux besoins de tous nos utilisateurs.
        </p>
      </div>
      
      <div className="bg-slate-800 rounded-lg shadow-md p-6 text-white">
        <h2 className="text-xl font-semibold mb-4">Nous contacter</h2>
        <p className="mb-4">
          Nous sommes toujours ravis d'entendre vos commentaires, questions ou suggestions. N'hésitez pas à nous contacter via notre page de contact ou directement par email à <a href="mailto:contact@zakup.com" className="text-primary hover:underline">contact@zakup.com</a>.
        </p>
        <p>
          Suivez-nous également sur les réseaux sociaux pour rester informé des dernières nouvelles, événements et offres spéciales.
        </p>
      </div>
    </div>
  );
};

export default About; 