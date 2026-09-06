import type {Metadata} from "next";
import {FinDeMissionForm} from "./form";

export const metadata:Metadata={
  title:"Fin de mission – Super-Service",
  robots:{index:false,follow:false},
};

export default function FinDeMissionPage(){
  return <FinDeMissionForm/>;
}
