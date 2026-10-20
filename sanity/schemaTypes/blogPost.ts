import {defineField,defineType} from "sanity";

export const blogPost=defineType({
 name:"blogPost",
 title:"Articles du blog",
 type:"document",
 fields:[
   defineField({name:"title",title:"Titre de l’article",type:"string",validation:rule=>rule.required()}),
   defineField({name:"slug",title:"Adresse de l’article",type:"slug",options:{source:"title",maxLength:96},validation:rule=>rule.required()}),
   defineField({name:"status",title:"Statut",type:"string",options:{list:[{title:"Brouillon",value:"draft"},{title:"Publié",value:"published"}],layout:"radio"},initialValue:"draft",validation:rule=>rule.required()}),
   defineField({name:"category",title:"Catégorie",type:"string",initialValue:"Conseils"}),
   defineField({name:"publishedAt",title:"Date de publication",type:"date",validation:rule=>rule.required()}),
   defineField({name:"excerpt",title:"Résumé pour la liste du blog",type:"text",rows:3,validation:rule=>rule.required()}),
   defineField({name:"coverImage",title:"Image de l’article",type:"seoImage"}),
   defineField({name:"contentMarkdown",title:"Contenu de l’article",description:"Utiliser ## pour les titres principaux, ### pour les sous-titres, - pour une liste et - [ ] pour une checklist.",type:"text",rows:22,validation:rule=>rule.required()}),
   defineField({name:"seoTitle",title:"Titre SEO",type:"string"}),
   defineField({name:"seoDescription",title:"Description SEO",type:"text",rows:3}),
 ],
 preview:{select:{title:"title",subtitle:"status",media:"coverImage"}},
});
