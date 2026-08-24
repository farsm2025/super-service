import {defineField, defineType} from "sanity";

export const service = defineType({
  name: "service",
  title: "Services",
  type: "document",
  fieldsets: [{name: "rental", title: "Informations de location du camion", options: {collapsible: true, collapsed: false}}],
  fields: [
    defineField({name: "title", title: "Titre", type: "string", validation: (rule) => rule.required()}),
    defineField({name: "slug", title: "Adresse", type: "slug", options: {source: "title"}}),
    defineField({name: "description", title: "Description", type: "text"}),
    defineField({name: "mainImage", title: "Photo principale", type: "seoImage"}),
    defineField({name: "gallery", title: "Galerie de photos", type: "array", of: [{type: "seoImage"}], options: {layout: "grid"}}),
    defineField({name: "seoTitle", title: "Titre SEO", type: "string"}),
    defineField({name: "seoDescription", title: "Meta description", type: "text"}),
    defineField({name: "rentalVehicles", title: "Véhicules disponibles", type: "array", fieldset: "rental", of: [{type: "object", name: "rentalVehicle", title: "Véhicule", fields: [
      defineField({name: "vehicleId", title: "Véhicule", type: "string", options: {list: [{title: "Iveco Daily", value: "iveco"}, {title: "Citroën Jumper", value: "citroen"}], layout: "dropdown"}, validation: (rule) => rule.required()}),
      defineField({name: "name", title: "Nom affiché", type: "string"}),
      defineField({name: "volume", title: "Volume", type: "string"}),
      defineField({name: "feature", title: "Description courte", type: "string"}),
      defineField({name: "halfDayPrice", title: "Tarif demi-journée", type: "string"}),
      defineField({name: "fullDayPrice", title: "Tarif journée complète", type: "string"}),
    ]}]}),
    defineField({name: "licenseRequired", title: "Permis nécessaire", type: "string", fieldset: "rental"}),
    defineField({name: "includedMileage", title: "Kilométrage inclus", type: "string", fieldset: "rental"}),
    defineField({name: "deposit", title: "Caution", type: "string", fieldset: "rental"}),
    defineField({name: "pickupLocation", title: "Lieu de prise en charge et restitution", type: "string", fieldset: "rental"}),
    defineField({name: "rentalConditions", title: "Conditions de location", type: "text", rows: 5, fieldset: "rental"}),
    defineField({name: "order", title: "Ordre", type: "number"}),
  ],
});
