import type {Metadata} from "next";

export const metadata:Metadata={
  title:"Demander un devis gratuit",
  description:"Demandez un devis gratuit à Super-Service pour un déménagement, un nettoyage, une location de camion ou un service à Lausanne.",
  alternates:{canonical:"/devis"},
  openGraph:{title:"Demander un devis | Super-Service",description:"Décrivez votre besoin et recevez une réponse de Super-Service sous 24 h.",url:"/devis"},
};

export default function Layout({children}:{children:React.ReactNode}){return children;}
