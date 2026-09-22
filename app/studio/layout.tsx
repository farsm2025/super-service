import type {Metadata} from "next";

export const metadata:Metadata={
  title:"Super-Service Studio",
  description:"Gestion des photos et du contenu du site Super-Service.",
  manifest:"/studio/manifest.webmanifest",
  icons:{
    icon:[{url:"/studio-icon.svg",type:"image/svg+xml"}],
    shortcut:"/studio-icon.svg",
    apple:[{url:"/studio-icon.svg"}],
  },
  appleWebApp:{
    capable:true,
    title:"Super-Service Studio",
    statusBarStyle:"default",
  },
  robots:{index:false,follow:false},
};

export default function StudioLayout({children}:{children:React.ReactNode}){
  return children;
}
