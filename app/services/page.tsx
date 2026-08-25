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
      title="Tous nos services à Lausanne et dans le canton de Vaud"
      intro="Un seul partenaire pour organiser vos besoins de déménagement, nettoyage, transport et multiservices, avec une réponse claire et un devis gratuit."
    >
      <section className="services-directory" aria-labelledby="services-directory-title">
        <div className="services-directory-heading">
          <p className="eyebrow">Une solution pour chaque besoin</p>
          <h2 id="services-directory-title">Choisissez le service qui vous convient</h2>
          <p>Chaque prestation peut être organisée séparément ou combinée avec d’autres services selon votre projet.</p>
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
                <Link className="detail-link" href={service.href}>Découvrir le service →</Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
