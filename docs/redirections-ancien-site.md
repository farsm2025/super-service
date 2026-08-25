# Plan de redirections de l’ancien site

Ce document prépare la migration de `kings-and-queens-transport.ch` vers
`super-service.ch`. Les redirections ne sont pas encore actives.

## Redirections à activer le jour du lancement

| Ancienne URL | Nouvelle URL | Code |
| --- | --- | --- |
| `https://kings-and-queens-transport.ch/` | `https://super-service.ch/` | 301 |
| `https://kings-and-queens-transport.ch/services` | `https://super-service.ch/services` | 301 |
| `https://kings-and-queens-transport.ch/services/` | `https://super-service.ch/services` | 301 |
| `https://kings-and-queens-transport.ch/services-de-demenagement/` | `https://super-service.ch/services/demenagement` | 301 |
| `https://kings-and-queens-transport.ch/contact` | `https://super-service.ch/devis` | 301 |
| `https://kings-and-queens-transport.ch/contact/` | `https://super-service.ch/devis` | 301 |
| `https://kings-and-queens-transport.ch/353-2/` | `https://super-service.ch/` | 301 |

Les mêmes règles s’appliquent à la variante
`www.kings-and-queens-transport.ch`. Les autres chemins de l’ancien domaine
sont redirigés vers l’accueil de Super-Service afin qu’aucune ancienne URL ne
reste inaccessible après le basculement.

Les anciennes ancres de `/services` (`#debarras-evacuation`,
`#dem-particulier`, `#electricite-residentiel`, `#montage-meubles`,
`#nettoyage-etat-lieux`, `#peinture-interieure` et
`#transport-objets-lourds`) ne peuvent pas déclencher une redirection serveur
distincte : un fragment placé après `#` n’est jamais transmis au serveur. Elles
arriveront sur `https://super-service.ch/services`, qui présente tous les
services et leurs nouvelles pages.

Toutes les autres anciennes URL doivent être redirigées vers la page nouvelle
la plus proche lorsqu’une correspondance existe. Une redirection générale vers
la page d’accueil ne doit servir qu’aux URL sans équivalent pertinent.

## Contrôles avant activation

1. Exporter ou relever toutes les URL de l’ancien sitemap et de Google Search Console.
2. Ajouter au tableau les éventuelles URL absentes ci-dessus.
3. Connecter `super-service.ch` au projet Vercel et vérifier le certificat HTTPS.
4. Vérifier les formulaires, les e-mails et toutes les pages du nouveau domaine.
5. Ajouter les domaines `kings-and-queens-transport.ch` et
   `www.kings-and-queens-transport.ch` au projet Vercel.
6. Faire pointer uniquement leurs enregistrements Web vers Vercel, sans toucher
   aux enregistrements MX, SPF, DKIM et DMARC de l’ancienne messagerie.
7. Régler `ENABLE_LEGACY_REDIRECTS=true` et `SITE_LAUNCHED=true` dans
   l’environnement Production de Vercel, puis redéployer.
8. Conserver l’ancien domaine et ses redirections pendant au moins douze mois.
9. Déclarer le changement d’adresse et envoyer le nouveau sitemap dans Google Search Console.

## Important

Ne pas modifier les enregistrements MX de l’ancien domaine tant que les anciens
e-mails doivent encore être reçus ou transférés. La migration du site web et
celle de la messagerie sont deux opérations DNS distinctes.
