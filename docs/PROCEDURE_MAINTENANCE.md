# Procédure de maintenance — Super-Service

**Version :** 1.0 — 22 novembre 2026  
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
