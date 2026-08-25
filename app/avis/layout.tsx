import type {Metadata} from "next";

export const metadata:Metadata={
  title:"Avis clients",
  description:"Découvrez les avis des clients de Super-Service pour le déménagement, le nettoyage, le montage et le transport à Lausanne.",
  alternates:{canonical:"/avis"},
  openGraph:{title:"Avis clients | Super-Service",description:"Les expériences des clients de Super-Service à Lausanne et dans le canton de Vaud.",url:"/avis"},
};

export default function Layout({children}:{children:React.ReactNode}){return children;}
