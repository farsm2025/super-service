import {defineField, defineType} from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Paramètres du site",
  type: "document",
  fields: [
    defineField({name: "companyName", title: "Nom de l’entreprise", type: "string", initialValue: "Super-Service", validation: (rule) => rule.required()}),
    defineField({name: "email", title: "Adresse e-mail", type: "email", initialValue: "info@super-service.ch", validation: (rule) => rule.required()}),
    defineField({name: "phoneDisplay", title: "Téléphone affiché", type: "string", initialValue: "+41 78 322 33 68", validation: (rule) => rule.required()}),
    defineField({name: "phoneLink", title: "Téléphone pour les liens", description: "Format international sans espace, par exemple +41783223368", type: "string", initialValue: "+41783223368", validation: (rule) => rule.required()}),
    defineField({name: "whatsapp", title: "Numéro WhatsApp", description: "Format international sans + ni espace, par exemple 41783223368", type: "string", initialValue: "41783223368", validation: (rule) => rule.required()}),
    defineField({name: "street", title: "Rue et numéro", type: "string", initialValue: "Rue du Clos-de-Bulle 5", validation: (rule) => rule.required()}),
    defineField({name: "postalCode", title: "Code postal", type: "string", initialValue: "1004", validation: (rule) => rule.required()}),
    defineField({name: "city", title: "Ville", type: "string", initialValue: "Lausanne", validation: (rule) => rule.required()}),
    defineField({name: "websiteUrl", title: "Adresse du site internet", type: "url", initialValue: "https://www.super-service.ch", validation: (rule) => rule.required()}),
    defineField({name: "quoteDelay", title: "Délai annoncé pour les devis", type: "string", initialValue: "24 h"}),
  ],
  preview: {prepare: () => ({title: "Coordonnées et réglages généraux"})},
});
