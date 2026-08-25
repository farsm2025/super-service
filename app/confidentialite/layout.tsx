import type {Metadata} from "next";

export const metadata:Metadata={title:"Politique de confidentialité",description:"Informations sur la collecte, l’utilisation et la protection des données personnelles par Super-Service.",alternates:{canonical:"/confidentialite"},openGraph:{title:"Politique de confidentialité | Super-Service",description:"Informations sur la collecte, l’utilisation et la protection des données personnelles par Super-Service.",url:"/confidentialite"}};

export default function Layout({children}:{children:React.ReactNode}){return children;}
