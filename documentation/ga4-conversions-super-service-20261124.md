# Super-Service — GA4 et mesure des demandes (24.11.2026)

## Propriété
- Flux Web : Super-Service – Production ; `https://www.super-service.ch`
- ID public GA4 : `G-YCB11F5MPG`
- Vercel : `NEXT_PUBLIC_GA4_MEASUREMENT_ID` défini uniquement en production.
- Ne PAS ajouter séparément une seconde balise Google / GTM sans vérifier l'installation existante.
- L'événement GA4 n'est envoyé qu'après consentement explicite (`super-service-analytics-consent-v1`). Le choix précédent de confidentialité n'est pas réutilisé comme consentement Analytics.
- Aucune balise GA4 sur l'application privée /gestion, /studio ou /api.

## Événements GA4
| Nom | Déclenchement | Signification |
|---|---|---|
| `page_view` | Page publique visitée avec consentement | Audience consentante |
| `generate_lead` | Réponse réussie à `/api/devis` | Demande de devis (pas une vente) |
| `appointment_request` | Réponse réussie à `/api/rendez-vous` | Demande de rendez-vous (pas encore confirmé) |
| `click_phone` | Clic sur lien `tel:` | Intention d'appel (pas un appel reçu) |
| `click_whatsapp` | Clic sur lien WhatsApp | Intention de contact (pas une conversation commencée) |

Les événements de formulaires contiennent uniquement `lead_type` et `service_type` (options imposées). Aucun nom, numéro, e-mail, adresse, message ni identifiant client.

## Configuration dans l'interface GA4
1. Administration → Événements / Événements clés : marquer `generate_lead` et, selon le choix du client, `appointment_request` comme événements clés. Vérifier la déduplication métier avec les mêmes prospects.
2. Créer les dimensions personnalisées de portée événement pour `lead_type` et `service_type` si une ventilation par service est voulue.
3. Relier Search Console à GA4 pour comparer requêtes, pages d'atterrissage et conversion. La recherche Google Search Console est disponible via Windsor.ai.
4. Tester avec consentement via Temps réel / DebugView. Les formulaires réels de production peuvent envoyer des notifications : ne pas soumettre de fausse demande à un client sans procédure de test.
5. Vérifier que Refuser ne charge pas `gtag/js` sur une nouvelle visite, qu'Accepter la charge et que « Modifier mon choix » peut révoquer le consentement.

## Rentabilité — à compléter
Les clics sur `tel:` ne mesurent pas les appels décrochés. Pour les appels réels : journal manuel des appels ou outil de call tracking avec coût et accord du client. Pour mesurer le ROI SEO : enregistrer demande qualifiée → devis accepté → chiffre d'affaires et marge réelle, et rapprocher les coûts SEO sur la même période. Ne pas présenter des clics, leads ou rendez-vous comme du chiffre d'affaires.
