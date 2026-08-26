import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "../../ui/page-shell";
import { Realizations } from "../../ui/realizations";
import { ServiceGallery, type ServicePhoto } from "../../ui/service-gallery";

export const metadata: Metadata = {
  title: "Transport et livraison à Lausanne",
  description:
    "Transport de meubles et d’objets, livraison à domicile, camion avec chauffeur et manutention à Lausanne et dans le canton de Vaud.",
  alternates: { canonical: "/services/transport-et-livraison" },
  openGraph: {
    title: "Transport et livraison à Lausanne | Super-Service",
    description:
      "Transport, livraison et manutention à Lausanne et dans le canton de Vaud avec une équipe et un véhicule adaptés.",
    url: "/services/transport-et-livraison",
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

const photos: ServicePhoto[] = [
  {
    src: "/images/transport-debarras/transport-livraison-lausanne.webp",
    alt: "Professionnel Super-Service transportant des colis à Lausanne",
    caption: "Transport et livraison à Lausanne",
    position: "center 42%",
  },
  {
    src: "/images/transport-debarras/debarras-lausanne-canton-vaud.webp",
    alt: "Chauffeur Super-Service dans son véhicule dans le canton de Vaud",
    caption: "Un chauffeur et un véhicule adaptés à votre demande",
    position: "center 35%",
  },
];

export default function Page() {
  return (
    <PageShell
      eyebrow="Transport & livraison"
      breadcrumbLabel="Transport et livraison"
      title="Transport et livraison à Lausanne"
      intro="Une solution flexible pour déplacer un meuble, livrer un achat ou transporter des objets volumineux."
    >
      <section className="content-section">
        <div className="content-lead">
          <h2>Un transport organisé selon le volume et l’accès</h2>
          <p>
            Nous choisissons le véhicule et la manutention nécessaires pour
            transporter vos biens avec soin jusqu’à leur destination.
          </p>
        </div>

        <ServiceGallery
          id="transport-en-images"
          eyebrow="Transport & livraison en images"
          title="Une équipe disponible pour vos transports"
          photos={photos}
        />

        <div className="detail-grid">
          <article>
            <h3>Transport de meubles et d’objets</h3>
            <p>
              Meubles, électroménager et objets volumineux ou lourds transportés
              avec précaution.
            </p>
          </article>
          <article>
            <h3>Livraison à domicile</h3>
            <p>
              Récupération d’achats volumineux et livraison jusqu’à votre
              logement ou votre entreprise.
            </p>
          </article>
          <article>
            <h3>Camion avec chauffeur</h3>
            <p>
              Véhicule adapté avec chauffeur et, si nécessaire, une équipe pour
              assurer la manutention.
            </p>
          </article>
          <article id="debarras">
            <h3>Besoin de vider un local ?</h3>
            <p>
              Notre service de débarras prend en charge le tri, le chargement et
              l’évacuation des encombrants.
            </p>
            <Link className="detail-link" href="/services/debarras">
              Découvrir le service de débarras →
            </Link>
          </article>
        </div>
      </section>
      <Realizations service="transport-et-livraison" />
    </PageShell>
  );
}
