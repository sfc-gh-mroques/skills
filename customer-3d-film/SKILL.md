---
name: customer-3d-film
description: Construire de zéro un film 3D web personnalisé pour un client (Three.js + GSAP, une seule page HTML autonome, ~2:40, en français) qui raconte la valeur business de Snowflake à un comité de direction — cadrage, scénario, monde 3D (carte, bureau, couche Snowflake), habillage et logos, build, vérification image par image, revue « CEO brutally honest » et boucle de corrections. Triggers: voix off film, voiceover film client, export mp4 film, film client, vidéo client, film 3D, vidéo codir, film snowflake pour un client, film-kit, snowflake-film-kit, vidéo personnalisée, animation client, film one customer promise, refaire le film pour un client.
---

# Film 3D client — skill maître (routeur)

Produit un film web 3D (pas une vidéo : une scène Three.js rejouée en temps réel par une timeline GSAP)
qui raconte, pour **un client donné**, comment Snowflake l'aide à tenir **un objectif business
chiffré**. Livrable : `dist/film.html` (une page HTML autonome, ~2,3 Mo, logos et polices embarqués).

Ce skill est le fruit d'un projet complet mené de bout en bout (reprise d'un film existant, revue
CEO notée 4,5/10, refonte complète, puis 6 tours de feedback utilisateur). Toutes les leçons sont
consignées dans les sous-skills. **Lis ce fichier en entier, puis le sous-skill de l'étape en cours.**

## Vocabulaire (anonymisé)

