import type {Metadata} from "next";

export const metadata:Metadata={
  title:"Gestion d’un avis | Super-Service",
  robots:{index:false,follow:false,noarchive:true},
  referrer:"no-referrer",
};

export default function ModerationLayout({children}:{children:React.ReactNode}){return children}
