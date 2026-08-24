"use client";
import Image from "next/image";
import Link from "next/link";
import {useState} from "react";
import {testimonials} from "../data/testimonials";

export function Header(){
  const[open,setOpen]=useState(false);
  const closeMenu=()=>setOpen(false);
  return <header className="header">
    <Link href="/" className="brand" aria-label="Super-Service, accueil"><Image src="/logo-super-service.jpg" alt="Super-Service – déménagement et multiservices" width={1320} height={668} priority sizes="(max-width:680px) 210px,290px"/></Link>
    <button className="menu-button" onClick={()=>setOpen(!open)} aria-expanded={open} aria-label={open?"Fermer le menu":"Ouvrir le menu"}><span/><span/><span/></button>
    <nav className={open?"nav open":"nav"} aria-label="Navigation principale"><Link href="/#services" onClick={closeMenu}>Services</Link><Link href="/services/demenagement" onClick={closeMenu}>Déménagement</Link><Link href="/services/nettoyage" onClick={closeMenu}>Nettoyage</Link><Link href="/services/location-camion" onClick={closeMenu}>Location camion</Link><Link className="reviews-nav-link" href="/avis" onClick={closeMenu}>Avis <span className="reviews-count" aria-label={`${testimonials.length} avis`}>{testimonials.length}</span></Link><Link href="/#contact" onClick={closeMenu}>Contact</Link></nav>
    <div className="header-actions"><a className="icon-link" href="tel:+41783223368" aria-label="Téléphoner">☎</a><a className="icon-link whatsapp" href="https://wa.me/41783223368" aria-label="WhatsApp">WA</a><Link className="button button-primary small" href="/devis">Devis gratuit</Link></div>
  </header>;
}
