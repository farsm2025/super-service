# Connexion Sanity

Le projet **Super-Service** (`hk158c3c`) utilise le dataset `production`. Le Studio intégré est disponible sous `/studio` avec les modèles `siteSettings`, `service` et `testimonial`.

Les coordonnées générales doivent être modifiées dans le document unique **Paramètres du site**. Les avis suivent les statuts `pending` → `verified` → `published`.

Les variables nécessaires sont décrites dans `.env.example`. Le jeton `SANITY_API_TOKEN` reste exclusivement dans les variables sécurisées de Vercel et ne doit jamais être ajouté au dépôt.