| Terme | Sens |
| --- | --- |
| **le client** | l'entreprise pour qui on fait le film (ex. un réseau d'agences, de magasins, de sites) |
| **le site héros** | l'entité du réseau qui porte l'histoire (une agence, un magasin, une usine) |
| **le personnage** | la personne qui porte l'objectif (directeur du site héros) |
| **les sources** | les 2 à 4 logiciels métier du client (source A, B, C) — vraies marques, vrais logos |
| **la douleur** | ce qui casse aujourd'hui (typiquement : exports Excel, ressaisies, chiffres contradictoires) |
| **l'objectif** | la promesse chiffrée (ex. « X M€ de chiffre d'affaires d'ici <échéance> ») |
| **la couche** | la nappe Snowflake lumineuse qui flotte au-dessus du monde et où convergent les flux |
| **le gabarit** | `film-template/` (dans ce skill) : moteur complet et neutre (carte d'un pays fictif, open space, couche Snowflake, 14 chapitres, Client / Source A-B-C fictifs). Voir `film-template/README.md` |

## Règles non négociables (apprises à la dure)

1. **Valeur business pour un codir, jamais de features techniques.** Pas de « Iceberg », « Snowpark »,
   « Cortex Search », « Horizon », « RBAC », « zero-copy ». On dit : « une seule vérité », « qui voit quoi »,
   « le bon chiffre au bon moment », « l'agent propose, vous décidez ».
2. **Seulement les sources réelles du client.** Pas de logiciels décoratifs hérités du gabarit ou d'un film précédent.
   La douleur (Excel) est montrée comme une source à part, sans logo de marque.
3. **Pas de data sharing, pas de Marketplace, pas de multi-cloud** sauf si le client en a réellement
   besoin et l'a demandé. Retirer AWS/Azure/GCP et « On any cloud ».
4. **Le monde ressemble au métier du client.** Un réseau d'agences de services = carte du pays + open space,
   **pas** d'usine, de camions, de port ou de cuves. Tout reliquat du gabarit ou d'un autre secteur est rejeté
   (`tools/residue.py`).
5. **Les flux convergent visiblement vers Snowflake** (la couche + le logo Snowflake).
6. **Logos grands et lisibles**, tailles en `em` (jamais en `vw`), contenus dans leur composant.
7. **Tout le film dans la langue du codir** (ici le français), titre de page compris, accents corrects
   (`<meta charset="utf-8">` en tête du corps).
8. **Les chiffres affichés sont cohérents de bout en bout** (objectif, trajectoire, écart, leviers qui
   comblent l'écart) et signalés « ordres de grandeur illustratifs » sur l'écran d'impact.
9. **Anonymat dans les livrables réutilisables** : ce skill ne cite jamais un client réel.
10. **Voix off continue et complète** : ~16 car/s par fenêtre, aucune fin de phrase coupée (contrôle Whisper), voix du genre demandé.
11. **Rien ne sort sans la check-list de diffusion** (`templates/checklist-diffusion.md`) : droits sur les
    logos et la voix, chiffres simulés signalés, validation du client avant toute diffusion externe.

## Workflow (sous-skills)

| Étape | Sous-skill | Sortie | Validation utilisateur |
| --- | --- | --- | --- |
| 1 | `01-cadrage/SKILL.md` | fiche client (`templates/fiche-client.md` remplie) | **oui, bloquant** |
| 2 | `02-scenario/SKILL.md` | script des 14 chapitres, texte exact à l'écran | **oui, bloquant** |
| 3 | `03-monde-3d/SKILL.md` | monde 3D reconstruit (carte, bureau, couche, story) | non, montrer des images |
| 4 | `04-habillage-logos/SKILL.md` | titres, étiquettes, écrans, logos intégrés | non |
| 5 | `05-build-verification/SKILL.md` | `dist/film.html` + planches-contact vérifiées | non |
| 6 | `06-revue-ceo/SKILL.md` | revue brutale du « CEO du client » (note /10 + top 10) | **oui** : quels correctifs appliquer |
| 7 | `07-boucle-feedback/SKILL.md` | corrections, rebuild, ouverture navigateur | à chaque tour |
| 8 | `05-build-verification` §5 puis `08-voix-off/SKILL.md` | MP4 1080p + voix off FR vérifiée | **oui** : écoute |
| 9 | `templates/checklist-diffusion.md` | check-list cochée, partage restreint | **oui, bloquant** avant envoi |

Repère qualité : `reference/planche-gabarit.jpg` (12 images du gabarit à 1280 × 720). Un film client
doit être au moins à ce niveau de lisibilité (titres, logos, étiquettes sans chevauchement).

Ordre impératif : **contenu (`src/content.js`) d'abord, puis géométrie si le secteur l'exige, puis
story.js, puis habillage, puis timeline**. Dans l'autre sens on chasse des erreurs de clés fantômes.

**Où on change quoi** : tous les textes, noms, chiffres et villes affichés sont dans **un seul fichier,
`src/content.js`** (variables de base en tête : client, site héros, personnage, sources, objectif,
leviers). Pour un client du même type (réseau de sites), on ne touche que ce fichier et les logos de
`assets/`. Le code (`src/world`, `src/ui`, `src/film`) n'est à modifier que pour changer la carte, le
lieu du site héros ou le déroulé.

## Démarrage rapide

```bash
# 1. copier le gabarit dans un dossier projet (jamais travailler dans le skill lui-même)
SKILL_DIR=~/.snowflake/cortex/skills/customer-3d-film      # WORK_DIR : dossier de travail, à demander à l'utilisateur
cp -R "$SKILL_DIR/film-template" "$WORK_DIR/<projet>-film" && cd "$WORK_DIR/<projet>-film" && npm ci
tar czf ../<projet>-film-backup-$(date +%Y%m%d-%H%M).tgz --exclude node_modules .   # sauvegarde AVANT toute modif
npx playwright install chromium                     # navigateur des outils de vérification / export MP4
# 2. lire film-template/README.md, puis remplir src/content.js (contenu client) et assets/ (logos)
# 3. build + serveur + navigateur
npm run build && (nohup npm run serve >/dev/null 2>&1 &) && open http://localhost:8765/index.html
```

Une seule URL partout : **`http://localhost:8765/index.html`** (page locale complète). `dist/film.html`
est le même film sans squelette `<html>` : c'est le fichier à publier sur un hébergeur qui ajoute son
propre squelette (artefact). Pour un envoi par mail ou Drive, envoyer `index.html` ou le MP4.

## Architecture à connaître (résumé, détail dans `film-template/README.md`)

- `src/content.js` : **tout le texte visible** (titres, étiquettes, écrans, chiffres, villes, sources, chapitres).
- `src/main.js` : moteur → monde → état → UI → timeline → boucle ; warm-up (liste d'instants) ; API test `window.__film.seek(t, frames)`.
- `src/film/state.js` : un objet d'état unique `S` (cam, rig, post, vis, layer…).
- `src/film/timeline.js` : `T` (débuts de scènes), `DURATION`, `ACTS` (chapitres), aides `head/show/hide/cam/plugIn/pulse…`.
- `src/world/*` : `<pays>.js` (carte + sites), `office.js` (open space du site héros), `layer.js` (couche Snowflake, `ZONES`), `story.js` (ancres : `conn_<id>`, `n_<id>`…), `lighting.js`, `room.js`, `index.js`.
- `src/ui/*` : mise en forme (lit `content.js`) : `hud.js` (titres, fenêtres Snowflake, matrice « qui voit quoi », tuiles d'impact), `labels.js` (étiquettes 3D, plaques des sources), `apps.js` (écrans des appareils), `controls.js` (affiche + lecteur), `dom.js` (`LOGO`).
- `tools/` : vérification (captures, chevauchements, relecture des textes, lecture réelle) et export MP4 ; `tools/browser.mjs` trouve le navigateur tout seul.
- `src/styles.css` : tout l'habillage. **Dans `#ui`, 1 em = 1 % de la largeur de la scène.**
- `build.mjs` : bundle esbuild → `dist/film.html` (corps seul) + `dist/index.html` (squelette local).

## Temps et effort

Client du même type que le gabarit (réseau de sites) : surtout `content.js` + logos + vérification.
Autre secteur : l'essentiel du travail est le monde 3D + `story.js` (~50 %), puis la vérification
image par image (~30 %).
Les sous-agents peuvent échouer en route (VPN, « internal error ») après avoir modifié des fichiers :
toujours **évaluer l'état réel** (build + captures) avant de relancer quoi que ce soit.
