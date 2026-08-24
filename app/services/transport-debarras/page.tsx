import type { Metadata } from "next";
import Image from "next/image";
import { PageShell } from "../../ui/page-shell";

export const metadata: Metadata = {
  title: "Transport, livraison et débarras à Lausanne",
  description:
    "Transport d’objets, livraison à domicile, camion avec service et débarras à Lausanne et dans le canton de Vaud.",
  alternates: { canonical: "/services/transport-debarras" },
  openGraph: {
    title: "Transport et débarras à Lausanne | Super-Service",
    description:
      "Transport, livraison et débarras à Lausanne et dans le canton de Vaud avec une équipe et un véhicule adaptés.",
    images: [
      {
        url: "/images/transport-debarras/transport-livraison-lausanne.webp",
        width: 941,
        height: 1671,
        alt: "Professionnel Super-Service assurant un transport à Lausanne",
      },
    ],
  },
};

const servicePhotos = [
  {
    src: "/images/transport-debarras/transport-livraison-lausanne.webp",
    alt: "Professionnel Super-Service transportant des colis à Lausanne",
    caption: "Transport et livraison à Lausanne",
  },
  {
    src: "/images/transport-debarras/debarras-lausanne-canton-vaud.webp",
    alt: "Agent Super-Service pour un débarras à Lausanne et dans le canton de Vaud",
    caption: "Débarras à Lausanne et dans le canton de Vaud",
  },
];

export default function Page() {
  return (
    <PageShell
      eyebrow="Transport & évacuation"
      title="Transport, livraison et débarras à Lausanne"
      intro="Une solution flexible pour déplacer un meuble, livrer un achat ou vider entièrement un local."
    >
      <section className="content-section">
        <div className="detail-grid">
          <article>
            <h3>Transport d’objets</h3>
            <p>
              Meubles, électroménager et objets volumineux ou lourds transportés
              avec précaution.
            </p>
          </article>
          <article>
            <h3>Livraison à domicile</h3>
            <p>
              Récupération d’achats et livraison jusqu’à votre logement ou votre
              entreprise.
            </p>
          </article>
          <article>
            <h3>Camion avec service</h3>
            <p>
              Véhicule adapté avec chauffeur et, si nécessaire, une équipe de
              manutention.
            </p>
          </article>
          <article id="debarras">
            <h3>Débarras et encombrants</h3>
            <p>
              Cave, appartement, bureau ou chantier : tri, chargement et
              évacuation responsable.
            </p>
          </article>
        </div>
      </section>

      <section
        className="service-photo-showcase transport-photo-showcase"
        aria-labelledby="transport-showcase-title"
      >
        <div className="section-heading compact">
          <p className="eyebrow">Transport & débarras en images</p>
          <h2 id="transport-showcase-title">
            Une équipe disponible pour vos transports et débarras
          </h2>
          <p>
            Colis, meubles ou encombrants : nous intervenons avec un véhicule
            adapté à Lausanne et dans le canton de Vaud.
          </p>
        </div>

        <div className="service-photo-gallery">
          {servicePhotos.map((photo) => (
            <figure key={photo.src}>
              <div className="service-photo">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
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
