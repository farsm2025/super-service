import type {Metadata} from "next";
import Image from "next/image";
import {PageShell} from "../../ui/page-shell";

export const metadata: Metadata = {
  title: "Entreprise de déménagement à Lausanne",
  description:
    "Déménagement de particuliers et entreprises à Lausanne et dans le canton de Vaud : emballage, transport, démontage et remontage de meubles.",
};

export default function Page() {
  return (
    <PageShell
      eyebrow="Service principal"
      title="Entreprise de déménagement à Lausanne"
      intro="Du studio aux locaux professionnels, notre équipe organise votre déménagement avec méthode, soin et ponctualité."
    >
      <section className="content-section">
        <div className="content-lead">
          <h2>Un déménagement bien organisé, sans stress inutile</h2>
          <p>
            Nous adaptons l’équipe, le véhicule et le matériel au volume à
            transporter. Vos meubles et objets fragiles sont protégés avant le
            chargement.
          </p>
        </div>

        <section className="moving-showcase" aria-labelledby="moving-showcase-title">
          <div className="moving-showcase-heading">
            <p className="eyebrow">Notre savoir-faire en images</p>
            <h2 id="moving-showcase-title">
              Une équipe attentive et un chargement protégé
            </h2>
          </div>

          <div className="moving-gallery">
            <figure>
              <div className="moving-photo">
                <Image
                  src="/images/demenagement/equipe-demenagement-lausanne.webp"
                  alt="Déménageur Super-Service transportant un carton à Lausanne"
                  fill
                  sizes="(max-width: 680px) 100vw, 50vw"
                />
              </div>
              <figcaption>
                Une équipe disponible pour votre déménagement à Lausanne
              </figcaption>
            </figure>

            <figure>
              <div className="moving-photo">
                <Image
                  src="/images/demenagement/camion-demenagement-20m3.webp"
                  alt="Camion de déménagement chargé de meubles protégés dans le canton de Vaud"
                  fill
                  sizes="(max-width: 680px) 100vw, 50vw"
                />
              </div>
              <figcaption>
                Meubles emballés et chargés avec soin dans le camion
              </figcaption>
            </figure>
          </div>
        </section>

        <div className="detail-grid moving-details">
          <article>
            <h3>Déménagement privé</h3>
            <p>
              Appartement, maison, cave ou garde-meubles dans le canton de Vaud
              et au-delà.
            </p>
          </article>
          <article>
            <h3>Déménagement d’entreprise</h3>
            <p>
              Bureaux, commerces et matériel professionnel avec organisation
              selon vos contraintes.
            </p>
          </article>
          <article id="montage">
            <h3>Montage et démontage</h3>
            <p>
              Armoires, lits, étagères, tables et meubles complexes démontés
              puis remontés avec soin.
            </p>
          </article>
          <article>
            <h3>Emballage et protection</h3>
            <p>
              Cartons, couvertures et protections adaptés pour préserver vos
              biens pendant le transport.
            </p>
          </article>
        </div>
      </section>
    </PageShell>
  );
}
