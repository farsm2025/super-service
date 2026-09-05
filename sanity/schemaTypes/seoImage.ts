import {defineField, defineType} from "sanity";
import {MobileImageInput} from "../components/MobileImageInput";

export const seoImage = defineType({
  name: "seoImage",
  title: "Photo",
  type: "image",
  options: {hotspot: true},
  components: {input: MobileImageInput},
  fields: [
    defineField({name: "alt", title: "Description de l’image pour le SEO", description: "Décrivez ce que montre la photo.", type: "string", validation: (rule) => rule.required().min(5)}),
    defineField({name: "caption", title: "Légende facultative", type: "string"}),
  ],
});
