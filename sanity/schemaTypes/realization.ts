import {defineField, defineType} from "sanity";

export const realization = defineType({
  name: "realization",
  title: "Réalisations",
  type: "document",
  fields: [
    defineField({name: "title", title: "Titre", type: "string", validation: (rule) => rule.required()}),
    defineField({name: "service", title: "Service dans lequel afficher la publication", description: "Choisissez la rubrique du site où cette réalisation doit apparaître.", type: "string", options: {list: [{title:"Déménagement",value:"demenagement"},{title:"Nettoyage",value:"nettoyage"},{title:"Transport et livraison",value:"transport"},{title:"Montage de meubles",value:"montage-meubles"},{title:"Débarras",value:"debarras"},{title:"Petits travaux",value:"petits-travaux"},{title:"Jardinage",value:"jardinage"},{title:"Multiservices",value:"multiservices"}], layout: "dropdown"}, validation: (rule) => rule.required()}),
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
