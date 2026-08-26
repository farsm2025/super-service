import {defineField, defineType} from "sanity";

export const realization = defineType({
  name: "realization",
  title: "Photos des services",
  type: "document",
  fields: [
    defineField({name: "title", title: "Titre de la photo", description: "Exemple : Déménagement d’un appartement à Lausanne", type: "string", validation: (rule) => rule.required()}),
    defineField({name: "service", title: "Page du service", description: "Choisissez la page où la photo doit apparaître. Ce choix est indépendant de l’option d’affichage sur l’accueil.", type: "string", options: {list: [{title:"Déménagement",value:"demenagement"},{title:"Nettoyage",value:"nettoyage"},{title:"Location de camion",value:"location-camion"},{title:"Transport et livraison",value:"transport-et-livraison"},{title:"Montage de meubles",value:"montage-de-meubles"},{title:"Débarras",value:"debarras"},{title:"Petits travaux et jardinage",value:"petits-travaux-jardinage"}], layout: "dropdown"}, validation: (rule) => rule.required()}),
    defineField({name: "city", title: "Commune", type: "string"}),
    defineField({name: "description", title: "Description facultative", description: "Une courte phrase affichée sous la photo.", type: "text", rows: 3}),
    defineField({name: "mainImage", title: "Photo", description: "Ajoutez une photo nette. Le site l’affichera automatiquement au format 4:3, sans la déformer.", type: "seoImage", validation: (rule) => rule.required()}),
    defineField({name: "completedAt", title: "Date de réalisation", type: "date"}),
    defineField({name: "featured", title: "Afficher aussi sur la page d’accueil", description: "Activez cette option pour ajouter la photo aux travaux réalisés de l’accueil. Elle restera également visible sur la page du service choisie.", type: "boolean", initialValue: false}),
    defineField({name: "order", title: "Ordre d’affichage", type: "number", initialValue: 10}),
  ],
  preview: {
    select: {title: "title", service: "service", city: "city", media: "mainImage"},
    prepare({title, service, city, media}) {
      const serviceLabels: Record<string, string> = {
        demenagement: "Déménagement",
        nettoyage: "Nettoyage",
        "location-camion": "Location de camion",
        "transport-et-livraison": "Transport et livraison",
        transport: "Transport et livraison",
        "montage-de-meubles": "Montage de meubles",
        "montage-meubles": "Montage de meubles",
        debarras: "Débarras",
        "petits-travaux-jardinage": "Petits travaux et jardinage",
        "petits-travaux": "Petits travaux et jardinage",
        jardinage: "Petits travaux et jardinage",
        multiservices: "Petits travaux et jardinage",
      };

      return {
        title,
        subtitle: [serviceLabels[service] || service, city].filter(Boolean).join(" · "),
        media,
      };
    },
  },
});
