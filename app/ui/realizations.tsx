import Image from "next/image";
import {getRealizations} from "../../lib/sanity";

const labels:Record<string,string>={demenagement:"Déménagement",nettoyage:"Nettoyage","location-camion":"Location de camion","transport-et-livraison":"Transport et livraison",transport:"Transport et livraison","montage-de-meubles":"Montage de meubles","montage-meubles":"Montage de meubles",debarras:"Débarras","petits-travaux-jardinage":"Petits travaux et jardinage","petits-travaux":"Petits travaux et jardinage",jardinage:"Petits travaux et jardinage",multiservices:"Petits travaux et jardinage"};

export async function Realizations({service,featuredOnly=false}:{service?:string;featuredOnly?:boolean}){
  const items=await getRealizations(service,featuredOnly);
  if(!items.length)return null;
  return <section className="section realizations" id="realisations"><div className="section-heading compact"><p className="eyebrow">Nos réalisations</p><h2>{service?`${labels[service]||"Nos travaux"} en images`:"Découvrez nos dernières interventions"}</h2><p>Des exemples concrets de prestations réalisées à Lausanne et dans le canton de Vaud.</p></div><div className={`realization-grid${items.length===1?" single":""}`}>{items.map(item=><article className="realization-card" key={item._id}>{item.imageUrl&&<div className="realization-image"><Image src={item.imageUrl} alt={item.imageAlt||item.title} fill sizes="(max-width:680px) calc(100vw - 40px), (max-width:1200px) 44vw, 540px"/></div>}<div className="realization-copy"><span className="tag">{labels[item.service]||item.service}</span><h3>{item.title}</h3>{item.description&&<p>{item.description}</p>}{item.city&&<small>{item.city}</small>}</div></article>)}</div></section>;
}
