"use client";

import Link from "next/link";
import {useEffect, useState} from "react";

const STORAGE_KEY = "super-service-privacy-choice";

export function PrivacyBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVisible(localStorage.getItem(STORAGE_KEY) === null);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function saveChoice(choice: "accepted" | "refused") {
    localStorage.setItem(STORAGE_KEY, choice);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <aside className="privacy-banner" role="dialog" aria-label="Protection de vos données" aria-live="polite">
      <div className="privacy-banner-copy">
        <strong>Protection de vos données</strong>
        <p>
          Nous utilisons vos données uniquement pour répondre à vos demandes. Ce site mémorise votre choix sur cet appareil et n&apos;active aucun cookie publicitaire.
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
