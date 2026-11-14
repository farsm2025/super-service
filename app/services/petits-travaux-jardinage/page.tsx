import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "../../ui/page-shell";
import { Realizations } from "../../ui/realizations";
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
    url: "/services/petits-travaux-jardinage",
    images: [
      {
        url: "/images/petits-travaux-jardinage/entretien-jardin-lausanne.webp",
        width: 1200,
        height: 900,
        alt: "Jardin entretenu avec pelouse et haies taillées à Lausanne",
      },
    ],
  },
};

const photos: ServicePhoto[] = [
  {
    src: "/images/petits-travaux-jardinage/entretien-jardin-lausanne.webp",
    alt: "Entretien d’un jardin avec pelouse et haies taillées à Lausanne",
    caption: "Entretien ponctuel de vos jardins et espaces extérieurs",
  },
  {
    src: "/images/petits-travaux-jardinage/petits-travaux-electriques-lausanne.webp",
    alt: "Préparation du raccordement d’un luminaire à Lausanne",
    caption: "Petites interventions et remplacement de luminaires",
  },
];

export default function Page() {
  return (
    <PageShell
      eyebrow="Multiservices"
      breadcrumbLabel="Petits travaux et jardinage"
      title="Petits travaux et jardinage à Lausanne"
      intro="Les petites interventions qui vous font gagner du temps, réalisées par une équipe polyvalente."
    >
      <section className="content-section">
        <div className="content-lead">
          <h2>Une aide pratique pour votre logement ou vos extérieurs</h2>
          <p>
            Décrivez-nous le travail à réaliser : nous confirmons la prestation,
            le matériel nécessaire et la durée estimée avant l’intervention. Pour préparer un espace encombré, notre <Link className="contextual-link" href="/services/debarras">service de débarras</Link> peut également vous accompagner.
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
              votre logement ou bureau. Pour les armoires, lits et étagères, consultez notre <Link className="contextual-link" href="/services/montage-de-meubles">montage de meubles</Link>.
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
              ordre du jardin. Pour la remise en état des espaces intérieurs, découvrez notre <Link className="contextual-link" href="/services/nettoyage">nettoyage professionnel</Link>.
            </p>
          </article>
        </div>
      </section>

      <section className="content-section" aria-labelledby="preparer-petits-travaux-title">
        <div className="content-lead">
          <h2 id="preparer-petits-travaux-title">Comment préparer votre demande de petits travaux ?</h2>
          <p>
            Une description précise nous aide à vérifier si l'intervention entre dans nos prestations et à établir un devis adapté. Selon le travail demandé, les dimensions, l'état des supports et l'accès au chantier peuvent modifier le matériel nécessaire.
          </p>
        </div>
        <div className="detail-grid">
          <article>
            <h3>Pour du bricolage ou des fixations</h3>
            <p>
              Décrivez l'objet à poser ou à réparer, son emplacement et, si possible, les dimensions. Pour une fixation murale, précisez la nature du mur si vous la connaissez et joignez des photos de la zone.
            </p>
          </article>
          <article>
            <h3>Pour l'entretien d'un jardin</h3>
            <p>
              Indiquez les travaux souhaités, par exemple la taille d'une haie ou la remise en ordre d'un extérieur. Des photos, la longueur et la hauteur approximatives des végétaux ainsi que les conditions d'accès facilitent l'évaluation.
            </p>
          </article>
          <article>
            <h3>Pour connaître la faisabilité</h3>
            <p>
              Communiquez la commune, la date souhaitée et les éventuelles contraintes d'accès. Nous pourrons préciser les interventions proposées et les conditions du devis avant de convenir d'une date.
            </p>
          </article>
          <article>
            <h3>Pour une intervention électrique simple</h3>
            <p>
              Décrivez le luminaire ou l'accessoire concerné. Nous confirmerons si la demande est réalisable dans le cadre des interventions simples annoncées, hors travaux électriques réglementés.
            </p>
          </article>
        </div>
        <div className="content-lead">
          <h2>Jardinage à Lausanne et sur La Côte : des exemples concrets</h2>
          <p>
            Parmi les réalisations publiées sur cette page figurent des tailles de haies à Gland. Pour une intervention à Lausanne, à Morges, à Gland ou dans une autre commune vaudoise, indiquez votre adresse pour vérifier les modalités de déplacement et la prestation possible.
          </p>
          <p>
            Vous pouvez <Link className="contextual-link" href="/devis">demander un devis avec des photos</Link>. Si vous devez également évacuer des encombrants ou remettre un logement en état, consultez nos prestations de <Link className="contextual-link" href="/services/debarras">débarras</Link> et de <Link className="contextual-link" href="/services/nettoyage">nettoyage</Link>.
          </p>
        </div>
      </section>
      <Realizations service="petits-travaux-jardinage" />
    </PageShell>
  );
}
