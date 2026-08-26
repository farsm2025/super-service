import Link from "next/link";
import {Icon} from "./icons";

export function MobileActions(){return <nav className="mobile-actions" aria-label="Actions rapides"><a href="tel:+41783223368"><span><Icon name="phone"/></span>Appeler</a><a href="https://wa.me/41783223368"><span><Icon name="whatsapp"/></span>WhatsApp</a><Link href="/devis"><span><Icon name="quote"/></span>Devis</Link><Link className="mobile-appointment" href="/rendez-vous"><span><Icon name="calendar"/></span>Rendez-vous</Link></nav>}
