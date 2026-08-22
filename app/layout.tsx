import type { Metadata } from "next";
import "./globals.css";
import {PrivacyBanner} from "./ui/privacy-banner";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.super-service.ch"),
  title: { default: "Déménagement à Lausanne et dans le canton de Vaud | Super-Service", template: "%s | Super-Service" },
  description: "Entreprise de déménagement et multiservices à Lausanne : transport, montage de meubles, nettoyage de fin de bail et débarras. Devis gratuit sous 24 h.",
  keywords: ["déménagement Lausanne", "nettoyage fin de bail Lausanne", "entreprise multiservices Vaud", "débarras Lausanne", "montage meubles Lausanne"],
  openGraph: { type: "website", locale: "fr_CH", siteName: "Super-Service", title: "Déménagement à Lausanne et dans le canton de Vaud", description: "Déménagement, nettoyage et multiservices. Devis gratuit sous 24 h.", images: [{ url: "/logo-super-service.jpg", width: 1320, height: 666, alt: "Super-Service Lausanne" }] },
  twitter: { card: "summary_large_image", title: "Super-Service Lausanne", description: "Déménagement, nettoyage et multiservices dans le canton de Vaud.", images: ["/logo-super-service.jpg"] },
  alternates: { canonical: "/" }, robots: { index: true, follow: true },
};
const schema = { "@context":"https://schema.org", "@type":"MovingCompany", name:"Super-Service", url:"https://www.super-service.ch", image:"https://www.super-service.ch/logo-super-service.jpg", telephone:"+41783223368", email:"info@super-service.ch", address:{"@type":"PostalAddress",streetAddress:"Rue du Clos-de-Bulle 5",postalCode:"1004",addressLocality:"Lausanne",addressCountry:"CH"}, areaServed:{"@type":"AdministrativeArea",name:"Canton de Vaud"}, priceRange:"CHF" };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="fr"><body><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}} />{children}<PrivacyBanner/></body></html>; }
