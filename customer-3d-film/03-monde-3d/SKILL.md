# 03 — Monde 3D : remplacer l'usine par le monde du client

Le gabarit `film-template/` contient déjà le bon monde pour un **réseau de sites** : une carte de pays
(fictif) avec siège, site héros et ~60 sites, l'open space du site héros et la couche Snowflake.
Pour un autre métier, on **reconstruit** le monde plutôt que de superposer des étiquettes (rejeté d'emblée).

## 1. Ce qu'on remplace / garde

| Action | Fichiers `src/world/` |
| --- | --- |
| **Remplacer** | `country.js` : contour réel du pays (`OUTLINE`, lon/lat), île éventuelle, `OTHERS` (autres sites). Les villes nommées (`cities`) sont dans `src/content.js` |
| **Adapter** | `office.js` (intérieur du site héros), `layer.js` (`ZONES`), `lighting.js` (ambiances), `room.js` (bureau aux appareils), `story.js` (**réécrire** les ancres), `index.js` (assemblage) |
| **Garder tel quel** | `core/*` (moteur, kit `Builder/G/M/V/rng`, matériaux, textures) |

Si le métier n'est pas un réseau de bureaux (usine, logistique…), remplacer `office.js` par le lieu
du métier, retirer ses imports et crochets dans `index.js`, `state.js`, `main.js`.

## 2. La carte (`country.js`)

```js
// lon/lat → coordonnées de table (x est, z sud), équirectangulaire autour de 46,6° N
export const geo = (lon, lat) => [(lon - 2.4) * 15.14, (46.6 - lat) * 22];
export const MAP_TOP = 0.6;
const OUTLINE = [[2.55, 51.08], /* … contour simplifié, sens horaire */];
export const CITIES = K.cities;   // défini dans src/content.js :
// cities: { hq: { name, role: 'Siège <client>', ll: [lon, lat], hq: true },
//           hero: { name, role: '<Site héros>', ll: [lon, lat], hero: true },
//           city3 … city9: { name, ll } }      // 6 à 8 villes nommées
const OTHERS = [/* les autres sites (lon, lat), denses dans la région du client */];
```

- Plateau extrudé du contour, sites = petits bâtiments de bureau + épingles, siège et site héros
  distingués (taille, couleur, anneau).
- **Pas de routes de camions, pas d'usines, pas de port.** Des voitures ou des parcs à la rigueur.
- Les clés `hq` et `hero` sont obligatoires (anneaux, caméra). Les autres clés (`city3`…`city9`) sont
  libres mais référencées dans `content.js` : `cityTags`, `beatCities`, `sources.<id>.city`. Renommer une
  clé = la renommer partout dans `content.js` (le build ne le signale pas : la page ne démarre pas ou une
  étiquette manque ; contrôler avec `node tools/play.mjs` → « console: clean »).
- Étiquettes de villes proches (ex. siège + deux villes voisines) **se chevauchent** : dans
  `content.js > cityTags`, décaler (`dx`, longueur de tige) ou masquer sur la vue d'ensemble
  (4ᵉ valeur `false`), puis `node tools/overlap.mjs "20,26,30"`.

## 3. Le site héros (`office.js`)

Open space clair et moderne : îlots de bureaux, écrans, salle de réunion vitrée, plantes.
**Chaque source a un poste/écran visible** : son point devient une ancre (`O.screens.<source>.p`)
utilisée par le passage caméra intérieur et le branchement. Un plateau de bureaux identiques ne
donne rien à filmer : varier les zones de gauche à droite dans l'ordre du processus métier.

## 4. La couche Snowflake (`layer.js`) et `story.js`

- `ZONES` : une zone par région/réseau (pas de tags cloud `aws/azure/gcloud`).
- `story.js` : pour chaque source, une entrée `sys` → crée `P[id]`, la ligne `conn_<id>` qui monte
  vers la couche et le nœud `n_<id>`. La ville d'ancrage se choisit dans `content.js` (`sources.<id>.city`) :

```js
const sys = {
  srcA:  { p: C[K.sources.srcA.city].clone().add(V(0, 0.4, 0)), kind: 'app' },
  srcB:  { p: C[K.sources.srcB.city].clone().add(V(0, 0.4, 0)), kind: 'app' },
  srcC:  { p: C[K.sources.srcC.city].clone().add(V(0, 0.4, 0)), kind: 'app' },
  excel: { p: C[K.sources.excel.city].clone().add(V(0, 0.4, 0)), kind: 'file' },   // la douleur
  in_srcA: { p: O.screens.srcA.p.clone().add(V(0, 0.24, 0)), kind: 'app' }, // version bureau
  // …
};
```

- **Garder les noms de clés que la timeline lit** (`conn_*`, `n_*`, `c_*`, `zone_*`…) ou les
  changer aux deux endroits. Une clé inconnue lève une erreur au chargement : c'est voulu.
- Après suppression de scènes (data sharing, Marketplace), chercher dans `timeline.js` toute clé
  lue mais plus créée (`hud.psBody`, `hud.prodTabs`, étiquettes de scènes supprimées, systèmes de
  write-back).

## 5. Caméras

Trois familles : carte (titre bas gauche), logiciels/plaques en gros plan, cœur régional du réseau.
Une caméra par chapitre, vérifiée avec `tools/cams.py` (où tombe un point à l'écran) avant de rendre.

## Contrôle de sortie

`npm run build` passe, aucune erreur console, et une planche-contact (05) montre : bureau clair à
l'ouverture, carte lisible, aucune trace d'usine/camion/port.
