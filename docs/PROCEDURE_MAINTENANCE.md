# Procédure de maintenance — Super-Service

**Version :** 1.2 — 25 novembre 2026  
**Responsable du suivi :** Novelyo  
**Périmètre :** site Super-Service uniquement, sans application automatique aux autres clients.

## 1. Identité et points d'entrée vérifiés

- Site public : https://www.super-service.ch/
- Dépôt GitHub : `farsm2025/super-service`
- Branche de production : `main`
- Projet Vercel : `super-service` (ID observé : `prj_88YghzjpJ9SXjHXBn9vhEyGcQ6bh`)
- CMS : Sanity, utilisé notamment pour le contenu des services via `lib/sanity.ts`. Les valeurs de l'environnement restent à vérifier avant de les modifier.
- Page des camions : `app/services/location-camion/page.tsx`
- Formulaire de demande : `app/devis/page.tsx`
- Schéma des véhicules Sanity : `sanity/schemaTypes/service.ts`
- Images des camions : `public/images/location-camion/`

**Attention :** Ne jamais confondre ce dépôt, ses services ou ses déploiements avec ceux de Probat Concept, Governance Records ou d'autres clients.

## 2. Avant toute intervention

1. Relire le présent document et consulter les modifications récentes de `main`, les PR et les déploiements correspondants.
2. Vérifier l'état réel du code et du service ciblé, ainsi que les décisions déjà validées. Ne pas recréer une fonctionnalité, un script ou un dossier existant sans raison.
3. Délimiter précisément les fichiers à toucher et les conséquences possibles (formulaires, CMS, SEO, prix, images).
4. En cas de modification de l'infrastructure ou du code existant, obtenir l'accord explicite du client, sauf autorisation déjà donnée pour l'opération.
5. Créer une branche dédiée à partir du dernier `main`. Éviter les changements directs en production.
6. Ne jamais copier de clés, jetons ou variables d'environnement sensibles dans Git, dans la documentation ou dans les journaux publiés.

## 3. Méthode éprouvée pour ajouter une photo

Cette méthode a fonctionné pour les photos du Renault Maxity le **22 novembre 2026**. Elle est une solution de repli quand un téléversement binaire GitHub classique n'est pas disponible.

1. Récupérer l'image **réellement fournie par le client** ; vérifier le cadrage et la fidélité du véhicule.
2. Produire une version WebP légère, à la taille nécessaire pour la carte sans sacrifier inutilement la netteté. Ne pas remplacer ni effacer l'original sans accord.
3. Choisir un nom unique et explicite, par exemple `renault-maxity-20m3-side.webp`, dans `public/images/location-camion/`.
4. Si le connecteur prend en charge l'encodage Base64, utiliser **GitHub `create_blob`** avec `encoding: "base64"` et les **vrais octets du fichier** encodés. Ne jamais copier un exemple Base64, une URL ou une représentation textuelle à la place du fichier.
5. Utiliser **`create_tree`** avec le `base_tree_sha` de la branche pour ajouter l'entrée `path` / `mode: 100644` / `type: blob` / `sha` ; puis **`create_commit`** en indiquant le parent exact ; enfin **`update_ref`** sur la branche prévue, avec contrôle du SHA attendu.
6. Confirmer dans l'arbre GitHub que le fichier est présent au bon chemin avec une taille plausible. Vérifier le contenu de l'image ou son rendu dans la prévisualisation : la seule existence du blob ne suffit pas à garantir qu'elle est correcte.
7. Ajouter le chemin de l'image à la galerie du véhicule dans `app/services/location-camion/page.tsx`, **sans réécrire les autres cartes**. Respecter la présentation existante, les légendes et attributs alt.
8. Contrôler le déploiement de prévisualisation Vercel : état `READY`, affichage desktop/mobile, absence d'image cassée et galerie homogène.
9. Ouvrir ou relire la PR ; fusionner sur `main` seulement après contrôle. Vérifier ensuite le déploiement Vercel ciblant `production` et l'affichage sur l'URL publique.

Si l'outil de transfert est indisponible, **ne pas affirmer que GitHub/Vercel est inaccessible sans vérification** : distinguer accès au dépôt, édition de texte, transfert d'octets et accès au fichier local. Ne pas annoncer de publication avant confirmation.

### Exemple historique vérifié

