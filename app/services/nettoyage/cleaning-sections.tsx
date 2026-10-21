import Link from "next/link";
import styles from "./cleaning.module.css";

const questions=[
  {q:"Quel est le prix d’une entreprise de nettoyage à Lausanne ?",a:"Le prix dépend de la surface, de l’état des locaux, des équipements à nettoyer et du type d’intervention. Décrivez votre besoin et ajoutez des photos pour obtenir un devis adapté."},
  {q:"Peut-on organiser un nettoyage avant l’état des lieux de sortie ?",a:"Oui. Pour un nettoyage de fin de bail, il est préférable d’intervenir après le départ des meubles, avec une marge suffisante avant la restitution des clés. Précisez la date de l’état des lieux."},
  {q:"Proposez-vous le nettoyage régulier de bureaux ?",a:"Super-Service propose le nettoyage ponctuel ou régulier des bureaux et commerces. Indiquez la superficie, la fréquence envisagée et vos contraintes d’accès pour recevoir une proposition."},
  {q:"Intervenez-vous en dehors de Lausanne ?",a:"Oui, Super-Service intervient aussi dans le canton de Vaud, notamment autour de Renens, Prilly, Pully et Morges. Transmettez votre adresse pour vérifier les modalités d’intervention."},
];

export function CleaningSections(){
  return <>
    <section className={styles.highlight} aria-labelledby="nettoyage-fin-bail-title">
      <div className={styles.columns}>
        <div>
          <p className="eyebrow">Pour les locataires et les régies</p>
          <h2 id="nettoyage-fin-bail-title">Nettoyage de fin de bail et préparation de l’état des lieux</h2>
          <p>Après le <Link className="contextual-link" href="/services/demenagement">déménagement</Link>, les pièces vides permettent un nettoyage plus complet avant la remise des clés. Cuisine, four, hotte, sanitaires, placards, vitres et sols font partie des surfaces à examiner selon le logement.</p>
          <p>Pour préparer votre devis, indiquez la surface, le nombre de pièces et de sanitaires, les éventuelles dépendances, les consignes de la régie et la date de l’état des lieux. Les prestations comprises seront détaillées dans l’offre.</p>
          <p>Notre <Link className="contextual-link" href="/blog/checklist-nettoyage-fin-de-bail-lausanne">checklist de nettoyage de fin de bail</Link> présente les points à vérifier pièce par pièce.</p>
          <Link className="button button-primary" href="/devis">Demander un devis fin de bail</Link>
        </div>
        <aside className={styles.panel}>
          <h3>À indiquer pour votre devis</h3>
          <ul>
            <li>Adresse, nombre de pièces et surface</li>
            <li>Cuisine, salles d’eau et équipements</li>
            <li>Fenêtres, stores et accès particuliers</li>
            <li>Cave, balcon et autres dépendances</li>
            <li>Date souhaitée et photos disponibles</li>
          </ul>
        </aside>
      </div>
    </section>

    <section className={styles.section} aria-labelledby="nettoyage-bureaux-title">
      <div className={styles.narrow}>
        <p className="eyebrow">Entreprises et commerces</p>
        <h2 id="nettoyage-bureaux-title">Nettoyage de bureaux et locaux professionnels à Lausanne</h2>
        <p>Pour les entreprises, les commerces et les bureaux, nous proposons des prestations de nettoyage ponctuelles ou régulières adaptées aux locaux et aux besoins des occupants. L’entretien peut porter sur les surfaces de travail, les sols, les sanitaires et les espaces communs accessibles, selon le devis.</p>
        <p>Indiquez la surface à nettoyer, le type de locaux, la fréquence souhaitée et les contraintes d’accès. Super-Service pourra vous proposer une organisation adaptée, sans formule standard imposée.</p>
        <Link className="button button-outline" href="/devis">Demander une offre pour vos locaux</Link>
      </div>
    </section>

    <section className={styles.area} aria-labelledby="nettoyage-vaud-title">
      <div className={styles.columns}>
        <div>
          <p className="eyebrow">Zone d’intervention</p>
          <h2 id="nettoyage-vaud-title">Une entreprise de nettoyage active dans le canton de Vaud</h2>
          <p>Super-Service propose ses prestations à Lausanne et dans les communes environnantes, notamment Renens, Prilly, Pully et Morges, ainsi que dans d’autres secteurs du canton de Vaud selon la demande.</p>
          <p>Que vous soyez un particulier, une entreprise ou une régie, précisez l’adresse de l’intervention pour que nous puissions préparer une offre adaptée.</p>
        </div>
        <div className={styles.panel}>
          <h3>Comment demander un nettoyage ?</h3>
          <ol>
            <li>Décrivez le logement ou le local à nettoyer.</li>
            <li>Précisez la surface, l’adresse et les délais.</li>
            <li>Recevez une proposition selon vos besoins.</li>
          </ol>
          <Link className="button button-primary" href="/devis">Demander un devis gratuit</Link>
        </div>
      </div>
    </section>

    <section className={styles.section} aria-labelledby="nettoyage-faq-title">
      <div className={styles.narrow}>
        <p className="eyebrow">Questions fréquentes</p>
        <h2 id="nettoyage-faq-title">Vos questions sur nos prestations de nettoyage</h2>
        <p>Quelques informations pour préparer votre demande et obtenir un devis correspondant à votre situation.</p>
      </div>
      <div className={styles.faqGrid}>
        {questions.map(item=><article key={item.q} className={styles.faqItem}>
          <h3>{item.q}</h3>
          <p>{item.a}</p>
        </article>)}
      </div>
      <p className={styles.related}>Vous prévoyez aussi de vider les locaux ? Découvrez notre <Link className="contextual-link" href="/services/debarras">service de débarras</Link> et la <Link className="contextual-link" href="/blog/checklist-demenagement-lausanne">checklist de déménagement à Lausanne</Link>.</p>
    </section>
  </>;
}
