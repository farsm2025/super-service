import Link from "next/link";
import { Footer } from "./footer";
import { Header } from "./header";
import { MobileActions } from "./mobile-actions";
import { SITE_URL } from "../../lib/site";

export function PageShell({
  eyebrow,
  title,
  intro,
  breadcrumbLabel,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  breadcrumbLabel?: string;
  children: React.ReactNode;
}) {
  const breadcrumbs = breadcrumbLabel ? [
    {name:"Accueil", item:SITE_URL, href:"/"},
    {name:"Services", item:breadcrumbLabel === "Services" ? undefined : `${SITE_URL}/services`, href:breadcrumbLabel === "Services" ? undefined : "/services"},
    ...(breadcrumbLabel === "Services" ? [] : [{name:breadcrumbLabel, item:undefined, href:undefined}]),
  ] : [];
  const breadcrumbSchema = {"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:breadcrumbs.map((item,index)=>({"@type":"ListItem",position:index+1,name:item.name,...(item.item?{item:item.item}:{})}))};
  return (
    <main>
      <Header />
      <section className="inner-hero">
        {breadcrumbs.length > 0 ? <nav className="breadcrumbs" aria-label="Fil d’Ariane">
          <ol>{breadcrumbs.map((item)=><li key={item.name}>{item.href?<Link href={item.href}>{item.name}</Link>:<span aria-current="page">{item.name}</span>}</li>)}</ol>
        </nav> : null}
        <p className="eyebrow light">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{intro}</p>
        <div className="hero-actions center">
          <Link className="button button-primary" href="/devis">
            Demander un devis gratuit
          </Link>
          <a className="button button-glass" href="tel:+41783223368">
            +41 78 322 33 68
          </a>
        </div>
      </section>
      {breadcrumbs.length > 0 ? <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(breadcrumbSchema)}} /> : null}
      {children}
      <section className="mini-cta">
        <h2>Un besoin précis ? Parlons-en.</h2>
        <p>Devis gratuit et réponse sous 24 h.</p>
        <Link className="button button-primary" href="/devis">
          Obtenir mon devis
        </Link>
      </section>
      <Footer />
      <MobileActions />
    </main>
  );
}
