import type { MetadataRoute } from "next";
import { SITE_URL } from "../lib/site";

const servicePages = [
  "/services/demenagement",
  "/services/nettoyage",
  "/services/location-camion",
  "/services/transport-et-livraison",
  "/services/montage-de-meubles",
  "/services/debarras",
  "/services/petits-travaux-jardinage",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    "",
    "/services",
    ...servicePages,
    "/avis",
    "/devis",
    "/rendez-vous",
    "/mentions-legales",
    "/confidentialite",
  ];

  return pages.map((url, index) => ({
    url: SITE_URL + url,
    lastModified: new Date(),
    changeFrequency: (index <= servicePages.length ? "monthly" : "yearly") as
      | "monthly"
      | "yearly",
    priority: index === 0 ? 1 : index <= servicePages.length ? 0.85 : 0.5,
  }));
}
