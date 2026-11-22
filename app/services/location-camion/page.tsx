import type {Metadata} from "next";
import Image from "next/image";
import Link from "next/link";
import {PageShell} from "../../ui/page-shell";
import {Icon} from "../../ui/icons";
import {getServiceBySlug, type RentalVehicle} from "../../../lib/sanity";
import {Realizations} from "../../ui/realizations";

export function generateMetadata():Metadata{
  const title="Location de camions avec ou sans chauffeur à Lausanne";
  const description="Location de trois camions avec ou sans chauffeur à Lausanne : Iveco Daily 17 m³, Citroën Jumper 20 m³ avec hayon et Renault Maxity 20 m³. Demi-journée avec 300 km inclus ou journée avec 600 km inclus.";
  return {title,description,alternates:{canonical:"/services/location-camion"},openGraph:{title,description,images:[{url:"/images/location-camion/citroen-jumper-exterieur.webp",width:1600,height:1200,alt:"Camions de location avec ou sans chauffeur à Lausanne"}]}};
}

type VehiclePresentation=RentalVehicle&{
  vehicleId:"iveco"|"citroen"|"renault";
  images:Array<{src:string;alt:string;caption:string}>;
};

const defaultVehicles:VehiclePresentation[]=[
  {
    vehicleId:"iveco",
    name:"Grand fourgon Iveco Daily",
    volume:"17 m³",
    feature:"Pratique pour les meubles, cartons et objets volumineux",
    halfDayPrice:"CHF 80.–",
    fullDayPrice:"CHF 160.–",
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
    halfDayPrice:"CHF 100.–",
    fullDayPrice:"CHF 200.–",
    images:[
      {src:"/images/location-camion/citroen-jumper-exterieur.webp",alt:"Citroën Jumper de 20 m³ avec hayon à louer à Lausanne",caption:"Citroën Jumper – caisse de 20 m³"},
      {src:"/images/location-camion/citroen-jumper-hayon.webp",alt:"Hayon et espace de chargement du Citroën Jumper de 20 m³",caption:"Espace de chargement avec hayon"},
    ],
  },
  {
    vehicleId:"renault",
    name:"Renault Maxity – caisse de 20 m³",
    volume:"20 m³",
    feature:"Caisse grand volume adaptée aux déménagements",
    halfDayPrice:"CHF 100.–",
    fullDayPrice:"CHF 200.–",
    images:[
      {src:"/images/location-camion/renault-maxity-20m3.webp",alt:"Renault Maxity avec caisse de 20 m³ à louer à Lausanne",caption:"Renault Maxity – caisse de 20 m³"},
      {src:"/images/location-camion/renault-maxity-20m3-side.webp",alt:"Renault Maxity 20 m³ en vue latérale à louer à Lausanne",caption:"Renault Maxity – vue latérale"},
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
  const sharedDetails=[
    ["Permis nécessaire",service?.licenseRequired||"Permis catégorie B pour conduire vous-même"],
    ["Caution","CHF 150.– par véhicule"],
    ["Kilométrage","Selon le véhicule et la formule choisie (voir tarifs ci-dessus)"],
    ["Prise en charge et restitution",service?.pickupLocation||"Rue du Clos-de-Bulle 5, 1004 Lausanne"],
  ];
  return <PageShell eyebrow="Avec ou sans chauffeur" breadcrumbLabel="Location de camion" title="Location de trois camions à Lausanne" intro="Choisissez le véhicule adapté à votre déménagement ou à votre transport : conduisez-le vous-même ou ajoutez un chauffeur au tarif de CHF 30.– par heure.">
    <section className="rental-fleet" aria-labelledby="fleet-title">
      <div className="section-heading compact"><p className="eyebrow">Trois véhicules disponibles</p><h2 id="fleet-title">Choisissez le volume adapté à votre besoin</h2><p>Comparez les trois véhicules, leurs équipements et leurs tarifs de location.</p></div>
      <div className="rental-vehicle-grid">
        {vehicles.map((vehicle)=><article className="rental-vehicle-card" key={vehicle.vehicleId}>
          <header className="rental-vehicle-head"><div><p className="eyebrow">Tarif du véhicule</p><h3>{vehicle.name}</h3><p>{vehicle.feature}</p></div><strong className="volume-badge">{vehicle.volume}</strong></header>
          <div className="rental-vehicle-gallery">
            {vehicle.images.map((image,index)=><figure key={image.src}><div className="rental-vehicle-photo"><Image src={image.src} alt={image.alt} fill priority={vehicle.vehicleId==="iveco"&&index===0} sizes="(max-width:680px) 100vw,(max-width:1100px) 50vw,300px"/></div><figcaption>{image.caption}</figcaption></figure>)}
          </div>
          <div className="rental-prices" aria-label={`Tarifs sans chauffeur pour ${vehicle.name}`}>
            <div>
              <span>Demi-journée (6 h)</span>
              <strong>{vehicle.vehicleId==="iveco"?"CHF 80.–":"CHF 100.–"}</strong>
              <small className="rental-mileage">300 km inclus</small>
              <div className="rental-unlimited"><span>Kilométrage illimité</span><strong>Sur demande</strong></div>
            </div>
            <div className="featured-price">
              <span>Journée (12 h)</span>
              <strong>{vehicle.vehicleId==="iveco"?"CHF 160.–":"CHF 200.–"}</strong>
              <small className="rental-mileage">600 km inclus</small>
              <div className="rental-unlimited"><span>Kilométrage illimité</span><strong>Sur demande</strong></div>
            </div>
          </div>
          <p className="rental-base-note">Tarifs du camion sans chauffeur</p>
          <Link className="button button-primary" href="/devis">Réserver avec ou sans chauffeur</Link>
        </article>)}
      </div>
      <aside className="driver-option" aria-labelledby="driver-option-title">
        <div className="driver-option-copy"><span className="driver-option-icon"><Icon name="driver"/></span><div><p className="eyebrow light">Option chauffeur</p><h2 id="driver-option-title">Vous préférez être accompagné ?</h2><p>Ajoutez un chauffeur à la location de l’Iveco Daily, du Citroën Jumper ou du Renault Maxity.</p></div></div>
        <div className="driver-option-prices"><div><span>Tarif chauffeur</span><strong>+ CHF 30.– / heure</strong></div></div>
        <p className="driver-option-note">Le supplément chauffeur s’ajoute au tarif de location du véhicule choisi.</p>
      </aside>
    </section>
    <section className="rental-practical" aria-labelledby="rental-details-title"><div className="rental-practical-copy"><p className="eyebrow">Informations communes</p><h2 id="rental-details-title">Une location simple et transparente</h2><p>Les mêmes conditions pratiques s’appliquent aux trois véhicules. Pour une prestation complète, découvrez aussi notre <Link className="contextual-link" href="/services/demenagement">service de déménagement</Link> ou notre <Link className="contextual-link" href="/services/transport-et-livraison">transport et livraison</Link>. Contactez-nous pour vérifier la disponibilité du camion à la date souhaitée.</p><div className="truck-actions"><Link className="button button-primary" href="/devis">Vérifier la disponibilité</Link><a className="button button-whatsapp" href="https://wa.me/41783223368">Demander sur WhatsApp</a></div></div><dl>{sharedDetails.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>
    {service?.rentalConditions&&<section className="rental-conditions"><h2>Conditions de location</h2><p>{service.rentalConditions}</p></section>}
    <Realizations service="location-camion" />
  </PageShell>;
}
