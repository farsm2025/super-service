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
    url: "/services/debarras",
    images: [
      {
        url: "/images/debarras/debarras-cave-lausanne.webp",
        width: 1200,
        height: 900,
        alt: "Cave encombrée à débarrasser à Lausanne",
      },
    ],
  },
};

const photos: ServicePhoto[] = [
  {
    src: "/images/debarras/debarras-cave-lausanne.webp",
    alt: "Cave encombrée de meubles et de cartons avant un débarras à Lausanne",
    caption: "Débarras de caves, greniers et espaces de stockage",
  },
  {
    src: "/images/debarras/debarras-maison-lausanne.webp",
    alt: "Meubles et cartons à évacuer lors du débarras d’une maison à Lausanne",
    caption: "Tri et évacuation des meubles et objets encombrants",
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
