import {defineField, defineType} from "sanity";

export const realization = defineType({
  name: "realization",
  title: "Réalisations",
  type: "document",
  fields: [
    defineField({name: "title", title: "Titre", type: "string", validation: (rule) => rule.required()}),
    defineField({name: "service", title: "Service", type: "string", options: {list: ["Déménagement", "Nettoyage", "Transport", "Montage de meubles", "Débarras", "Petits travaux", "Jardinage", "Multiservices"]}}),
    defineField({name: "city", title: "Commune", type: "string"}),
    defineField({name: "description", title: "Description", type: "text"}),
    defineField({name: "mainImage", title: "Photo principale", type: "seoImage", validation: (rule) => rule.required()}),
    defineField({name: "gallery", title: "Galerie de photos", type: "array", of: [{type: "seoImage"}], options: {layout: "grid"}}),
    defineField({name: "beforeImage", title: "Photo avant", type: "seoImage"}),
    defineField({name: "afterImage", title: "Photo après", type: "seoImage"}),
    defineField({name: "completedAt", title: "Date de réalisation", type: "date"}),
    defineField({name: "featured", title: "Afficher sur la page d’accueil", type: "boolean", initialValue: true}),
    defineField({name: "order", title: "Ordre d’affichage", type: "number", initialValue: 10}),
  ],
  preview: {select: {title: "title", subtitle: "city", media: "mainImage"}},
});
