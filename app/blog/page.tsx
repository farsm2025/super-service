import type {Metadata} from "next";
import Image from "next/image";
import Link from "next/link";
import {Header} from "../ui/header";
import {Footer} from "../ui/footer";
import {MobileActions} from "../ui/mobile-actions";
import {getBlogPosts} from "../../lib/blog";
import {SITE_URL} from "../../lib/site";

export const metadata:Metadata={
 title:"Blog : conseils déménagement et nettoyage à Lausanne",
 description:"Conseils pratiques Super-Service pour organiser un déménagement à Lausanne, choisir un camion, préparer ses cartons et réussir son nettoyage de fin de bail.",
 alternates:{canonical:"/blog"},
 openGraph:{title:"Blog et conseils pratiques | Super-Service Lausanne",description:"Guides pratiques pour préparer votre déménagement et votre nettoyage à Lausanne.",url:"/blog",type:"website"},
};

export default async function BlogPage(){
 const posts=await getBlogPosts();
 const breadcrumb={"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:[
   {"@type":"ListItem",position:1,name:"Accueil",item:SITE_URL},
   {"@type":"ListItem",position:2,name:"Blog",item:`${SITE_URL}/blog`}
 ]};
 return <main>
   <Header/>
   <section className="blog-index-hero">
     <nav className="blog-breadcrumbs" aria-label="Fil d’Ariane"><Link href="/">Accueil</Link><span aria-hidden="true">›</span><span aria-current="page">Blog</span></nav>
     <p className="eyebrow light">Guides et conseils</p>
     <h1>Le blog Super-Service</h1>
     <p>Des conseils concrets pour organiser vos déménagements, transports et nettoyages à Lausanne et dans le canton de Vaud.</p>
   </section>
   <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(breadcrumb)}}/>
   <section className="blog-index-section" aria-labelledby="blog-latest-title">
     <div className="blog-section-heading"><p className="eyebrow">Nos conseils</p><h2 id="blog-latest-title">Articles et checklists</h2><p>Des étapes simples pour préparer votre projet et éviter les oublis.</p></div>
     <div className="blog-card-grid">
       {posts.map(post=><article key={post.slug} className="blog-card">
         <Link className="blog-card-image" href={`/blog/${post.slug}`} aria-label={`Lire : ${post.title}`}>
           <Image src={post.image} alt={post.imageAlt} fill sizes="(max-width:680px) 100vw, (max-width:1100px) 50vw, 560px"/>
         </Link>
         <div className="blog-card-body">
           <p className="blog-card-meta"><span>{post.category}</span><span>{new Intl.DateTimeFormat("fr-CH",{day:"numeric",month:"long",year:"numeric"}).format(new Date(post.publishedAt+"T12:00:00"))}</span></p>
           <h3><Link href={`/blog/${post.slug}`}>{post.title}</Link></h3>
           <p>{post.excerpt}</p>
           <Link className="detail-link" href={`/blog/${post.slug}`}>Lire l’article →</Link>
         </div>
       </article>)}
     </div>
   </section>
   <section className="blog-end-cta"><div><p className="eyebrow light">Besoin d’un coup de main ?</p><h2>Organisons votre déménagement ensemble.</h2><p>Une équipe à Lausanne pour le déménagement, la location de camion, le débarras et le nettoyage.</p></div><Link className="button button-primary" href="/devis">Demander un devis gratuit</Link></section>
   <Footer/><MobileActions/>
 </main>;
}
