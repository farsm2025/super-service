# Carnet de devis Super-Service — statut technique (13 novembre 2026)

## Isolement du calendrier en production
- Branche GitHub : `feature/carnet-devis-photos-20261113`.
- **Ne pas fusionner avant les essais et la validation de mise en production.**
- La migration ne touche pas aux tables `appointments`, `appointment_history` ni à l'authentification.
- La branche principale Neon `br-orange-star-axjhhx3p` est **inchangée** au moment du contrôle.
- La branche temporaire `br-bitter-pine-ax8w21g6` contient les tables d'essai et des données fictives, **pas de données client nouvelles**.
- 37 rendez-vous étaient présents en production et dans la copie test lors des contrôles.

## Développé sur branche
- Interface carnet sous `/gestion/carnet`.
- Notes indépendantes du calendrier, e-mail facultatif, recherche, statuts, suivi.
- Association à un rendez-vous existant seulement, sans modification du rendez-vous.
- Upload de photos avec compression locale JPEG, légendes et routes avec authentification admin.
- Nouveau schéma SQL dans `migrations/2026-11-13_carnet_devis.sql`.

## Vérifications réalisées
- Vercel Preview de la branche : statut READY pour le commit a99679e6abe0a04f2abf8e412f1bd019e6a63359.
- Neon test : insertion d'une note fictive, modification de sa description et de son statut, insertion d'une référence de photo fictive.
- **Aucun téléversement ni lecture réel de photos effectué.**
- **Aucun test fonctionnel navigateur authentifié** ni test de notifications/rappels.
- Aucune modification de production Neon, aucun déploiement production du carnet.

## Blocages avant mise en production
1. Créer un Blob store **PRIVATE** Vercel, uniquement après revue des frais et du branchement au projet.
2. Remplacer/valider l'adaptateur HTTP expérimental `lib/private-quote-photo.ts` par l'intégration SDK officielle `@vercel/blob` compatible stockage privé. Vérifier `package-lock.json`. Ne pas considérer le stockage prêt.
3. Tester les photos réelles : création, upload, récupération autorisée, refus sans session, légende, plusieurs images, compression.
4. Tester sur preview et base de test : création, édition, statut, recherche, liaison au RDV.
5. Faire une sauvegarde restaurable des données Neon AVANT migration de production, et étendre le passeport numérique avec export/sauvegarde du stockage Blob.
6. Après validation expresse, appliquer uniquement les nouvelles tables et déployer sur production avec test de non-régression du calendrier (connexion, affichage, création, modification, emails et rappels).
7. Nettoyer les branches Neon temporaires après autorisation et fin des tests, pour maîtriser les coûts.

## Retour arrière
- Déploiement précédent de production Vercel : réassignable si besoin.
- L'architecture prévoit de ne pas altérer les tables des rendez-vous.
- Les nouvelles tables sont additives ; aucune suppression de données n'est nécessaire pour restaurer l'ancienne application.
