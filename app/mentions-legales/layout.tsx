import type {Metadata} from "next";

export const metadata:Metadata={title:"Mentions légales",description:"Mentions légales et coordonnées de Super-Service à Lausanne.",alternates:{canonical:"/mentions-legales"},openGraph:{title:"Mentions légales | Super-Service",description:"Mentions légales et coordonnées de Super-Service à Lausanne.",url:"/mentions-legales"}};

export default function Layout({children}:{children:React.ReactNode}){return children;}
