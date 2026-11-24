"use client";
export function PrivacyPreferencesButton(){
  return <button type="button" className="button button-outline" onClick={()=>window.dispatchEvent(new Event("super-service-privacy-open"))}>Modifier mon choix pour les statistiques</button>;
}
