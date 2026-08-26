import Link from "next/link";
import {Footer} from "../../ui/footer";
import {Header} from "../../ui/header";
import {getReviewForModeration,ReviewAction,verifyModerationLink} from "../../../lib/reviews";

export const dynamic="force-dynamic";

const actionLabels:Record<ReviewAction,{title:string;button:string;description:string}>={
  published:{title:"Publier cet avis",button:"Confirmer la publication",description:"L’avis apparaîtra sur le site et restera modifiable dans Sanity."},
  rejected:{title:"Rejeter cet avis",button:"Confirmer le rejet",description:"L’avis ne sera pas affiché sur le site et restera conservé dans Sanity."},
  hidden:{title:"Masquer cet avis",button:"Confirmer le masquage",description:"L’avis sera conservé dans Sanity, mais ne sera pas visible sur le site."},
};

const resultMessages:Record<string,string>={
  published:"L’avis est publié et peut maintenant apparaître sur le site.",
  rejected:"L’avis a été rejeté et ne sera pas affiché.",
  hidden:"L’avis est désormais masqué sur le site.",
  invalid:"Ce lien est invalide ou a expiré. Vous pouvez toujours gérer l’avis dans Sanity Studio.",
  error:"La mise à jour n’a pas abouti. Réessayez ou gérez l’avis dans Sanity Studio.",
};

type SearchParams=Promise<Record<string,string|string[]|undefined>>;

export default async function ModerateReviewPage({searchParams}:{searchParams:SearchParams}){
  const params=await searchParams;
  const result=typeof params.result==="string"?params.result:"";
  if(result){
    return <main><Header/><section className="moderation-page"><div className={`moderation-card ${result==="published"?"success":""}`}><p className="eyebrow">Gestion des avis</p><h1>Décision enregistrée</h1><p>{resultMessages[result]||resultMessages.error}</p><div className="moderation-actions"><Link className="button button-primary" href="/">Voir le site</Link><Link className="button button-outline" href="/studio/structure/testimonial">Ouvrir Sanity Studio</Link></div></div></section><Footer/></main>;
  }

  const reviewId=typeof params.review==="string"?params.review:"";
  const action=typeof params.action==="string"?params.action:"";
  const expires=typeof params.expires==="string"?params.expires:"";
  const signature=typeof params.signature==="string"?params.signature:"";
  const valid=await verifyModerationLink(reviewId,action,expires,signature).catch(()=>false);
  const review=valid?await getReviewForModeration(reviewId).catch(()=>null):null;
  const details=action in actionLabels?actionLabels[action as ReviewAction]:null;

  if(!valid||!review||!details){
    return <main><Header/><section className="moderation-page"><div className="moderation-card"><p className="eyebrow">Gestion des avis</p><h1>Lien invalide ou expiré</h1><p>Cette action ne peut plus être confirmée depuis l’e-mail. L’avis reste accessible dans Sanity Studio.</p><div className="moderation-actions"><Link className="button button-primary" href="/studio/structure/testimonial">Ouvrir Sanity Studio</Link></div></div></section><Footer/></main>;
  }

  return <main><Header/><section className="moderation-page"><div className="moderation-card"><p className="eyebrow">Décision administrateur</p><h1>{details.title}</h1><div className="moderation-review"><div className="stars">{"★".repeat(review.rating||5)}</div><span className="tag">{review.service}</span><blockquote>“{review.comment}”</blockquote><strong>{review.name}</strong></div><p>{details.description}</p><form action="/api/avis/moderer" method="post"><input type="hidden" name="review" value={reviewId}/><input type="hidden" name="action" value={action}/><input type="hidden" name="expires" value={expires}/><input type="hidden" name="signature" value={signature}/><button className="button button-primary" type="submit">{details.button}</button><Link className="button button-outline" href="/studio/structure/testimonial">Annuler et ouvrir Sanity</Link></form></div></section><Footer/></main>;
}
