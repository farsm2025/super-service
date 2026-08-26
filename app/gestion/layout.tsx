import type {Metadata} from "next";
import "./gestion.css";
import "./availability-actions.css";
export const metadata:Metadata={title:"Gestion des rendez-vous",robots:{index:false,follow:false},themeColor:"#10263b"};
export default function GestionLayout({children}:{children:React.ReactNode}){return children}
