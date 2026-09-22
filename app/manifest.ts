import type {MetadataRoute} from "next";
export default function manifest():MetadataRoute.Manifest{return{name:"Super-Service Rendez-vous",short_name:"Super-Service",description:"Gestion des rendez-vous Super-Service",start_url:"/gestion",display:"standalone",background_color:"#f5f7f8",theme_color:"#10263b",icons:[{src:"/favicon.svg",sizes:"any",type:"image/svg+xml",purpose:"any"}]}}
