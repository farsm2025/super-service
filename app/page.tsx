import Image from "next/image";
import Link from "next/link";
import { HeroVideoCarousel } from "./ui/hero-video-carousel";
import { Testimonials } from "./ui/testimonials";
import { Header } from "./ui/header";
import { MobileActions } from "./ui/mobile-actions";
import { Realizations } from "./ui/realizations";

const services = [
  { icon: "↗", title: "Déménagement", text: "Déménagements privés et professionnels à Lausanne et dans tout le canton de Vaud, avec protection soignée de vos biens.", href: "/services/demenagement" },
  { icon: "✦", title: "Nettoyage", text: "Nettoyage de fin de bail, bureaux et fin de chantier. Une remise en état complète, prête pour votre état des lieux.", href: "/services/nettoyage" },
  { icon: "▣", title: "Transport & livraison", text: "Transport de meubles et objets volumineux, livraison à domicile et solutions ponctuelles avec véhicule adapté.", href: "/services/transport-debarras" },
  { icon: "⌂", title: "Montage de meubles", text: "Démontage, transport et remontage d’armoires, lits, étagères et autres meubles, avec fixation si nécessaire.", href: "/services/demenagement#montage" },
  { icon: "♻", title: "Débarras", text: "Débarras de caves, appartements, bureaux et chantiers avec tri et évacuation responsable des encombrants.", href: "/services/transport-debarras#debarras" },
  { icon: "⚒", title: "Petits travaux", text: "Bricolage, petites interventions électriques, fixation d’éléments au mur, jardinage et taille de haies.", href: "/services/petits-travaux-jardinage" },
];

const steps = [
  ["01", "Vous nous contactez", "Par téléphone, WhatsApp ou formulaire. Expliquez-nous simplement votre besoin."],
  ["02", "Nous préparons le devis", "Vous recevez une réponse claire et un devis gratuit sous 24 h."],
  ["03", "Nous intervenons", "Notre équipe arrive à l’heure, équipée et organisée pour réaliser la prestation."],
  ["04", "Vous contrôlez", "Nous vérifions le résultat avec vous avant de terminer l’intervention."],
];

export default function Home() {
  return <main>
    <Header />
    <HeroVideoCarousel />
    <section className="trust-strip" aria-label="Nos engagements">
      <div><strong>24 h</strong><span>pour votre devis gratuit</span></div><div><strong>Vaud</strong><span>Lausanne et tout le canton</span></div><div><strong>7j/7</strong><span>selon disponibilité</span></div><div><strong>5★</strong><span>des clients satisfaits</span></div>
    </section>
    <Testimonials />
    <section className="section intro" id="services">
      <div className="section-heading"><p className="eyebrow">Un seul partenaire, plusieurs solutions</p><h2>Déménagement et nettoyage, du premier carton à la remise des clés</h2><p>Particuliers, entreprises et régies : Super-Service coordonne les prestations dont vous avez besoin, sans multiplier les interlocuteurs.</p></div>
      <div className="service-grid">{services.map((s, i) => <article className={`service-card ${i < 2 ? "featured" : ""}`} key={s.title}><span className="service-icon" aria-hidden="true">{s.icon}</span><h3>{s.title}</h3><p>{s.text}</p><Link href={s.href}>Découvrir le service <span>→</span></Link></article>)}</div>
    </section>
    <section className="split-section" id="a-propos">
      <div className="split-visual"><Image src="/logo-super-service.jpg" alt="Équipe Super-Service pour le déménagement, le nettoyage et les petits travaux" width={1320} height={666} sizes="(max-width: 900px) 100vw, 50vw" /></div>
      <div className="split-copy"><p className="eyebrow light">Notre différence</p><h2>Une équipe polyvalente, un service simple et soigné</h2><p>Basée à Lausanne, notre équipe intervient pour vos déménagements, nettoyages et besoins multiservices dans tout le canton de Vaud.</p><ul className="check-list"><li>Un interlocuteur unique pour organiser votre intervention</li><li>Des prestations adaptées aux particuliers et aux entreprises</li><li>Une réponse rapide et un devis gratuit sous 24 h</li><li>Un travail contrôlé avec vous avant notre départ</li></ul><Link className="button button-white" href="/devis">Parler de mon projet</Link></div>
    </section>
    <Realizations />
    <section className="section process"><div className="section-heading compact"><p className="eyebrow">Comment ça marche ?</p><h2>Votre intervention en quatre étapes</h2></div><div className="steps">{steps.map(([n,t,x]) => <article key={n}><span>{n}</span><h3>{t}</h3><p>{x}</p></article>)}</div></section>
    <section className="service-area"><div><p className="eyebrow light">Zone d’intervention</p><h2>Lausanne et tout le canton de Vaud</h2><p>Lausanne, Prilly, Renens, Pully, Morges, Nyon, Yverdon-les-Bains, Vevey, Montreux et les communes environnantes.</p></div><Link className="button button-white" href="/devis">Demander un devis dans ma région</Link></section>
    <section className="cta-section" id="contact"><p className="eyebrow">Besoin d’un coup de main ?</p><h2>Recevez votre devis gratuit sous 24 h</h2><p>Dites-nous ce qu’il faut déménager, nettoyer, transporter ou réparer. Nous revenons vers vous rapidement.</p><div className="hero-actions center"><Link className="button button-primary" href="/devis">Demander un devis gratuit</Link><a className="button button-outline" href="tel:+41783223368">Appeler maintenant</a><a className="button button-whatsapp" href="https://wa.me/41783223368">WhatsApp</a></div></section>
    <footer className="footer"><div className="footer-brand"><Image src="/logo-super-service.jpg" alt="Super-Service" width={260} height={131} /><p>Déménagement, nettoyage et multiservices à Lausanne et dans le canton de Vaud.</p></div><div><h3>Services</h3><Link href="/services/demenagement">Déménagement</Link><Link href="/services/nettoyage">Nettoyage</Link><Link href="/services/transport-debarras">Transport & débarras</Link><Link href="/services/petits-travaux-jardinage">Petits travaux</Link></div><div><h3>Contact</h3><a href="tel:+41783223368">+41 78 322 33 68</a><a href="mailto:info@super-service.ch">info@super-service.ch</a><p>Rue du Clos-de-Bulle 5<br />1004 Lausanne</p></div><div><h3>Informations</h3><Link href="/avis">Avis clients</Link><Link href="/mentions-legales">Mentions légales</Link><Link href="/confidentialite">Confidentialité</Link><Link href="/studio">Gestion du contenu</Link></div><small>© 2026 Super-Service. Tous droits réservés.</small></footer>
    <MobileActions />
  </main>;
}
