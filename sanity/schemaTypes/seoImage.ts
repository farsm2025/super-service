import {defineField, defineType} from "sanity";

export const seoImage = defineType({
  name: "seoImage",
  title: "Photo",
  type: "image",
  options: {hotspot: true},
  fields: [
    defineField({name: "alt", title: "Description de l’image pour le SEO", description: "Décrivez ce que montre la photo.", type: "string", validation: (rule) => rule.required().min(5)}),
    defineField({name: "caption", title: "Légende facultative", type: "string"}),
  ],
});
