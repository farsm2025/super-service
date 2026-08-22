import {defineField, defineType} from "sanity";

export const service = defineType({
  name: "service",
  title: "Services",
  type: "document",
  fields: [
    defineField({name: "title", title: "Titre", type: "string", validation: (rule) => rule.required()}),
    defineField({name: "slug", title: "Adresse", type: "slug", options: {source: "title"}}),
    defineField({name: "description", title: "Description", type: "text"}),
    defineField({name: "mainImage", title: "Photo principale", type: "seoImage"}),
    defineField({name: "gallery", title: "Galerie de photos", type: "array", of: [{type: "seoImage"}], options: {layout: "grid"}}),
    defineField({name: "seoTitle", title: "Titre SEO", type: "string"}),
    defineField({name: "seoDescription", title: "Meta description", type: "text"}),
    defineField({name: "order", title: "Ordre", type: "number"}),
  ],
});
