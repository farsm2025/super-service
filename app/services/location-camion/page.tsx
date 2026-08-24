import type {Metadata} from "next";
import Image from "next/image";
import Link from "next/link";
import {PageShell} from "../../ui/page-shell";
import {getServiceBySlug, type RentalVehicle} from "../../../lib/sanity";

export function generateMetadata():Metadata{
  const title="Location de camions avec ou sans chauffeur à Lausanne";
  const description="Location de deux camions avec ou sans chauffeur à Lausanne : Iveco Daily 17 m³ et Citroën Jumper 20 m³ avec hayon. Kilométrage illimité et permis B.";
  return {title,description,alternates:{canonical:"/services/location-camion"},openGraph:{title,description,images:[{url:"/images/location-camion/citroen-jumper-exterieur.webp",width:1600,height:1200,alt:"Camions de location avec ou sans chauffeur à Lausanne"}]}};
}

type VehiclePresentation=RentalVehicle&{
  vehicleId:"iveco"|"citroen";
  images:Array<{src:string;alt:string;caption:string}>;
};

const defaultVehicles:VehiclePresentation[]=[
  {
    vehicleId:"iveco",
    name:"Grand fourgon Iveco Daily",
    volume:"17 m³",
    feature:"Pratique pour les meubles, cartons et objets volumineux",
    halfDayPrice:"CHF 65.–",
    fullDayPrice:"CHF 130.–",
    images:[
      {src:"/images/location-camion/camion-exterieur.webp",alt:"Grand fourgon Iveco Daily de 17 m³ à louer à Lausanne",caption:"Iveco Daily – vue extérieure"},
      {src:"/images/location-camion/espace-chargement.webp",alt:"Espace de chargement du fourgon Iveco Daily de 17 m³",caption:"Espace de chargement de 17 m³"},
    ],
  },
  {
    vehicleId:"citroen",
    name:"Citroën Jumper avec hayon",
    volume:"20 m³",
    feature:"Caisse grand volume avec hayon élévateur",
    halfDayPrice:"CHF 75.–",
    fullDayPrice:"CHF 150.–",
    images:[
      {src:"/images/location-camion/citroen-jumper-exterieur.webp",alt:"Citroën Jumper de 20 m³ avec hayon à louer à Lausanne",caption:"Citroën Jumper – caisse de 20 m³"},
      {src:"/images/location-camion/citroen-jumper-hayon.webp",alt:"Hayon et espace de chargement du Citroën Jumper de 20 m³",caption:"Espace de chargement avec hayon"},
    ],
  },
];

function mergeVehicles(content?:RentalVehicle[]):VehiclePresentation[]{
  return defaultVehicles.map((vehicle)=>{
    const override=content?.find((item)=>item.vehicleId===vehicle.vehicleId);
    return {...vehicle,...override,vehicleId:vehicle.vehicleId,images:vehicle.images};
  });
}

export default async function Page(){
  const service=await getServiceBySlug("location-camion");
  const vehicles=mergeVehicles(service?.rentalVehicles);
  const driverHalfDay=service?.driverHalfDaySupplement||"CHF 100.–";
  const driverFullDay=service?.driverFullDaySupplement||"CHF 150.–";
  const sharedDetails=[
    ["Permis nécessaire",service?.licenseRequired||"Permis catégorie B pour conduire vous-même"],
    ["Caution",service?.deposit||"CHF 100.– par véhicule"],
    ["Kilométrage",service?.includedMileage||"Illimité"],
    ["Prise en charge et restitution",service?.pickupLocation||"Rue du Clos-de-Bulle 5, 1004 Lausanne"],
  ];
  return <PageShell eyebrow="Avec ou sans chauffeur" title="Location de deux camions à Lausanne" intro="Choisissez le véhicule adapté à votre déménagement ou à votre transport : conduisez-le vous-même ou ajoutez un chauffeur pour une demi-journée ou une journée complète.">
    <section className="rental-fleet" aria-labelledby="fleet-title">
      <div className="section-heading compact"><p className="eyebrow">Deux véhicules disponibles</p><h2 id="fleet-title">Choisissez le volume adapté à votre besoin</h2><p>Comparez les deux véhicules, leurs équipements et leurs tarifs de location.</p></div>
      <div className="rental-vehicle-grid">
        {vehicles.map((vehicle)=><article className="rental-vehicle-card" key={vehicle.vehicleId}>
          <header className="rental-vehicle-head"><div><p className="eyebrow">Tarif du véhicule</p><h3>{vehicle.name}</h3><p>{vehicle.feature}</p></div><strong className="volume-badge">{vehicle.volume}</strong></header>
          <div className="rental-vehicle-gallery">
            {vehicle.images.map((image,index)=><figure key={image.src}><div className="rental-vehicle-photo"><Image src={image.src} alt={image.alt} fill priority={vehicle.vehicleId==="iveco"&&index===0} sizes="(max-width:680px) 100vw,(max-width:1100px) 50vw,300px"/></div><figcaption>{image.caption}</figcaption></figure>)}
          </div>
          <div className="rental-prices" aria-label={`Tarifs sans chauffeur pour ${vehicle.name}`}><div><span>Demi-journée</span><strong>{vehicle.halfDayPrice}</strong></div><div className="featured-price"><span>Journée complète</span><strong>{vehicle.fullDayPrice}</strong></div></div>
          <p className="rental-base-note">Tarifs du camion sans chauffeur</p>
          <Link className="button button-primary" href="/devis">Réserver avec ou sans chauffeur</Link>
        </article>)}
      </div>
      <aside className="driver-option" aria-labelledby="driver-option-title">
        <div className="driver-option-copy"><span className="driver-option-icon" aria-hidden="true">CH</span><div><p className="eyebrow light">Option chauffeur</p><h2 id="driver-option-title">Vous préférez être accompagné ?</h2><p>Ajoutez un chauffeur à la location de l’Iveco Daily ou du Citroën Jumper.</p></div></div>
        <div className="driver-option-prices"><div><span>Demi-journée</span><strong>+ {driverHalfDay}</strong></div><div><span>Journée complète</span><strong>+ {driverFullDay}</strong></div></div>
        <p className="driver-option-note">Le supplément chauffeur s’ajoute au tarif de location du véhicule choisi.</p>
      </aside>
    </section>
    <section className="rental-practical" aria-labelledby="rental-details-title"><div className="rental-practical-copy"><p className="eyebrow">Informations communes</p><h2 id="rental-details-title">Une location simple et transparente</h2><p>Les mêmes conditions pratiques s’appliquent aux deux véhicules. Contactez-nous pour vérifier leur disponibilité à la date souhaitée.</p><div className="truck-actions"><Link className="button button-primary" href="/devis">Vérifier la disponibilité</Link><a className="button button-whatsapp" href="https://wa.me/41783223368">Demander sur WhatsApp</a></div></div><dl>{sharedDetails.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>
    {service?.rentalConditions&&<section className="rental-conditions"><h2>Conditions de location</h2><p>{service.rentalConditions}</p></section>}
  </PageShell>;
}
