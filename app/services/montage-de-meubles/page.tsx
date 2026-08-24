import type { Metadata } from "next";
import { PageShell } from "../../ui/page-shell";
import { ServiceGallery, type ServicePhoto } from "../../ui/service-gallery";

export const metadata: Metadata = {
  title: "Montage et démontage de meubles à Lausanne",
  description:
    "Montage et démontage de lits, armoires, tables, étagères et autres meubles à Lausanne, seul ou avec un déménagement.",
  alternates: { canonical: "/services/montage-de-meubles" },
  openGraph: {
    title: "Montage de meubles à Lausanne | Super-Service",
    description:
      "Montage, démontage et remontage de meubles à Lausanne et dans le canton de Vaud, seul ou avec un déménagement.",
    images: [
      {
        url: "/images/demenagement/equipe-demenagement-lausanne.webp",
        width: 1600,
        height: 1200,
        alt: "Professionnel Super-Service prenant en charge des meubles à Lausanne",
      },
    ],
  },
};

const photos: ServicePhoto[] = [
  {
    src: "/images/demenagement/equipe-demenagement-lausanne.webp",
    alt: "Professionnel Super-Service prenant en charge des meubles à Lausanne",
    caption: "Une prise en charge soigneuse de vos meubles",
  },
  {
    src: "/images/demenagement/camion-demenagement-20m3.webp",
    alt: "Meubles protégés et chargés dans un camion de déménagement",
    caption: "Un service disponible seul ou avec votre déménagement",
  },
];

export default function Page() {
  return (
    <PageShell
      eyebrow="Montage & démontage"
      title="Montage et démontage de meubles à Lausanne"
      intro="Lits, armoires, tables ou étagères : nous assemblons et démontons vos meubles avec méthode et précaution."
    >
      <section className="content-section">
        <div className="content-lead">
          <h2>Un service réservé seul ou avec votre déménagement</h2>
          <p>
            Nous pouvons intervenir uniquement pour le montage d’un meuble ou
            coordonner son démontage, son transport et son remontage à la nouvelle
            adresse.
          </p>
        </div>

        <ServiceGallery
          id="montage-en-images"
          eyebrow="Vos meubles pris en charge avec soin"
          title="Une intervention organisée du démontage au remontage"
          photos={photos}
        />

        <div className="detail-grid">
          <article>
            <h3>Lits et armoires</h3>
            <p>
              Démontage et remontage méthodiques des éléments volumineux pour
              faciliter leur déplacement.
            </p>
          </article>
          <article>
            <h3>Tables et étagères</h3>
            <p>
              Assemblage des structures, plateaux, rayonnages et différents
              éléments selon leur système de fixation.
            </p>
          </article>
          <article>
            <h3>Meubles neufs</h3>
            <p>
              Montage de meubles livrés en kit en suivant la notice et en
              contrôlant leur stabilité.
            </p>
          </article>
          <article>
            <h3>Avec un déménagement</h3>
            <p>
              Le démontage, le transport et le remontage peuvent être intégrés à
              votre prestation de déménagement.
            </p>
          </article>
        </div>
      </section>
    </PageShell>
  );
}
