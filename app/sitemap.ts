import type { MetadataRoute } from "next";

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
  const base = "https://www.super-service.ch";
  const pages = [
    "",
    ...servicePages,
    "/avis",
    "/devis",
    "/mentions-legales",
    "/confidentialite",
  ];

  return pages.map((url, index) => ({
    url: base + url,
    lastModified: new Date(),
    changeFrequency: (index <= servicePages.length ? "monthly" : "yearly") as
      | "monthly"
      | "yearly",
    priority: index === 0 ? 1 : index <= servicePages.length ? 0.85 : 0.5,
  }));
}
