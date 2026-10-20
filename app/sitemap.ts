import type { MetadataRoute } from "next";
import { SITE_URL } from "../lib/site";
import {getBlogPosts} from "../lib/blog";

const servicePages = [
  "/services/demenagement",
  "/services/nettoyage",
  "/services/location-camion",
  "/services/transport-et-livraison",
  "/services/montage-de-meubles",
  "/services/debarras",
  "/services/petits-travaux-jardinage",
  "/services/cartons-demenagement",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogPosts = await getBlogPosts();
  const pages = [
    "",
    "/services",
    ...servicePages,
    "/avis",
    "/blog",
    "/devis",
    "/rendez-vous",
    "/mentions-legales",
    "/confidentialite",
  ];

  const basePages = pages.map((url, index) => ({
    url: SITE_URL + url,
    lastModified: new Date(),
    changeFrequency: (index <= servicePages.length ? "monthly" : "yearly") as
      | "monthly"
      | "yearly",
    priority: index === 0 ? 1 : index <= servicePages.length ? 0.85 : 0.5,
  }));
  return [...basePages, ...blogPosts.map(post=>({
    url: SITE_URL + "/blog/" + post.slug,
    lastModified: new Date(post.publishedAt + "T12:00:00Z"),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))];
}
