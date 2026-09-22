import type {Metadata} from "next";
import Image from "next/image";
import Link from "next/link";
import {PageShell} from "../../ui/page-shell";

export const metadata:Metadata={
  title:"Cartons de déménagement à Lausanne",
  description:"Deux formats de cartons de déménagement seront prochainement disponibles chez Super-Service à Lausanne. Découvrez les dimensions et les prix indicatifs.",
  alternates:{canonical:"/services/cartons-demenagement"},
  openGraph:{
    title:"Cartons de déménagement à Lausanne",
    description:"Deux formats de cartons bientôt disponibles pour préparer votre déménagement.",
    images:[{url:"/images/demenagement/equipe-demenagement-lausanne.webp",width:1600,height:1200,alt:"Préparation d'un déménagement avec Super-Service à Lausanne"}]
  }
};

const cartons=[
  {name:"Carton standard",size:"40 × 30 × 30 cm",price:"CHF 4.90",large:false,description:"Un format pratique pour les livres, la vaisselle, les objets du quotidien et les petites affaires."},
  {name:"Grand carton",size:"60 × 40 × 40 cm",price:"CHF 6.90",large:true,description:"Un grand format pour le linge, les objets volumineux et les affaires légères qui prennent plus de place."},
];

export default function CartonsDemenagementPage(){
  return <PageShell
    eyebrow="Préparez votre déménagement"
    breadcrumbLabel="Cartons de déménagement"
    title="Cartons de déménagement à Lausanne"
    intro="Deux formats seront prochainement disponibles chez Super-Service pour vous aider à préparer votre déménagement simplement."
  >
    <section className="cartons-intro-photo" aria-label="Cartons de déménagement bientôt disponibles">
      <Image src="/images/demenagement/equipe-demenagement-lausanne.webp" alt="Préparation d'un déménagement avec cartons à Lausanne" fill priority sizes="(max-width:680px) 100vw,86vw"/>
      <span className="cartons-coming-badge">Bientôt disponible</span>
    </section>

    <section className="cartons-section" aria-labelledby="cartons-title">
      <div className="cartons-section-head">
        <p className="eyebrow">Deux formats prévus</p>
        <h2 id="cartons-title">Choisissez la taille adaptée à vos affaires</h2>
        <p>Les dimensions et tarifs ci-dessous sont provisoires et seront confirmés avant l'ouverture des commandes.</p>
      </div>

      <div className="cartons-grid">
        {cartons.map((carton)=><article className="carton-product-card" key={carton.name}>
          <div className="carton-visual">
            <div className={`carton-box-shape${carton.large?" large":""}`} aria-hidden="true"/>
            <span className="cartons-coming-badge">Bientôt disponible</span>
          </div>
          <div className="carton-product-copy">
            <h3>{carton.name}</h3>
            <p className="carton-size">{carton.size}</p>
            <p>{carton.description}</p>
            <div className="carton-price-row">
              <span>Prix indicatif provisoire</span>
              <strong>{carton.price}</strong>
            </div>
            <p className="carton-temp-note">Aucun paiement ni commande en ligne n'est actif pour le moment.</p>
          </div>
        </article>)}
      </div>

      <aside className="cartons-contact">
        <div>
          <h2>Vous souhaitez être informé de la disponibilité ?</h2>
          <p>Contactez-nous et nous vous indiquerons dès que les cartons seront disponibles à la vente.</p>
        </div>
        <div className="hero-actions">
          <a className="button button-whatsapp" href="https://wa.me/41783223368">WhatsApp</a>
          <Link className="button button-outline" href="/devis">Nous contacter</Link>
        </div>
      </aside>
    </section>
  </PageShell>;
}
