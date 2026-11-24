"use client";

import Link from "next/link";
import {useEffect, useState} from "react";
import {ANALYTICS_CONSENT_KEY,ANALYTICS_CONSENT_EVENT} from "./analytics-tracker";

const STORAGE_KEY = ANALYTICS_CONSENT_KEY;

export function PrivacyBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVisible(localStorage.getItem(STORAGE_KEY) === null);
    }, 0);
    const reopen=()=>setVisible(true);
    window.addEventListener("super-service-privacy-open",reopen);
    return () => {window.clearTimeout(timer);window.removeEventListener("super-service-privacy-open",reopen)};
  }, []);

  function saveChoice(choice: "accepted" | "refused") {
    localStorage.setItem(STORAGE_KEY, choice);
    window.dispatchEvent(new Event(ANALYTICS_CONSENT_EVENT));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <aside className="privacy-banner" role="dialog" aria-label="Protection de vos données" aria-live="polite">
      <div className="privacy-banner-copy">
        <strong>Protection de vos données</strong>
        <p>
          Avec votre accord, Google Analytics mesure les visites, demandes de devis et clics de contact pour améliorer notre site. Sans accord, aucune balise statistique Google Analytics n’est chargée. Votre choix est mémorisé sur cet appareil et peut être modifié dans notre politique de confidentialité.
        </p>
        <Link href="/confidentialite">Consulter la politique de confidentialité</Link>
      </div>
      <div className="privacy-banner-actions">
        <button className="button button-outline" type="button" onClick={() => saveChoice("refused")}>
          Refuser
        </button>
        <button className="button button-primary" type="button" onClick={() => saveChoice("accepted")}>
          Accepter
        </button>
      </div>
    </aside>
  );
}
