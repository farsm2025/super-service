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
        <div className="social-links" aria-label="Réseaux sociaux">
          <a
            href="https://www.facebook.com/share/19Zxp4Remo/?mibextid=wwXIfr"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Super-Service sur Facebook"
            title="Facebook"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M13.5 22v-9h3l.45-3.5H13.5V7.26c0-1.01.28-1.7 1.74-1.7H17.1V2.43c-.32-.04-1.42-.13-2.7-.13-2.67 0-4.5 1.63-4.5 4.62V9.5H7v3.5h2.9v9h3.6Z" />
            </svg>
          </a>
          <a
            href="https://www.tiktok.com/@superservice09?_r=1&_t=ZN-99WwsMzuvxO"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Super-Service sur TikTok"
            title="TikTok"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M14.2 2h3.03c.2 1.7 1.15 3.22 2.6 4.1A7.4 7.4 0 0 0 22 6.9v3.08a10.25 10.25 0 0 1-4.7-1.37v7.15A6.24 6.24 0 1 1 11.06 9.5c.36 0 .72.03 1.07.09v3.08a3.2 3.2 0 1 0 2.07 3V2Z" />
            </svg>
          </a>
          <a
            href="https://www.instagram.com/super_service.ch?stkn=MXY4c2V0cXF6b25mdQ%3D%3D&utm_source=qr"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Super-Service sur Instagram"
            title="Instagram"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9Zm9.75 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
            </svg>
          </a>
        </div>
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
        <Link href="/services/cartons-demenagement">Cartons de déménagement</Link>
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
