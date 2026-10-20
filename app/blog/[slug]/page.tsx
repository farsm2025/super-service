import type {Metadata} from "next";
import Image from "next/image";
import Link from "next/link";
import {notFound} from "next/navigation";
import {Header} from "../../ui/header";
import {Footer} from "../../ui/footer";
import {MobileActions} from "../../ui/mobile-actions";
import {getBlogPost} from "../../../lib/blog";
import {parseBlogMarkdown,sectionId} from "../../../lib/blog-markdown";
import {SITE_URL,absoluteUrl} from "../../../lib/site";

type RouteProps={params:Promise<{slug:string}>};

export async function generateMetadata({params}:RouteProps):Promise<Metadata>{
 const {slug}=await params;
 const post=await getBlogPost(slug);
 if(!post)return {title:"Article introuvable",robots:{index:false,follow:false}};
 return {
   title:post.seoTitle,
   description:post.seoDescription,
   alternates:{canonical:`/blog/${post.slug}`},
   openGraph:{type:"article",title:post.title,description:post.seoDescription,url:`/blog/${post.slug}`,images:[{url:post.image,alt:post.imageAlt}],publishedTime:post.publishedAt},
   twitter:{card:"summary_large_image",title:post.title,description:post.seoDescription,images:[post.image]},
 };
}
export default async function BlogArticle({params}:RouteProps){
 const {slug}=await params;
 const post=await getBlogPost(slug);
 if(!post)notFound();
 const blocks=parseBlogMarkdown(post.body);
 const headings=blocks.flatMap(b=>b.type==="h2"&&b.text!==post.title?[b.text]:[]);
 const publicationDate=new Intl.DateTimeFormat("fr-CH",{day:"numeric",month:"long",year:"numeric",timeZone:"Europe/Zurich"}).format(new Date(post.publishedAt+"T12:00:00Z"));
 const url=`${SITE_URL}/blog/${post.slug}`;
 const schema={"@context":"https://schema.org","@type":"BlogPosting","@id":url+"#article",headline:post.title,description:post.seoDescription,image:absoluteUrl(post.image),datePublished:post.publishedAt,author:{"@type":"Organization",name:"Super-Service",url:SITE_URL},publisher:{"@id":SITE_URL+"/#organization"},mainEntityOfPage:url,inLanguage:"fr-CH"};
 const breadcrumb={"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:[
   {"@type":"ListItem",position:1,name:"Accueil",item:SITE_URL},
   {"@type":"ListItem",position:2,name:"Blog",item:SITE_URL+"/blog"},
   {"@type":"ListItem",position:3,name:post.title,item:url},
 ]};
 return <main>
   <Header/>
   <section className="blog-article-hero">
     <nav className="blog-breadcrumbs" aria-label="Fil d’Ariane"><Link href="/">Accueil</Link><span aria-hidden="true">›</span><Link href="/blog">Blog</Link><span aria-hidden="true">›</span><span aria-current="page">{post.category}</span></nav>
     <p className="eyebrow light">{post.category}</p>
     <h1>{post.title}</h1>
     <p className="blog-hero-intro">{post.excerpt}</p>
     <div className="blog-byline"><span>Par Super-Service</span><span aria-hidden="true">•</span><time dateTime={post.publishedAt}>{publicationDate}</time></div>
   </section>
   <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/>
   <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(breadcrumb)}}/>
   <div className="blog-article-cover"><Image src={post.image} alt={post.imageAlt} fill priority sizes="(max-width:900px) 100vw, 1200px"/></div>
   <div className="blog-article-layout">
     <aside className="blog-toc" aria-label="Sommaire"><h2>Dans cet article</h2><ol>{headings.map(h=><li key={h}><a href={`#${sectionId(h)}`}>{h}</a></li>)}</ol><Link href="/devis" className="blog-toc-cta">Demander un devis →</Link></aside>
     <article className="blog-prose" aria-label={post.title}>
       {blocks.map((block,i)=>{
         if(block.type==="h2")return block.text===post.title?null:<h2 id={sectionId(block.text)} key={i}>{block.text}</h2>;
         if(block.type==="h3")return <h3 key={i}>{block.text}</h3>;
         if(block.type==="paragraph")return <p key={i}>{block.text}</p>;
         const checkList=block.items.every(item=>item.checklist);
         return <ul key={i} className={checkList?"blog-checklist":"blog-list"}>
           {block.items.map((item,j)=><li key={j}>{item.checklist?<span className="blog-check-mark" aria-hidden="true">☐</span>:null}{item.text}</li>)}
         </ul>;
       })}
       <div className="blog-service-links">
         <h2>Services utiles pour votre déménagement</h2>
         <p>Retrouvez les prestations de Super-Service adaptées à votre organisation.</p>
         <div><Link href="/services/demenagement">Déménagement à Lausanne →</Link><Link href="/services/location-camion">Location de camion →</Link><Link href="/services/nettoyage">Nettoyage de fin de bail →</Link><Link href="/services/debarras">Débarras et évacuation →</Link><Link href="/services/montage-de-meubles">Montage de meubles →</Link></div>
         <Link className="button button-primary" href="/devis">Demander votre devis gratuit</Link>
       </div>
       <section className="blog-official-sources" aria-labelledby="sources-title">
         <h2 id="sources-title">Sources officielles utiles</h2>
         <p>Pour les formalités et réglementations évoquées dans l’article, consultez les documents officiels :</p>
         <ul>
           <li><a href="https://www.lausanne.ch/dam/jcr%3A20ebfcd1-f76c-4cd5-a77f-950d05e9d998/B_Bulletin_arriv%C3%A9e_changement_adresse_f%C3%A9vrier_2023.pdf" target="_blank" rel="noopener noreferrer">Ville de Lausanne : annonce d’arrivée et changement d’adresse ↗</a></li>
           <li><a href="https://www.lausanne.ch/dam/jcr%3Acab0ca76-453a-4e53-b762-d39174cfdd02/conditions-generales-electricite-captifs.pdf" target="_blank" rel="noopener noreferrer">Services industriels de Lausanne : conditions de fourniture d’électricité ↗</a></li>
           <li><a href="https://www.lausanne.ch/apps/actualites/Next/serve.php?id=79&amp;kind=recueil" target="_blank" rel="noopener noreferrer">Ville de Lausanne : règlement sur la circulation et le stationnement ↗</a></li>
           <li><a href="https://www.lausanne.ch/apps/actualites/Next/serve.php?id=233&amp;kind=recueil" target="_blank" rel="noopener noreferrer">Ville de Lausanne : gestion des déchets et encombrants ↗</a></li>
         </ul>
       </section>
     </article>
   </div>
   <section className="blog-end-cta"><div><p className="eyebrow light">Contact Super-Service</p><h2>Un déménagement prévu à Lausanne ?</h2><p>Expliquez-nous votre projet, les accès et la date souhaitée. Nous vous aidons à organiser la suite.</p></div><Link href="/devis" className="button button-primary">Demander un devis gratuit</Link></section>
   <Footer/><MobileActions/>
 </main>;
}
