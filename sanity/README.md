# Connexion Sanity

Le projet **Super-Service** (`hk158c3c`) utilise le dataset `production`. Le Studio intégré est disponible sous `/studio`.

La rubrique **Photos des services** permet d’ajouter une photo, son texte alternatif SEO et de choisir dans une liste déroulante la page du service où elle doit apparaître. L’option « Afficher aussi sur la page d’accueil » réserve les meilleures photos à la section Réalisations de l’accueil.

La rubrique **Contenu et tarifs des services** contient les informations éditables des services, notamment les véhicules et tarifs de location. La rubrique **Avis clients** reçoit les avis envoyés depuis le site.

Les coordonnées générales doivent être modifiées dans le document unique **Paramètres du site**. Un nouvel avis est créé avec le statut `pending`, puis Super-Service peut le passer directement à `published`, `hidden` ou `rejected` depuis l’e-mail de modération. Le statut `verified` est conservé uniquement pour les anciens liens de validation déjà envoyés.

Les variables nécessaires sont décrites dans `.env.example`. Le jeton `SANITY_API_TOKEN` reste exclusivement dans les variables sécurisées de Vercel et ne doit jamais être ajouté au dépôt.
