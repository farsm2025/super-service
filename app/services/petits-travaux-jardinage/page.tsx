import type { Metadata } from "next";
import { PageShell } from "../../ui/page-shell";
import { ServiceGallery, type ServicePhoto } from "../../ui/service-gallery";

export const metadata: Metadata = {
  title: "Petits travaux et jardinage à Lausanne",
  description:
    "Bricolage, petites interventions électriques, fixations murales, jardinage et taille de haies à Lausanne et dans le canton de Vaud.",
  alternates: { canonical: "/services/petits-travaux-jardinage" },
  openGraph: {
    title: "Petits travaux et jardinage à Lausanne | Super-Service",
    description:
      "Une équipe polyvalente pour le bricolage, les fixations et l’entretien extérieur à Lausanne et dans le canton de Vaud.",
    images: [
      {
        url: "/images/nettoyage/agent-nettoyage-super-service-vaud.webp",
        width: 1024,
        height: 1536,
        alt: "Agent Super-Service équipé pour une intervention dans le canton de Vaud",
      },
    ],
  },
};

const photos: ServicePhoto[] = [
  {
    src: "/images/nettoyage/agent-nettoyage-super-service-vaud.webp",
    alt: "Agent Super-Service équipé devant son véhicule dans le canton de Vaud",
    caption: "Une équipe équipée pour vos interventions",
    position: "center 42%",
  },
  {
    src: "/images/demenagement/equipe-demenagement-lausanne.webp",
    alt: "Professionnel Super-Service en intervention à Lausanne",
    caption: "Un service polyvalent et organisé",
  },
];

export default function Page() {
  return (
    <PageShell
      eyebrow="Multiservices"
      title="Petits travaux et jardinage à Lausanne"
      intro="Les petites interventions qui vous font gagner du temps, réalisées par une équipe polyvalente."
    >
      <section className="content-section">
        <div className="content-lead">
          <h2>Une aide pratique pour votre logement ou vos extérieurs</h2>
          <p>
            Décrivez-nous le travail à réaliser : nous confirmons la prestation,
            le matériel nécessaire et la durée estimée avant l’intervention.
          </p>
        </div>

        <ServiceGallery
          id="petits-travaux-en-images"
          eyebrow="Une équipe polyvalente"
          title="Des interventions préparées avec le matériel adapté"
          photos={photos}
        />

        <div className="detail-grid">
          <article>
            <h3>Bricolage</h3>
            <p>
              Montage, ajustements, petites réparations et travaux courants dans
              votre logement ou bureau.
            </p>
          </article>
          <article>
            <h3>Fixations murales</h3>
            <p>
              Étagères, cadres, tringles et autres éléments fixés proprement sur
              un support adapté.
            </p>
          </article>
          <article>
            <h3>Petite électricité</h3>
            <p>
              Interventions simples comme le remplacement de luminaires ou
              d’accessoires, hors travaux réglementés.
            </p>
          </article>
          <article>
            <h3>Jardinage</h3>
            <p>
              Entretien ponctuel des extérieurs, taille de haies et remise en
              ordre du jardin.
            </p>
          </article>
        </div>
      </section>
    </PageShell>
  );
}
