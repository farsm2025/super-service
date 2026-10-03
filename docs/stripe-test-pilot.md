# Super Service — pilote Stripe caution camion

Cette branche ajoute une caution de 100 CHF par rendez-vous, via PaymentIntent
à capture manuelle et Stripe Payment Element. Cartons et acomptes restent une
étape suivante. Aucun e-mail ou WhatsApp supplémentaire n'est envoyé.

## Installation Preview / locale

1. Créer une branche Neon isolée du calendrier. Exécuter sur cette branche
   uniquement `db/migrations/20261003_stripe_test_payments.sql`.
2. Renseigner en Preview/local (jamais Production) :
   - `STRIPE_PAYMENTS_ENABLED=true`
   - `STRIPE_SECRET_KEY=sk_test_…`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_…`
   - `STRIPE_WEBHOOK_SECRET=whsec_…`
   - `STRIPE_LINK_SECRET` : secret aléatoire d'au moins 32 caractères
   - `STRIPE_DATABASE_URL` : branche Neon de test
   - `STRIPE_APP_URL` : origine exacte de la Preview ou http://localhost:3000
3. Pour vérifier le parcours complet sans exploiter de vrais clients, utiliser
   aussi la branche Neon isolée comme `DATABASE_URL` de la Preview et créer un
   rendez-vous fictif. Ne pas déclencher les e-mails existants vers de vrais clients.
4. Créer un webhook Stripe en test vers `/api/stripe/webhook`, abonné à :
   `payment_intent.amount_capturable_updated`, `payment_intent.succeeded`,
   `payment_intent.canceled`, `payment_intent.payment_failed`,
   `payment_intent.processing`. La Preview doit être accessible à Stripe
   (tenir compte de la protection Vercel). En local : Stripe CLI forward.
5. Ouvrir le rendez-vous fictif dans Gestion, créer le lien, puis utiliser
   une carte Stripe de test. Le lien n'est pas envoyé automatiquement.

## Vérification avant activation

- Carte test 4242 4242 4242 4242, date future et CVC quelconque : autorisation
  de 100 CHF, statut requires_capture dans Stripe, « 100 CHF réservés » dans Gestion.
- Libérer : statut canceled dans Stripe et caution libérée dans Gestion.
- Sur un autre rendez-vous fictif, autoriser puis confirmer l'encaissement :
  statut succeeded et 100 CHF encaissés (test).
- Carte de test avec authentification 3DS (documentation Stripe) : terminer
  l'authentification et vérifier le statut depuis le serveur.
- Carte refusée : aucune autorisation affichée comme réussie.
- Répéter les clics et les webhooks : une seule empreinte par rendez-vous.
- Signature webhook invalide : HTTP 400, aucune écriture.
- Sans session Gestion ou avec origine externe : actions refusées.
- Clé live ou VERCEL_ENV=production : intégration refusée.

## Limites du pilote

Une seule caution par rendez-vous, sans renouvellement ni capture partielle.
Expiration du lien après 7 jours ; expiration bancaire affichée depuis
`latest_charge.payment_method_details.card.capture_before`, sans durée présumée.
L'autorisation doit être demandée près du départ du camion.
Une décision capture/libération est réservée atomiquement : après une panne,
réessayer la même décision. Une initialisation Stripe interrompue depuis plus
de 23 heures nécessite une réconciliation manuelle (évite les doubles empreintes
après expiration de la clé d'idempotence Stripe).

Les changements de date, annulations ou suppressions du rendez-vous n'annulent
pas automatiquement la caution : la libérer dans Gestion avant suppression.
Les références de paiement sont conservées indépendamment du calendrier.
Le type location camion dédié et les notifications sont à ajouter après le pilote.
Les clés de test et l'accès à la branche Neon sont nécessaires pour les essais
réels Stripe ; tests de code seuls ne valident pas ces connexions externes.

Documentation : https://docs.stripe.com/payments/place-a-hold-on-a-payment-method
https://docs.stripe.com/webhooks
https://docs.stripe.com/testing
