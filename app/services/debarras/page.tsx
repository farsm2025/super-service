import type { Metadata } from "next";
import { PageShell } from "../../ui/page-shell";
import { ServiceGallery, type ServicePhoto } from "../../ui/service-gallery";

export const metadata: Metadata = {
  title: "Service de débarras à Lausanne et dans le canton de Vaud",
  description:
    "Débarras d’appartements, maisons, caves, bureaux, locaux et chantiers avec tri, chargement et évacuation à Lausanne et dans le canton de Vaud.",
  alternates: { canonical: "/services/debarras" },
  openGraph: {
    title: "Service de débarras à Lausanne | Super-Service",
    description:
      "Tri, chargement, transport et évacuation des encombrants à Lausanne et dans le canton de Vaud.",
    images: [
      {
        url: "/images/transport-debarras/debarras-lausanne-canton-vaud.webp",
        width: 941,
        height: 1672,
        alt: "Service de débarras Super-Service dans le canton de Vaud",
      },
    ],
  },
};

const photos: ServicePhoto[] = [
  {
    src: "/images/transport-debarras/debarras-lausanne-canton-vaud.webp",
    alt: "Agent Super-Service pour un débarras à Lausanne et dans le canton de Vaud",
    caption: "Une équipe disponible pour votre débarras",
    position: "center 35%",
  },
  {
    src: "/images/transport-debarras/transport-livraison-lausanne.webp",
    alt: "Professionnel Super-Service transportant des objets vers un véhicule",
    caption: "Chargement et transport des objets à évacuer",
    position: "center 42%",
  },
];

export default function Page() {
  return (
    <PageShell
      eyebrow="Tri & évacuation"
      title="Service de débarras à Lausanne et dans le canton de Vaud"
      intro="Appartement, maison, cave, bureau ou chantier : nous organisons le débarras selon le volume et les accès."
    >
      <section className="content-section">
        <div className="content-lead">
          <h2>Libérez votre espace sans gérer seul la manutention</h2>
          <p>
            Nous évaluons les objets à retirer, préparons le chargement et
            organisons leur évacuation de manière responsable.
          </p>
        </div>

        <ServiceGallery
          id="debarras-en-images"
          eyebrow="Une prise en charge complète"
          title="Du tri au transport des encombrants"
          photos={photos}
        />

        <div className="detail-grid">
          <article>
            <h3>Appartements et maisons</h3>
            <p>
              Débarras complet ou partiel après un déménagement, une succession
              ou un changement d’aménagement.
            </p>
          </article>
          <article>
            <h3>Caves et locaux</h3>
            <p>
              Retrait des meubles, cartons et objets accumulés dans les caves,
              greniers, bureaux et espaces de stockage.
            </p>
          </article>
          <article>
            <h3>Tri et chargement</h3>
            <p>
              Les objets sont regroupés, triés puis chargés avec une organisation
              adaptée aux accès et au volume.
            </p>
          </article>
          <article>
            <h3>Transport et évacuation</h3>
            <p>
              Les encombrants sont transportés vers une filière appropriée en
              tenant compte des possibilités de réemploi et de recyclage.
            </p>
          </article>
        </div>
      </section>
    </PageShell>
  );
}
