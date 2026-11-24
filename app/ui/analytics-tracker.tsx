"use client";
import {useEffect,useState} from "react";
import {usePathname} from "next/navigation";

const MEASUREMENT_ID=process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID||"";
export const ANALYTICS_CONSENT_KEY="super-service-analytics-consent-v1";
export const ANALYTICS_CONSENT_EVENT="super-service-analytics-consent-changed";
type Gtag=(...args:unknown[])=>void;
declare global {
  interface Window {gtag?:Gtag;dataLayer?:unknown[][]}
}
const blockedPath=(path:string)=>path==="/gestion"||path.startsWith("/gestion/")||path==="/studio"||path.startsWith("/studio/")||path==="/api"||path.startsWith("/api/");
function hasConsent(){
  try{return window.localStorage.getItem(ANALYTICS_CONSENT_KEY)==="accepted"}catch{return false}
}
function enableGA4(){
  if(!MEASUREMENT_ID||!/^G-[A-Z0-9]+$/.test(MEASUREMENT_ID)||window.gtag)return;
  window.dataLayer=window.dataLayer||[];
  window.gtag=(...args:unknown[])=>{window.dataLayer?.push(args)};
  window.gtag("consent","default",{analytics_storage:"granted",ad_storage:"denied",ad_user_data:"denied",ad_personalization:"denied"});
  window.gtag("js",new Date());
  window.gtag("config",MEASUREMENT_ID,{send_page_view:false});
  const script=document.createElement("script");
  script.async=true;
  script.src="https://www.googletagmanager.com/gtag/js?id="+encodeURIComponent(MEASUREMENT_ID);
  document.head.appendChild(script);
}
export function trackPublicConversion(eventName:"generate_lead"|"appointment_request",parameters:Record<string,string>){
  if(!hasConsent()||blockedPath(window.location.pathname)||!window.gtag||!MEASUREMENT_ID)return;
  // Aucun nom, téléphone, adresse e-mail, adresse postale ou message client dans GA4.
  window.gtag("event",eventName,{...parameters,send_to:MEASUREMENT_ID});
}
export function AnalyticsTracker(){
  const pathname=usePathname();
  const [accepted,setAccepted]=useState(false);
  useEffect(()=>{
    const update=()=>{
      const consent=hasConsent();
      if(window.gtag)window.gtag("consent","update",{
        analytics_storage:consent?"granted":"denied",
        ad_storage:"denied",
        ad_user_data:"denied",
        ad_personalization:"denied"
      });
      setAccepted(consent);
    };
    update();window.addEventListener(ANALYTICS_CONSENT_EVENT,update);
    return()=>window.removeEventListener(ANALYTICS_CONSENT_EVENT,update);
  },[]);
  useEffect(()=>{
    if(!accepted||!MEASUREMENT_ID||blockedPath(pathname))return;
    enableGA4();
    if(!window.gtag)return;
    window.gtag("event","page_view",{page_title:document.title,page_location:window.location.origin+pathname,page_path:pathname,send_to:MEASUREMENT_ID});
  },[accepted,pathname]);
  useEffect(()=>{
    if(!accepted||!MEASUREMENT_ID||blockedPath(pathname))return;
    function clicks(e:MouseEvent){
      const target=e.target;
      if(!(target instanceof Element))return;
      const anchor=target.closest("a[href]");
      if(!anchor)return;
      const href=anchor.getAttribute("href")||"";
      let eventName:"click_phone"|"click_whatsapp"|null=null;
      if(href.startsWith("tel:"))eventName="click_phone";
      else if(/^https:\/\/(wa\.me|api\.whatsapp\.com)(\/|\?)/i.test(href))eventName="click_whatsapp";
      if(eventName)window.gtag?.("event",eventName,{page_path:window.location.pathname,send_to:MEASUREMENT_ID});
    }
    document.addEventListener("click",clicks,true);
    return()=>document.removeEventListener("click",clicks,true);
  },[accepted,pathname]);
  return null;
}
