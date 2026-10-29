import {articleMarkdown} from "./blog-content";
import {nettoyageArticleMarkdown} from "./blog-content-nettoyage";
import {sanityClient} from "./sanity";

export type BlogPost={
 slug:string;
 title:string;
 excerpt:string;
 publishedAt:string;
 updatedAt?:string;
 category:string;
 image:string;
 imageAlt:string;
 seoTitle:string;
 seoDescription:string;
 body:string;
};

export const originalBlogPost:BlogPost={
 slug:"checklist-demenagement-lausanne",
 title:"Checklist ultime pour un déménagement sans stress à Lausanne",
 excerpt:"Du choix du camion à l’état des lieux : une checklist étape par étape pour organiser votre déménagement à Lausanne et maîtriser votre budget.",
 publishedAt:"2026-10-20",
 updatedAt:"2026-10-20",
 category:"Conseils déménagement",
 image:"/images/demenagement/equipe-demenagement-lausanne.webp",
 imageAlt:"Équipe de déménagement Super-Service transportant des cartons à Lausanne",
 seoTitle:"Checklist déménagement Lausanne : les étapes sans stress",
 seoDescription:"Checklist déménagement à Lausanne : dates, cartons, stationnement, démarches administratives, nettoyage de fin de bail et conseils pour maîtriser le budget.",
 body:articleMarkdown,
};

export const nettoyageBlogPost:BlogPost={
 slug:"checklist-nettoyage-fin-de-bail-lausanne",
 title:"Checklist nettoyage fin de bail : les points vérifiés par les régies",
 excerpt:"Cuisine, salle de bains, vitres, stores et état des lieux : la checklist pièce par pièce pour rendre un logement propre à Lausanne et dans le canton de Vaud.",
 publishedAt:"2026-10-20",
 updatedAt:"2026-10-20",
 category:"Conseils nettoyage",
 image:"/images/nettoyage/agent-nettoyage-super-service-vaud.webp",
 imageAlt:"Agent de nettoyage Super-Service intervenant dans le canton de Vaud",
 seoTitle:"Checklist nettoyage fin de bail à Lausanne",
 seoDescription:"Nettoyage de fin de bail à Lausanne : checklist pièce par pièce, points contrôlés à l’état des lieux, usure normale, régies et conseils pratiques.",
 body:nettoyageArticleMarkdown,
};

type CmsPost=Omit<BlogPost,"image"|"imageAlt"|"body"> & {image?:string;imageAlt?:string;body?:string};

export async function getBlogPosts():Promise<BlogPost[]>{
 let cms:CmsPost[]=[];
 try{
   cms=await sanityClient.fetch<CmsPost[]>(`*[_type=="blogPost" && status=="published" && defined(slug.current) && defined(contentMarkdown) && defined(publishedAt) && publishedAt <= now()] | order(publishedAt desc){
     title,"slug":slug.current,excerpt,publishedAt,"updatedAt":_updatedAt,category,seoTitle,seoDescription,
     "image":coverImage.asset->url,"imageAlt":coverImage.alt,"body":contentMarkdown
   }`,{},{next:{revalidate:60}});
 }catch(error){console.error("Blog Sanity: impossible de charger les articles",error)}
 const merged=new Map<string,BlogPost>([[originalBlogPost.slug,originalBlogPost],[nettoyageBlogPost.slug,nettoyageBlogPost]]);
 for(const item of cms){
   if(!item.slug||!item.title||!item.body)continue;
   const existing=merged.get(item.slug);
   merged.set(item.slug,{
     slug:item.slug,title:item.title,
     publishedAt:item.publishedAt,
     updatedAt:item.updatedAt||item.publishedAt,
     excerpt:item.excerpt||item.title,
     category:item.category||"Conseils",
     seoTitle:item.seoTitle||item.title,
     seoDescription:item.seoDescription||item.excerpt||item.title,
     image:item.image||existing?.image||originalBlogPost.image,
     imageAlt:item.imageAlt||item.title,
     body:item.body,
   });
 }
 return [...merged.values()].sort((a,b)=>b.publishedAt.localeCompare(a.publishedAt));
}
export async function getBlogPost(slug:string):Promise<BlogPost|undefined>{
 return (await getBlogPosts()).find(item=>item.slug===slug);
}
