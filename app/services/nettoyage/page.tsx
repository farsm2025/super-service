import type { Metadata } from "next";
import Image from "next/image";
import { PageShell } from "../../ui/page-shell";

export const metadata: Metadata = {
  title: "Nettoyage de fin de bail à Lausanne",
  description:
    "Nettoyage professionnel de fin de bail, bureaux et fin de chantier à Lausanne et dans le canton de Vaud. Devis gratuit sous 24 h.",
  alternates: { canonical: "/services/nettoyage" },
  openGraph: {
    title: "Nettoyage professionnel à Lausanne",
    description:
      "Nettoyage de fin de bail, bureaux, vitres et fin de chantier à Lausanne et dans le canton de Vaud.",
    images: [
      {
        url: "/images/nettoyage/nettoyage-vitres-lausanne.webp",
        width: 1280,
        height: 1920,
        alt: "Nettoyage professionnel de vitres à Lausanne",
      },
    ],
  },
};

const cleaningPhotos = [
  {
    src: "/images/nettoyage/nettoyage-vitres-lausanne.webp",
    alt: "Professionnels réalisant un nettoyage de vitres à Lausanne",
    caption: "Nettoyage professionnel des vitres",
  },
  {
    src: "/images/nettoyage/agent-nettoyage-super-service-vaud.webp",
    alt: "Agent de nettoyage Super-Service équipé dans le canton de Vaud",
    caption: "Une équipe équipée pour chaque intervention",
  },
];

export default function Page() {
  return (
    <PageShell
      eyebrow="Service principal"
      title="Nettoyage professionnel à Lausanne"
      intro="Fin de bail, bureaux ou après travaux : nous remettons les lieux en état avec une attention particulière aux détails."
    >
      <section className="content-section">
        <div className="content-lead">
          <h2>Des locaux propres, prêts à être rendus ou réutilisés</h2>
          <p>
            La prestation est adaptée à la surface, au niveau de salissure et au
            délai disponible.
          </p>
        </div>
        <div className="detail-grid">
          <article>
            <h3>Nettoyage de fin de bail</h3>
            <p>
              Cuisine, sanitaires, sols, surfaces, vitres et détails importants
              avant l’état des lieux.
            </p>
          </article>
          <article>
            <h3>Bureaux et commerces</h3>
            <p>
              Nettoyage ponctuel ou régulier des espaces professionnels et zones
              communes.
            </p>
          </article>
          <article>
            <h3>Fin de chantier</h3>
            <p>
              Évacuation des poussières, traces et résidus après rénovation ou
              petits travaux.
            </p>
          </article>
          <article>
            <h3>Nettoyage avec déménagement</h3>
            <p>
              Une seule équipe coordonne le départ des meubles puis la remise en
              état du logement.
            </p>
          </article>
        </div>
      </section>

      <section
        className="service-photo-showcase cleaning-photo-showcase"
        aria-labelledby="cleaning-showcase-title"
      >
        <div className="section-heading compact">
          <p className="eyebrow">Le soin dans chaque détail</p>
          <h2 id="cleaning-showcase-title">
            Un nettoyage professionnel, du matériel au résultat
          </h2>
          <p>
            Notre équipe intervient avec les équipements adaptés pour rendre vos
            espaces propres et agréables.
          </p>
        </div>
        <div className="service-photo-gallery">
          {cleaningPhotos.map((photo, index) => (
            <figure key={photo.src}>
              <div className="service-photo">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 680px) calc(100vw - 40px), (max-width: 1100px) 44vw, 520px"
                />
              </div>
              <figcaption>{photo.caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
