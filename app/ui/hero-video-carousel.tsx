import Link from "next/link";
import Image from "next/image";

export function HeroVideoCarousel() {
  return (
    <section className="hero hero-static">
      <div className="hero-static-visual" aria-hidden="true">
        <Image src="/hero-super-service.webp" alt="" fill priority sizes="100vw" quality={80} className="hero-static-image" />
      </div>
      <div className="hero-overlay" />
      <div className="hero-content">
        <p className="hero-kicker">Déménagement • Nettoyage • Location de camion • Multiservices</p>
        <h1>Déménagement à Lausanne et dans le canton de Vaud</h1>
        <p>Une équipe polyvalente pour votre déménagement, le transport, le montage de meubles, le nettoyage de fin de bail, la location de camion avec ou sans chauffeur, le débarras et les petits travaux.</p>
        <div className="hero-actions">
          <Link className="button button-primary" href="/rendez-vous">Prenez rendez-vous</Link>
          <Link className="button button-glass" href="/devis">Demander un devis</Link>
          <a className="button button-glass" href="tel:+41783223368">Nous appeler</a>
          <a className="button button-whatsapp" href="https://wa.me/41783223368">WhatsApp</a>
        </div>
        <div className="hero-opening-hours" aria-label="Horaires d'ouverture">
          <span>Lundi à samedi : 7h30 – 17h00</span>
          <span>Dimanche : fermé</span>
        </div>
        <span className="response-badge">Réponse et devis gratuit sous 24 h</span>
      </div>
    </section>
  );
}
