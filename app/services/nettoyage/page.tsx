import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "../../ui/page-shell";
import { Realizations } from "../../ui/realizations";
import {CleaningSections} from "./cleaning-sections";
import { ServiceGallery, type ServicePhoto } from "../../ui/service-gallery";

export const metadata: Metadata = {
  title: "Entreprise de nettoyage à Lausanne",
  description:
    "Entreprise de nettoyage à Lausanne et dans le canton de Vaud. Fin de bail, bureaux, commerces, vitres et fin de chantier. Demandez un devis gratuit.",
  alternates: { canonical: "/services/nettoyage" },
  openGraph: {
    title: "Entreprise de nettoyage à Lausanne | Super-Service",
    description:
      "Nettoyage de fin de bail, bureaux, commerces, vitres et fin de chantier à Lausanne et dans le canton de Vaud.",
    url: "/services/nettoyage",
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

const photos: ServicePhoto[] = [
  {
    src: "/images/nettoyage/nettoyage-vitres-lausanne.webp",
    alt: "Professionnels réalisant un nettoyage de vitres à Lausanne",
    caption: "Nettoyage professionnel des vitres",
    position: "center 44%",
  },
  {
    src: "/images/nettoyage/agent-nettoyage-super-service-vaud.webp",
    alt: "Agent de nettoyage Super-Service équipé dans le canton de Vaud",
    caption: "Une équipe équipée pour chaque intervention",
    position: "center 46%",
  },
];

export default function Page() {
  return (
    <PageShell
      eyebrow="Service principal"
      breadcrumbLabel="Nettoyage"
      title="Entreprise de nettoyage à Lausanne et dans le canton de Vaud"
      intro="Super-Service propose des prestations de nettoyage pour les particuliers, les entreprises et les régies à Lausanne et dans le canton de Vaud. Fin de bail, bureaux, commerces ou fin de chantier : nous adaptons notre intervention à vos besoins. Demandez votre devis gratuit."
    >
      <section className="content-section">
        <div className="content-lead">
          <h2>Nos services de nettoyage à Lausanne</h2>
          <p>
            Nous adaptons nos prestations à la surface, au niveau de salissure et au délai disponible pour les logements, bureaux, commerces et locaux après travaux. Pour libérer les pièces avant notre intervention, nous pouvons également organiser un <Link className="contextual-link" href="/services/debarras">débarras</Link>. Pour préparer la remise des clés, consultez notre <Link className="contextual-link" href="/blog/checklist-nettoyage-fin-de-bail-lausanne">checklist de nettoyage de fin de bail</Link>.
          </p>
        </div>

        <ServiceGallery
          id="nettoyage-en-images"
          eyebrow="Le soin dans chaque détail"
          title="Une entreprise de nettoyage attentive aux détails"
          photos={photos}
        />

        <div className="detail-grid">
          <article>
            <h3>Nettoyage de fin de bail</h3>
            <p>
              Cuisine, sanitaires, sols, placards, vitres et autres surfaces accessibles à préparer avant l’état des lieux.
            </p>
          </article>
          <article>
            <h3>Bureaux et commerces</h3>
            <p>
              Entretien ponctuel ou régulier des bureaux, commerces et espaces professionnels selon les surfaces et la fréquence demandées.
            </p>
          </article>
          <article>
            <h3>Fin de chantier</h3>
            <p>
              Nettoyage des poussières, traces et résidus accessibles après une rénovation ou des{" "}
              <Link className="contextual-link" href="/services/petits-travaux-jardinage">petits travaux</Link>.
            </p>
          </article>
          <article>
            <h3>Nettoyage de vitres</h3>
            <p>
              Vitres, cadres et surfaces vitrées accessibles, selon les matériaux et les conditions d’accès.
            </p>
          </article>
        </div>
      </section>
      <CleaningSections />
      <Realizations service="nettoyage" />
    </PageShell>
  );
}