- **24 août 2026** : commit `8b6be2f` — ajout des photos `citroen-jumper-exterieur.webp` et `citroen-jumper-hayon.webp` avec la présentation des deux camions.
- **22 novembre 2026** : PR [#30](https://github.com/farsm2025/super-service/pull/30) — ajout du Renault Maxity et de sa première photo (avec tarifs actualisés).
- **22 novembre 2026** : PR [#31](https://github.com/farsm2025/super-service/pull/31) — deuxième photo `renault-maxity-20m3-side.webp` ajoutée à la galerie existante et déployée.

L'historique de GitHub montre **ce qui a été commité**, pas nécessairement l'intégralité des gestes ou outils employés à chaque étape. La méthode Base64/Git tree a été **effectivement utilisée et vérifiée lors des interventions du 22 novembre 2026**.

## 4. Modification de tarifs ou de véhicules

- Lire les prix **effectivement affichés** dans la page : certains prix ont historiquement été codés directement dans le JSX, et pas uniquement dans les champs de `defaultVehicles`.
- Vérifier les éventuelles valeurs venant de Sanity et leur fusion avec les données par défaut.
- Mettre à jour la page et, en cas de nouveau véhicule, son choix dans `app/devis/page.tsx`, les types de `lib/sanity.ts` et le choix du schéma `sanity/schemaTypes/service.ts` lorsque nécessaire.
- Ne pas inventer les charges utiles, équipements, montants de cautions, heures ou kilomètres inclus. Reprendre les décisions client exactes ; vérifier les conditions avant toute modification.
- Tester également le formulaire et les e-mails de demande sans envoyer de données clients réelles non nécessaires.

**Tarifs validés le 22 novembre 2026 :**

| Véhicule | Demi-journée (6 h, 300 km inclus) | Journée (12 h, 600 km inclus) |
|---|---:|---:|
| Iveco Daily 17 m³ | CHF 80.– | CHF 160.– |
| Citroën Jumper 20 m³ | CHF 100.– | CHF 200.– |
| Renault Maxity 20 m³ | CHF 100.– | CHF 200.– |

Kilométrage illimité : **sur demande**. Ces tarifs sont un **historique**, pas une source immuable : toujours comparer à l'état en ligne et aux nouvelles instructions.

## 5. Contrôle, publication et compte rendu

Pour chaque intervention, noter clairement :

- **Prévu** : demande reçue, contraintes et accord.
- **Préparé** : branche, fichier/image, modifications de code.
- **Exécuté** : fichiers réellement commités et PR.
- **Testé** : statut du build, vérification de la page et du parcours concerné (un build `READY` ne prouve pas à lui seul la qualité visuelle).
- **Publié** : SHA fusionné et déploiement Vercel `production` en état `READY`.
- **Restant** : points non vérifiés ou éventuelles corrections.

Fournir les liens vers la PR, le commit et la page publique, sans annoncer un test qui n'a pas eu lieu. En cas de problème, conserver la possibilité de revenir au commit précédent.

## 6. Sauvegardes et passeport numérique

Le présent fichier est **une procédure**, pas une sauvegarde du site ni des services cloud.

Respecter la structure existante du passeport numérique Super-Service (dossiers `00_Sources_Ancien_Site` à `12_Autres_Services`). Vérifier les scripts et archives déjà créés avant toute évolution. Distinguer les fichiers GitHub, les exports Sanity, les données Neon, les configurations Vercel et les autres services. Une sauvegarde n'est considérée complète qu'une fois datée, contrôlée et restaurable. Protéger les secrets.

## 7. Règle générale Novelyo

Une seule procédure de référence **par client et par dépôt** ; améliorer cette documentation au fur et à mesure sans créer plusieurs méthodes concurrentes. Toujours privilégier la continuité, les changements minimaux, la sécurité et l'absence de coût supplémentaire.

## 8. Personnel / Heures — clôture, archivage, corbeille et suppressions

**État au 25 novembre 2026 :** changements publiés sur `main` via PR [#46](https://github.com/farsm2025/super-service/pull/46) (SHA `9281ab75`) et [#47](https://github.com/farsm2025/super-service/pull/47) (SHA `d975c366`), compilation de prévisualisation et déploiement Vercel de production `READY`. Les parcours complets d'archivage, de restauration, de suppression et de remise de PDF avec des données fictives **ne sont pas encore validés par test fonctionnel de bout en bout**.

### 8.1. Composants existants — ne pas recréer

- Interface : `app/gestion/heures/heures-client.tsx` ; styles : `app/gestion/heures/heures.css`.
- API authentifiée : `app/api/gestion/heures/route.ts` (vérifie la session administrateur).
- PDF : `lib/hours-pdf.ts` ; envoi : `lib/hours-email.ts` via Resend.
- Tables Neon : `work_people`, `work_entries`, `work_statements` et `work_statement_versions`.
- Migrations existantes du 24 novembre 2026 : `2026-11-24_releves_heures.sql`, `2026-11-24_archivage_personnes_corbeille_heures.sql`, `2026-11-24_suppression_definitive_heures.sql`, `2026-11-24_heures_email_decomptes.sql`.
- Fonctions SQL déjà définies : `work_delete_person_permanently(uuid)` et `work_delete_statement_permanently(uuid)`. **Ne pas réécrire ni réexécuter de migration sans vérifier l'état réel de Neon.**

### 8.2. Clôture et remise du décompte — PR #46

1. La clôture enregistre le décompte et ses lignes ; l'envoi par e-mail **n'est plus automatique**.
2. Choix de remise : **Télécharger le PDF** (sélection par défaut), envoyer par e-mail (si une adresse existe), imprimer, ou clôturer sans remise immédiate.
3. Le PDF est généré par la fonction existante `generateHoursPdf` ; téléchargement authentifié via `GET /api/gestion/heures?reportId=...&version=...`. Le téléchargement est indisponible pour les décomptes dans la corbeille : les restaurer d'abord.
4. Les décomptes clôturés et leurs versions restent dans l'historique. L'e-mail est déclenché explicitement via l'action API `resend_report` ; le suivi d'état d'envoi demeure distinct de la clôture.
5. Un échec de téléchargement, d'impression ou d'envoi ne doit jamais être interprété comme une absence de clôture. Vérifier d'abord l'historique avant de retenter.

### 8.3. Fiches de personnel — PR #47

- Deux vues distinctes dans l'interface : **Personnel actif** et **Archives**, chacune avec compteur. Une personne archivée disparaît de la sélection active, mais sa fiche reste récupérable.
- **Archiver** (`archive_person`) renseigne `work_people.archived_at` ; les interventions, décomptes et versions sont conservés.
- **Réactiver** (`restore_person`) efface `archived_at` ; la personne revient dans la liste active avec son historique.
- **Supprimer définitivement une personne** (`permanent_delete_person`) est présenté dans une « Zone dangereuse », uniquement depuis la fiche archivée. L'interface annonce le nombre d'interventions non clôturées, décomptes et versions ; elle exige une confirmation puis la saisie exacte du nom complet. La fonction SQL efface les versions, interventions, décomptes et la fiche. **Irréversible**.
- Cette distinction entre archive et suppression définitive est une protection de l'interface : l'API garde ses validations propres. Ne jamais exécuter l'action destructrice sur une vraie fiche pour un simple test.

### 8.4. Décomptes — corbeille et suppression

- **Mettre dans la corbeille** (`trash_report`) renseigne `work_statements.deleted_at` : les versions et heures liées sont conservées.
- **Restaurer** (`restore_report`) remet `deleted_at` à NULL ; le décompte et ses versions reviennent à l'historique actif.
- **Supprimer définitivement un décompte** (`permanent_delete_report`) n'est proposé dans l'interface que pour un décompte déjà dans la corbeille. La « Zone dangereuse » indique le nombre de versions ; l'utilisateur confirme puis saisit `SUPPRIMER`. La fonction SQL supprime les versions, interventions liées et décompte, mais conserve la personne. **Irréversible**.
- Les versions d'un même décompte sont rattachées à un identifiant commun : déplacer/restaurer un décompte porte sur toutes ses versions, et non sur une seule.

### 8.5. Contrôles obligatoires après intervention

**Avant tout test destructeur**, utiliser des enregistrements de démonstration isolés, jamais une fiche de collaborateur réel ; vérifier l'environnement et disposer d'une sauvegarde Neon datée/restaurable. Ne pas confondre compilation `READY` avec tests fonctionnels.

1. Tester création de fiche fictive, ajout d'intervention et clôture ; vérifier la cohérence des heures, totaux, PDF et historique.
2. Archiver la fiche ; vérifier sa disparition de Personnel actif, sa présence dans Archives et la conservation des heures/décomptes. La réactiver et vérifier son retour.
3. Mettre un décompte fictif dans la corbeille ; vérifier son absence de l'historique actif, puis le restaurer avec ses versions intactes.
4. Tester les confirmations de suppression : annuler, refuser une saisie incorrecte, constater qu'aucune donnée n'est modifiée.
5. **Uniquement sur les données fictives et après contrôle préalable**, tester la suppression définitive d'un décompte depuis la corbeille, puis celle d'une fiche archivée ; contrôler l'absence des seules lignes associées en base et le rafraîchissement de l'interface.
6. Vérifier séparément téléchargement PDF, impression et envoi par e-mail avec une adresse de test autorisée, sans envoyer de documents à de vrais collaborateurs.
7. Documenter ce qui a été **compilé**, **déployé** et **vraiment testé** ; si un test est impossible, le marquer « à faire » plutôt que « réussi ».

**Dernière vérification read-only Neon avant cette mise à jour documentaire :** 7 fiches, aucune archivée, aucune intervention ni décompte enregistré dans la base consultée, et aucune référence orpheline détectée ; ceci ne constitue pas un test de suppression/restauration.

## 9. Protection du calendrier lors des mises à jour (iPhone/PWA)

**Incident signalé le 25 novembre 2026 :** l'utilisateur de l'application iPhone ne voyait plus ses rendez-vous. La vérification directe de Neon a retrouvé **44 rendez-vous, dont 39 confirmés**, mais aucun planifié pour ce jour. Un défaut d'affichage a été identifié dans `app/gestion/dashboard.tsx` : le filtre « Nouvelles demandes » appliqué par l'onglet « Demandes » persistait après un retour au « Calendrier » et pouvait masquer les rendez-vous confirmés. La perte de données n'est pas établie. Les suppressions historiques ne peuvent pas être datées avec certitude à partir des seuls compteurs PostgreSQL.

### 9.1. Règles de protection

1. **Ne jamais conclure que les rendez-vous ont disparu sur la seule base d'un calendrier vide à l'écran.** Vérifier les filtres, la vue Jour/Semaine/Mois, la session et la réponse API ; contrôler le nombre de lignes dans Neon.
2. Le retour aux vues **Accueil** et **Calendrier** doit effacer les filtres temporaires issus notamment de « Demandes » ; l'interface doit indiquer quand des filtres restent actifs et proposer de tous les retirer.
3. Le rafraîchissement de `GET /api/gestion/rendez-vous` doit signaler tout statut HTTP non réussi (notamment 401), erreur réseau ou réponse inattendue, au lieu de laisser croire à une liste vide.
4. Si une réponse renvoie subitement zéro rendez-vous alors que la page en affichait précédemment, afficher une **alerte explicite** et conserver temporairement la liste connue : celle-ci **n'est alors pas garantie à jour**. Ne pas la présenter comme une preuve de synchronisation.
5. Ne pas stocker de copies de fiches client non chiffrées dans `localStorage`, dans un cache PWA public ou dans un service tiers pour contourner un problème réseau.
6. Vérifier `public/sw.js` : dans la version actuelle, les routes `/gestion` et `/api/` sont exclues des réponses mises en cache par le service worker. Ne pas supprimer cette exclusion sans analyse de sécurité et de confidentialité.
7. Toute modification du calendrier, de son API, de l'authentification, des rendez-vous ou du service worker nécessite une vérification réelle sur téléphone, au-delà du simple build Vercel.

### 9.2. Contrôles à effectuer avant et après chaque mise à jour

- **Avant fusion sur `main` :** relever le nombre de rendez-vous Neon (total, confirmés, annulés, sans date planifiée) et la répartition par jour sur la période sensible. Consigner le SHA GitHub et la date. Aucune écriture SQL sur les rendez-vous.
- **Prévisualisation Vercel :** attendre `READY` et vérifier que le tableau de bord et les vues Jour/Semaine/Mois s'affichent. Une compilation réussie ne constitue pas à elle seule un test de l'application authentifiée.
- **Cas critique du filtre :** ouvrir « Demandes », revenir à « Calendrier » : tous les rendez-vous doivent être de nouveau visibles, y compris les confirmés ; vérifier « Afficher tous les rendez-vous ».
- **Erreur de synchronisation :** simuler un échec de requête ou une session expirée sur un environnement de test ; le message doit être visible et l'application ne doit pas prétendre être à jour. Ne pas faire ce test en coupant volontairement la production.
- **Après déploiement :** vérifier le SHA et l'état `READY` sur Vercel, comparer les comptes Neon relevés avant/après et vérifier les journaux d'erreur accessibles.
- **iPhone du client :** ouvrir l'application installée depuis l'écran d'accueil, passer de « Demandes » à « Calendrier », retirer les filtres, cliquer « Actualiser » et vérifier les prochains rendez-vous connus. Noter explicitement si cette vérification a été faite ou demeure à faire.
- **Si les rendez-vous paraissent absents :** arrêter toute modification destructrice, comparer Neon à l'historique et aux sauvegardes disponibles ; ne jamais restaurer une base entière ni réécrire des rendez-vous sans examen et autorisation.

### 9.3. Historique technique

- Code du calendrier : `app/gestion/dashboard.tsx`, `app/gestion/calendar-improvements.css`.
- API calendrier : `app/api/gestion/rendez-vous/route.ts` et `app/api/gestion/rendez-vous/[id]/route.ts` ; données : `lib/appointments.ts`, tables `appointments` et `appointment_history`.
- Correction de l'affichage iPhone et de la synchronisation : PR [#49](https://github.com/farsm2025/super-service/pull/49). **Statut du déploiement et des tests fonctionnels à relever séparément** ; ne pas les présumer du seul commit.
