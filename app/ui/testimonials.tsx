"use client";

import Link from "next/link";
import {useState} from "react";

export type DisplayTestimonial={_id?:string;name:string;text:string;date:string;service:string;rating?:number};

export function Testimonials({items,reviewSent=false}:{items:DisplayTestimonial[];reviewSent?:boolean}){
  const[index,setIndex]=useState(0);
  if(!items.length)return null;
  const visible=[0,1,2].map(offset=>items[(index+offset)%items.length]);
  const average=items.reduce((total,item)=>total+(item.rating||5),0)/items.length;
  return <section className="testimonials" id="avis">
    {reviewSent?<div className="review-notice success" role="status"><strong>Merci, votre avis a bien été envoyé.</strong><span>Consultez maintenant votre e-mail et cliquez sur le lien pour confirmer votre adresse.</span></div>:null}
    <div className="testimonial-head"><div><p className="eyebrow light">Avis clients <span className="reviews-count light">{items.length}</span></p><h2>Leur confiance est notre meilleure référence</h2></div><div className="rating"><strong>{average.toLocaleString("fr-CH",{minimumFractionDigits:1,maximumFractionDigits:1})}</strong><span>★★★★★</span><small>Avis validés par e-mail</small></div></div>
    <div className="testimonial-grid">{visible.map((item,itemIndex)=><article key={item._id||`${item.name}-${item.date}-${itemIndex}`}><div className="stars">{"★".repeat(item.rating||5)}<span className="star-muted">{"★".repeat(5-(item.rating||5))}</span></div><span className="tag">{item.service}</span><blockquote>“{item.text}”</blockquote><footer><strong>{item.name}</strong><span>{item.date}</span></footer></article>)}</div>
    <div className="testimonial-actions"><button onClick={()=>setIndex((index-1+items.length)%items.length)} aria-label="Avis précédents">←</button><button onClick={()=>setIndex((index+1)%items.length)} aria-label="Avis suivants">→</button><div className="review-links"><Link className="button button-white" href="/avis">Voir les {items.length} avis</Link><Link className="button button-primary" href="/avis#donner-avis">Donner votre avis</Link></div></div>
  </section>;
}
