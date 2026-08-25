import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-brand">
        <Image
          src="/logo-super-service.jpg"
          alt="Super-Service"
          width={260}
          height={131}
        />
        <p>
          Déménagement, nettoyage et multiservices à Lausanne et dans le canton
          de Vaud.
        </p>
      </div>
      <div>
        <h3>Services</h3>
        <Link href="/services">Tous les services</Link>
        <Link href="/services/demenagement">Déménagement</Link>
        <Link href="/services/nettoyage">Nettoyage</Link>
        <Link href="/services/location-camion">Location de camion</Link>
        <Link href="/services/transport-et-livraison">
          Transport et livraison
        </Link>
        <Link href="/services/montage-de-meubles">Montage de meubles</Link>
        <Link href="/services/debarras">Débarras</Link>
        <Link href="/services/petits-travaux-jardinage">Petits travaux</Link>
      </div>
      <div>
        <h3>Contact</h3>
        <a href="tel:+41783223368">+41 78 322 33 68</a>
        <a href="mailto:info@super-service.ch">info@super-service.ch</a>
        <p>
          Rue du Clos-de-Bulle 5
          <br />
          1004 Lausanne
        </p>
      </div>
      <div>
        <h3>Informations</h3>
        <Link href="/avis">Avis clients</Link>
        <Link href="/mentions-legales">Mentions légales</Link>
        <Link href="/confidentialite">Confidentialité</Link>
        <Link href="/studio">Gestion du contenu</Link>
      </div>
      <small>© 2026 Super-Service. Tous droits réservés.</small>
    </footer>
  );
}
