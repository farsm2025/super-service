import type {MetadataRoute} from "next";
import {SITE_URL} from "../lib/site";
import {getBlogPosts} from "../lib/blog";

// Dates des dernières modifications connues du contenu des pages (historique GitHub).
// Les actualiser seulement lorsqu'une page change réellement, pas à chaque build Vercel.
// Les changements de présentation commune sans modification substantielle du contenu
// ne justifient pas de modifier toutes les dates.
const pageLastModified:Record<string,string>={
  "/":"2026-10-29",
  "/services":"2026-10-29",
  "/services/demenagement":"2026-10-29",
  "/services/nettoyage":"2026-10-21",
  "/services/location-camion":"2026-10-20",
  "/services/transport-et-livraison":"2026-10-18",
  "/services/montage-de-meubles":"2026-10-18",
  "/services/debarras":"2026-10-18",
  "/services/petits-travaux-jardinage":"2026-10-18",
  "/services/cartons-demenagement":"2026-09-22",
  "/avis":"2026-08-26",
  "/blog":"2026-10-20",
  "/devis":"2026-09-22",
  "/rendez-vous":"2026-08-27",
  "/mentions-legales":"2026-09-29",
  "/confidentialite":"2026-08-26",
};

export default async function sitemap():Promise<MetadataRoute.Sitemap>{
  const posts=await getBlogPosts();
  const pages=Object.entries(pageLastModified).map(([path,lastModified])=>({
    url:SITE_URL+(path==="/"? "":path),
    lastModified,
  }));
  const articles=posts.map(post=>({
    url:`${SITE_URL}/blog/${post.slug}`,
    lastModified:post.updatedAt||post.publishedAt,
  }));
  return [...pages,...articles];
}
