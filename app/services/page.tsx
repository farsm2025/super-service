import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageShell } from "../ui/page-shell";

const services = [
  { title: "Déménagement", description: "Déménagement de particuliers et d’entreprises, emballage, protection et transport soigné de vos biens.", href: "/services/demenagement", image: "/images/demenagement/equipe-demenagement-lausanne.webp", alt: "Déménageur Super-Service transportant un carton à Lausanne" },
  { title: "Nettoyage", description: "Nettoyage de fin de bail, de bureaux, de vitres et remise en état après des travaux.", href: "/services/nettoyage", image: "/images/nettoyage/nettoyage-vitres-lausanne.webp", alt: "Équipe de nettoyage de vitres intervenant à Lausanne" },
  { title: "Location de camions", description: "Iveco Daily 17 m³ ou Citroën Jumper 20 m³ avec hayon, disponibles avec ou sans chauffeur.", href: "/services/location-camion", image: "/images/location-camion/citroen-jumper-exterieur.webp", alt: "Citroën Jumper de 20 mètres cubes proposé à la location à Lausanne" },
  { title: "Transport et livraison", description: "Transport de meubles, livraison à domicile, achats volumineux, manutention et camion avec chauffeur.", href: "/services/transport-et-livraison", image: "/images/transport-debarras/transport-livraison-lausanne.webp", alt: "Service de transport et de livraison Super-Service à Lausanne" },
  { title: "Montage de meubles", description: "Montage et démontage de lits, armoires, tables, étagères et autres meubles, seul ou avec un déménagement.", href: "/services/montage-de-meubles", image: "/images/montage-meubles/montage-meuble-lausanne.webp", alt: "Montage professionnel d’un meuble à Lausanne" },
  { title: "Débarras", description: "Tri, chargement et évacuation des encombrants dans les appartements, maisons, caves et locaux.", href: "/services/debarras", image: "/images/debarras/debarras-cave-lausanne.webp", alt: "Cave à débarrasser à Lausanne dans le canton de Vaud" },
  { title: "Petits travaux et jardinage", description: "Bricolage, fixations, petites interventions électriques, entretien de jardin et taille de haies.", href: "/services/petits-travaux-jardinage", image: "/images/petits-travaux-jardinage/entretien-jardin-lausanne.webp", alt: "Jardin entretenu par un service de jardinage à Lausanne" },
  { title: "Cartons de déménagement", description: "Deux formats de cartons pour préparer votre déménagement. Vente prochainement disponible.", href: "/services/cartons-demenagement", image: "/images/demenagement/equipe-demenagement-lausanne.webp", alt: "Cartons et préparation d'un déménagement à Lausanne" },
];

export const metadata: Metadata = {
  title: "Tous nos services à Lausanne et dans le canton de Vaud",
  description: "Découvrez les services Super-Service à Lausanne : déménagement, nettoyage, location de camion, transport, livraison, montage de meubles, débarras et petits travaux.",
  alternates: { canonical: "/services" },
  openGraph: {
    title: "Tous les services Super-Service à Lausanne",
    description: "Une équipe polyvalente pour votre déménagement, nettoyage, transport, débarras, montage de meubles et vos petits travaux dans le canton de Vaud.",
    url: "/services",
    images: [{ url: "/images/demenagement/equipe-demenagement-lausanne.webp", width: 1600, height: 1200, alt: "Les services Super-Service à Lausanne" }],
  },
};

export default function ServicesPage() {
  return (
    <PageShell
      eyebrow="Nos prestations"
      breadcrumbLabel="Services"
      title="Tous nos services à Lausanne et dans le canton de Vaud"
      intro="Un seul partenaire pour organiser vos besoins de déménagement, nettoyage, transport et multiservices, avec une réponse claire et un devis gratuit."
    >
      <section className="services-directory" aria-labelledby="services-directory-title">
        <div className="services-directory-heading">
          <p className="eyebrow">Une solution pour chaque besoin</p>
          <h2 id="services-directory-title">Choisissez le service qui vous convient</h2>
          <p>Chaque prestation peut être organisée séparément ou combinée avec d’autres services selon votre projet. Pour organiser votre départ, découvrez notre <Link className="contextual-link" href="/services/demenagement">entreprise de déménagement à Lausanne</Link>, notre <Link className="contextual-link" href="/services/nettoyage">entreprise de nettoyage à Lausanne</Link> et nos solutions de <Link className="contextual-link" href="/services/location-camion">location de camion avec ou sans chauffeur</Link>.</p>
        </div>
        <div className="services-directory-grid">
          {services.map((service) => (
            <article className="services-directory-card" key={service.href}>
              <Link className="services-directory-image" href={service.href} aria-label={`Découvrir : ${service.title}`}>
                <Image src={service.image} alt={service.alt} fill sizes="(max-width: 680px) 100vw, (max-width: 1000px) 50vw, 33vw" />
              </Link>
              <div className="services-directory-copy">
                <h2>{service.title}</h2>
                <p>{service.description}</p>
                <Link className="detail-link" href={service.href}>{service.title} : détails et devis →</Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-section" aria-labelledby="choisir-prestations-title">
        <div className="content-lead">
          <h2 id="choisir-prestations-title">Quelles prestations choisir pour votre projet ?</h2>
          <p>
            Certaines interventions se complètent : choisissez un service seul ou contactez-nous pour organiser plusieurs prestations autour de la même date. Voici quelques situations courantes.
          </p>
        </div>
        <div className="detail-grid">
          <article>
            <h3>Vous préparez un déménagement ?</h3>
            <p>
              Notre <Link className="contextual-link" href="/services/demenagement">service de déménagement</Link> prend en charge le transport de vos affaires. Si vous préférez conduire, comparez nos <Link className="contextual-link" href="/services/location-camion">camions à louer</Link>. Vous pouvez aussi prévoir le <Link className="contextual-link" href="/services/montage-de-meubles">montage de vos meubles</Link>.
            </p>
          </article>
          <article>
            <h3>Vous rendez un logement ?</h3>
            <p>
              Un <Link className="contextual-link" href="/services/debarras">débarras</Link> peut aider à vider les pièces avant un <Link className="contextual-link" href="/services/nettoyage">nettoyage de fin de bail</Link>. Précisez la date de remise des clés et les surfaces concernées pour préparer votre demande.
            </p>
          </article>
          <article>
            <h3>Vous avez un besoin ponctuel ?</h3>
            <p>
              Pour des fixations, de petits ajustements ou l'entretien du jardin, consultez nos <Link className="contextual-link" href="/services/petits-travaux-jardinage">petits travaux et services de jardinage</Link>. Pour déplacer un meuble ou un objet volumineux, découvrez le <Link className="contextual-link" href="/services/transport-et-livraison">transport et la livraison</Link>.
            </p>
          </article>
          <article>
            <h3>Vous organisez une intervention professionnelle ?</h3>
            <p>
              Selon vos besoins, nous pouvons étudier le <Link className="contextual-link" href="/services/nettoyage">nettoyage de bureaux ou de commerces</Link> et le <Link className="contextual-link" href="/services/transport-et-livraison">transport d'équipements</Link>. Décrivez les locaux, les accès et vos contraintes horaires dans votre demande.
            </p>
          </article>
        </div>
      </section>
    </PageShell>
  );
}
