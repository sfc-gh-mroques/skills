# Gabarit neutre — film 3D client (Three.js + GSAP)

Moteur complet et fonctionnel d'un film web 3D de ~2:42 (14 chapitres) qui raconte comment Snowflake aide
**un client fictif** à tenir **un objectif chiffré**. Tout le contenu est volontairement générique :
« Client », « Source A/B/C », villes et personnes fictives, pays imaginaire, logos factices générés.
On l'adapte à un vrai client en suivant le skill `customer-3d-film` (dossier parent).

```bash
cp -R film-template "$WORK_DIR/<projet>-film" && cd "$WORK_DIR/<projet>-film"
npm ci && npx playwright install chromium   # dépendances + navigateur des outils
npm run build                               # → dist/index.html (page complète) + dist/film.html (corps seul, publication)
npm run serve                               # puis ouvrir http://localhost:8765/index.html
```

## Ce qu'il faut remplacer (dans cet ordre)

| Quoi | Où |
| --- | --- |
| **Tous les textes, noms, chiffres, villes, chapitres** (titres, étiquettes, écrans, « qui voit quoi », impact, titre de page) | **`src/content.js`** — commencer par les variables de base en tête du fichier |
| Logos du client, des sources, de l'outil BI | `src/assets/*.png` (mêmes noms) + imports dans `src/ui/dom.js` (`LOGO`) |
| Contour du pays, île, autres sites | `src/world/country.js` (`OUTLINE`, `ISLAND`, `OTHERS`) — les villes nommées sont dans `content.js` |
| Zones de la couche Snowflake (région, capitale, pays) | `src/world/layer.js` (`ZONES`) + `zone(...)` dans `src/film/timeline.js` |
| Open space du site héros (géométrie) | `src/world/office.js` |
| Ancres de l'histoire (connexions, nœuds) | `src/world/story.js` (la ville de chaque source : `content.js > sources.<id>.city`) |
| Durées des chapitres, caméra, apparitions | `src/film/timeline.js` (`T`, `DURATION`) |
| Habillage (1 em = 1 % de la largeur de la scène dans `#ui`) | `src/styles.css` |

Pour un client du même type (réseau de sites, agences, magasins), `content.js` et les logos suffisent.
`src/ui/*` (mise en forme) et `src/film/timeline.js` ne contiennent plus aucun texte affiché.

Chiffres fictifs, cohérents de bout en bout : objectif 2,40 M€, projection 2,15 M€, écart 250 K€ = 160 + 55 + 35 K€.
Les garder cohérents quand on les change (objectif − projection = somme des leviers de l'agent).

## Outils

Tous les outils Playwright passent par `tools/browser.mjs` : navigateur trouvé automatiquement (Chromium de
Playwright quelle que soit sa version, sinon Chrome installé), GPU Metal sur Mac, rendu logiciel ailleurs.
Options communes : `--url` (ou `FILM_URL`, défaut `http://localhost:8765/index.html`), `--chrome <chemin>`
(ou `CHROME`), `--gpu metal|swiftshader`.

| Outil | Usage |
| --- | --- |
| `tools/capture.mjs` | captures à des instants donnés (`--times "6,20,35" --out /tmp/x [--play]`) |
| `tools/montage.py` | planche-contact : `python3 tools/montage.py /tmp/x 4 3 640` |
| `tools/overlap.mjs "t1,t2"` | chevauchements (`OVER`) et débordements (`CLIP`) d'étiquettes et de titres |
| `tools/copy.mjs "t1,t2" --short` | relecture de tout le texte visible à ces instants |
| `tools/play.mjs`, `tools/final.mjs` | lecture réelle, affiche sur téléphone, fin et relecture ; erreurs console |
| `tools/times.mjs`, `tools/resize.mjs`, `tools/look.mjs` | captures simples, après redimensionnement, essais de réglages |
| `tools/render-mp4.mjs` | export MP4 1080p30 image par image (Playwright → ffmpeg) ; Mac : ≈ 5 min |
| `tools/voiceover.py` | voix off calée sur les chapitres (`say` ou WAV Chatterbox), mixée sur le MP4 |
| `tools/residue.py` + `tools/reference_words.txt` | mots du gabarit restés dans `dist/film.html` (liste pré-remplie) |
| `logo-tools/slice_logo_sheet.py` | découper une planche de logos (`boxes.example.json`) |

## Dépendances

Three.js 0.186 (WebGPU / TSL, repli WebGL), GSAP 3.15, esbuild, Playwright (outils), polices @fontsource
(embarquées au build). Export MP4 : `ffmpeg`.
