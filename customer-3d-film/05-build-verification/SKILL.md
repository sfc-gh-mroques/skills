# 05 — Build, serveur, captures et vérification

## 1. Build

```bash
cd "$WORK_DIR/<projet>-film"
npm run build          # → dist/film.html (corps seul, à publier) + dist/index.html (squelette local)
node build.mjs --dev   # non minifié, pour déboguer ; relancer npm run build avant de livrer
```

`build.mjs` — points à vérifier :
- le corps commence par `<meta charset="utf-8">` (sinon accents cassés dans le titre :
  « rÃ©seau ») ;
- `<title>` = « <Client> — <promesse> » ;
- garder `lineLimit: 400` : il coupe le JS minifié en lignes courtes. Sans lui, certains hébergeurs
  d'artefacts HTML (contrôle à la publication) prennent une très longue ligne sans espace contenant
  `id=` pour un attribut HTML malformé et refusent la page. Inutile pour un envoi en fichier ou en MP4,
  mais sans coût : ne pas le retirer ;
- le squelette local contient `[hidden]{display:none!important}`.

## 2. Serveur et navigateur

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:8765/index.html || true  # déjà lancé ?
nohup npm run serve >/dev/null 2>&1 &         # = python3 -m http.server 8765 --directory dist
open http://localhost:8765/index.html         # navigateur externe de l'utilisateur
```

- Après chaque rebuild : dire à l'utilisateur de faire **Cmd+Shift+R** (cache).
- Une seule URL de travail : `http://localhost:8765/index.html` (tous les outils l'utilisent par défaut ;
  autre adresse : `--url` ou `FILM_URL`). `film.html` = même film sans squelette, réservé à la publication.
- Si « Ce navigateur ne peut pas lancer le film 3D » : ajouter `#webgl` à l'URL ; sinon console.
- Arrêter le serveur proprement : `pgrep -f "^python3 -m http.server" | xargs -r kill`
  (jamais `pkill -f`, qui tue le shell courant).

## 3. Captures (Playwright)

Tous les outils de `tools/` passent par `tools/browser.mjs`, qui **trouve le navigateur tout seul**
(Chromium de Playwright quelle que soit sa version, sinon Chrome installé) et choisit le GPU : Metal
sur Mac, rendu logiciel ailleurs. Forcer au besoin : `--chrome <chemin>` (ou `CHROME=`), `--gpu
metal|swiftshader`. Playwright doit être installé **dans le projet** (ESM ignore `NODE_PATH`) — déjà
déclaré dans `package.json` : `npm ci && npx playwright install chromium` suffit.

```bash
node tools/capture.mjs --times "8,14,20,26,32,60" --out /tmp/<projet>_review/v1 [--play]
python3 tools/montage.py /tmp/<projet>_review/v1 3 3 640
```

| Outil | Rôle |
| --- | --- |
| `capture.mjs` | captures à des instants (`--times`), `--play` clique d'abord sur Lecture |
| `overlap.mjs "t1,t2"` | liste les chevauchements (`OVER`) et débordements (`CLIP`) d'étiquettes et de titres |
| `copy.mjs "t1,t2" --short` | relecture : tout le texte lisible à l'écran à ces instants |
| `play.mjs` | lecture réelle (affiche → lecture → pause → touches), erreurs console |
| `final.mjs` | affiche sur téléphone, fin de film, relecture depuis la fin |
| `times.mjs`, `resize.mjs`, `look.mjs` | captures simples, après redimensionnement, essais de réglages en direct |
| `residue.py` | mots du gabarit restés dans la page |
| `render-mp4.mjs` | export MP4 (§5) |

- `--play` clique d'abord `#film-play` : indispensable pour vérifier que l'**affiche disparaît**.
- Durée : ~1 s par image avec le GPU Metal (Mac), 10–40 s en rendu logiciel (`swiftshader`, machine sans
  GPU). En rendu logiciel, lancer les séries longues en arrière-plan (`nohup … &`), deux au plus en parallèle.
- Revue complète : une image toutes les 6 s sur 162 s (27 images, 3 planches 3×3).
- Fin du film : 158, 160.5, 161.8 s.
- Toujours **regarder les images** (outil `read` sur les PNG) — ne jamais déclarer « corrigé » sans
  avoir vu la zone concernée. Faire des recadrages sur la zone du bug si nécessaire (PIL `crop`).

## 4. Checklist de vérification (par planche)

- [ ] Aucune erreur `pageerror` / console.
- [ ] L'affiche (question + « Préparation du film ») disparaît après lecture.
- [ ] Ouverture : bureau clair, nom du site et du personnage, objectif chiffré.
- [ ] Carte : contour net, villes lisibles, **pas** de chevauchement d'étiquettes (`overlap.mjs` sans `OVER`/`CLIP`
  — vérifier à l'image : un `OVER` entre un titre et une fenêtre peut être un faux positif), aucun camion/usine.
- [ ] Logos des sources grands, dans leur plaque ; flocon centré dans sa pastille.
- [ ] Flux qui montent vers la couche et convergent vers Snowflake.
- [ ] Textes 100 % dans la langue cible, accents corrects (titre d'onglet compris).
- [ ] Chiffres cohérents d'une scène à l'autre ; somme des leviers = écart.
- [ ] Appareils allumés dès le début de « Tous les usages ».
- [ ] Fin : titre de fin + promesse ; relecture possible.
- [ ] `python3 tools/residue.py` : aucun mot du gabarit (liste pré-remplie).
- [ ] Rendu WebGL **et** WebGPU si possible.
- [ ] Comparer à `reference/planche-gabarit.jpg` : même niveau de lisibilité.
- [ ] Check-list de diffusion (`templates/checklist-diffusion.md`) avant tout envoi.

## 5. Export MP4 automatique (pour partager)

Le HTML dépend du GPU et du navigateur du spectateur : pour un codir, livrer un **MP4**.
`tools/render-mp4.mjs` rend le film image par image (`__film.seek(t)` → capture JPEG → ffmpeg
stdin, x264 CRF 18, fondu, 1,5 s de noir avant/après, barre de lecture et affiche masquées).

```bash
node tools/render-mp4.mjs --from 60 --to 62 --out /tmp/test.mp4   # test de 2 s d'abord
node tools/render-mp4.mjs --out dist/<client>-film.mp4             # 1080p30, Mac (Metal) : ~5 min pour 162 s
# options : --fps 60 --w 3840 --h 2160 --from 30 --to 32 (test) --gpu swiftshader --chrome <chemin>
```

- Navigateur et GPU détectés automatiquement (`tools/browser.mjs`) : Metal sur Mac ≈ 0,1 s/image ; sans GPU
  (`swiftshader`) 10–40 s/image, soit plusieurs heures pour 162 s → faire l'export sur un Mac. `ffmpeg`
  doit être installé (`brew install ffmpeg`).
- Toujours un test de 2 s d'abord, puis extraire quelques images du MP4 (`ffmpeg -ss t -frames:v 1`)
  et faire une planche-contact.
- Partage : Google Drive restreint aux adresses du client (Sites : Insérer → Drive). ~100 Mo pour 165 s.

## 6–7. Voix off

Tout est dans **`08-voix-off/SKILL.md`** (texte via Glean, densité ~16 car/s, choix de voix par F0,
Chatterbox, mixage sans couper les fins de phrase, contrôle Whisper).
