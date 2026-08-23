import type {Metadata} from "next";
import Image from "next/image";
import Link from "next/link";
import {PageShell} from "../../ui/page-shell";
import {getServiceBySlug} from "../../../lib/sanity";

export async function generateMetadata():Promise<Metadata>{
  const service=await getServiceBySlug("location-camion");
  const title=service?.seoTitle||"Location de camion sans chauffeur à Lausanne";
  const description=service?.seoDescription||"Location de camion sans chauffeur à Lausanne pour déménagement et transport de meubles. Contactez Super-Service pour connaître les disponibilités.";
  return {title,description,alternates:{canonical:"/services/location-camion"},openGraph:{title,description,images:[{url:"/images/location-camion/camion-exterieur.webp",width:1600,height:1200,alt:"Camion de location sans chauffeur à Lausanne"}]}};
}

const fallback="Information disponible prochainement";

export default async function Page(){
  const service=await getServiceBySlug("location-camion");
  const details=[["Volume utile",service?.vehicleVolume],["Dimensions intérieures",service?.vehicleDimensions],["Permis nécessaire",service?.licenseRequired],["Tarifs",service?.rentalPrice],["Kilométrage inclus",service?.includedMileage],["Caution",service?.deposit],["Assurance",service?.insurance],["Prise en charge et restitution",service?.pickupLocation]];
  return <PageShell eyebrow="Location en toute autonomie" title={service?.title||"Location de camion sans chauffeur à Lausanne"} intro={service?.description||"Louez un camion à Lausanne pour votre déménagement, le transport de meubles, de cartons ou d’objets volumineux. Une solution pratique pour organiser vous-même votre transport dans le canton de Vaud."}>
    <section className="truck-showcase" aria-labelledby="camion-images-title"><div className="section-heading compact"><p className="eyebrow">Le véhicule</p><h2 id="camion-images-title">Un grand espace pour transporter vos biens</h2><p>Vue extérieure et espace de chargement du camion proposé à la location.</p></div><div className="truck-gallery"><figure><div className="truck-photo"><Image src="/images/location-camion/camion-exterieur.webp" alt="Camion blanc disponible à la location sans chauffeur à Lausanne" fill priority sizes="(max-width:680px) 100vw,(max-width:1100px) 50vw,560px"/></div><figcaption>Camion disponible sans chauffeur</figcaption></figure><figure><div className="truck-photo"><Image src="/images/location-camion/espace-chargement.webp" alt="Espace intérieur du camion de location pour meubles et cartons" fill sizes="(max-width:680px) 100vw,(max-width:1100px) 50vw,560px"/></div><figcaption>Espace de chargement intérieur</figcaption></figure></div></section>
    <section className="truck-details"><div className="truck-details-copy"><p className="eyebrow">Informations pratiques</p><h2>Préparez votre location</h2><p>Les informations techniques et les conditions seront ajoutées prochainement. Vous pouvez déjà nous contacter pour vérifier la disponibilité du camion.</p><div className="truck-actions"><Link className="button button-primary" href="/devis">Vérifier la disponibilité</Link><a className="button button-whatsapp" href="https://wa.me/41783223368">Demander sur WhatsApp</a></div></div><dl>{details.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value||fallback}</dd></div>)}</dl></section>
    {service?.rentalConditions&&<section className="rental-conditions"><h2>Conditions de location</h2><p>{service.rentalConditions}</p></section>}
  </PageShell>;
}
