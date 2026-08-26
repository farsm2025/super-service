import Link from "next/link";
import {testimonials} from "../data/testimonials";
import {Footer} from "../ui/footer";
import {Header} from "../ui/header";
import {MobileActions} from "../ui/mobile-actions";
import {getPublishedTestimonials} from "../../lib/sanity";
import {ReviewForm} from "./review-form";

type SearchParams=Promise<Record<string,string|string[]|undefined>>;

export default async function AvisPage({searchParams}:{searchParams:SearchParams}){
  const params=await searchParams;
  const validation=typeof params.validation==="string"?params.validation:"";
  const published=await getPublishedTestimonials();
  const items=[...published,...testimonials.map((item,index)=>({...item,_id:`legacy-${index}`,rating:5}))];
  return <main><Header reviewCount={items.length}/><section className="inner-hero short"><p className="eyebrow light">Témoignages</p><h1>Ce que nos clients disent de Super-Service</h1><p>Des expériences réelles de déménagement, nettoyage, montage et transport à Lausanne et dans le canton de Vaud.</p></section>{validation?<div className={`review-page-notice ${validation==="ok"?"success":"error"}`} role="status">{validation==="ok"?<><strong>Votre adresse e-mail est confirmée.</strong><span>Merci ! Votre avis a été transmis à Super-Service pour validation avant publication.</span></>:<><strong>Ce lien n’a pas pu être validé.</strong><span>Il est peut-être expiré ou a déjà été utilisé. Vous pouvez envoyer un nouvel avis.</span></>}</div>:null}<section className="reviews-page"><div className="all-reviews">{items.map((item)=><article key={item._id}><div className="stars">{"★".repeat(item.rating)}<span className="star-muted">{"★".repeat(5-item.rating)}</span></div><span className="tag">{item.service}</span><blockquote>“{item.text}”</blockquote><strong>{item.name}</strong><small>{item.date}</small></article>)}</div><ReviewForm/></section><div className="back-home"><Link href="/">← Retour à l’accueil</Link></div><Footer/><MobileActions/></main>;
}
