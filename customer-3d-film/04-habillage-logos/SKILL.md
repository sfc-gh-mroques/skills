# 04 — Habillage, textes et logos

## 1. Où sont les textes

**Tous les textes visibles sont dans `src/content.js`** — le seul fichier à éditer pour le contenu.
Le code de `ui/` ne fait que la mise en forme et lit `content.js`.

| Partie de `content.js` | Ce qu'elle pilote |
| --- | --- |
| variables de base en tête (`CLIENT`, `SITE`, `HERO_CITY`, `DIRECTOR`, `A`/`B`/`Cc`, `OBJ`/`PROJ`/`GAP`, `L1`–`L3`, `KPI`…) | réutilisées dans tout le fichier : les changer d'abord |
| `meta`, `acts` | titre de la page, affiche, lecteur, message d'erreur, noms des 14 chapitres |
| `cities`, `cityTags`, `beatCities` | villes nommées (lon/lat), étiquettes (tige, décalage, visibles sur la vue d'ensemble), villes citées au chapitre « Le métier » |
| `sources` | nom, ville d'ancrage (`city`), légendes sur la carte et au bureau, message après action, titres des écrans du bureau |
| `record`, `chain`, `risks`, `options`, `regTag` | fiche unique, chaîne métier, constats et propositions de l'agent sur la carte |
| `headlines`, `director`, `steps`, `endLine` | les titres de chaque moment (html : `<br>`, `<em>`) |
| `chip`, `gov`, `share`, `trust`, `beats`, `reg`, `impact` | pastille objectif, « qui voit quoi », bandeau réseau, fenêtre fiche unique, cartes métier, levier sectoriel, impact |
| `office`, `monitor`, `bi`, `snowUI`, `ops`, `assistant`, `agent` | textes peints dans l'open space et écrans des appareils |

Garder les clés, ne changer que les valeurs. Cohérence obligatoire : objectif − projeté = écart =
`L1 + L2 + L3`, et le nombre de sites = villes nommées + `OTHERS` (`world/country.js`).

Retirer tout reliquat du gabarit ou d'un autre secteur (noms de villes fictives, « Dupont Industries »,
libellés de cabinet comptable si le client n'en est pas un) : `python3 tools/residue.py` (la liste
`tools/reference_words.txt` est pré-remplie avec les noms fictifs du gabarit : elle doit finir vide de résultats), puis
`grep -rniE "marketplace|aws|azure|gcp|on any cloud" src/`.
Les noms de variables internes (`buildSalesforce`, `buildOpenAI`, `delivery`) sont inoffensifs : ils ne s'affichent pas.

## 2. Logos : la checklist (chaque point a causé un retour utilisateur)

1. **Récupérer les vrais logos** (PNG haute déf. ou SVG → PNG). Détourer et **recadrer** :
   `python3 scripts/crop_logo.py in.png out.png` (rogne au contenu, transparent). Garder deux
   variantes si besoin : sur fond clair (`_dark`) et sur fond sombre.
2. **Logos carrés (ex. le flocon Snowflake)** : rogner à la boîte alpha **puis recentrer dans un
   carré** — `python3 scripts/square_logo.py in.png out.png 128`. Un PNG décentré rend le logo
   décalé dans sa pastille, quoi que fasse le CSS.
3. Déclarer dans `ui/dom.js` : `export const LOGO = { snowflake, snowflakeBlue, snowflakeWhite, client, srcA, srcB, srcC }`.
4. **Tailles en `em`, jamais en `vw`** (dans `#ui`, 1 em = 1 % de la largeur de scène ; le `vw` suit
   la fenêtre, pas la scène, et déborde en plein écran/petite fenêtre).
5. **Contenir le logo dans son composant** : `width:auto; max-width; object-fit: contain; display:block`.
6. **Attention à la spécificité CSS** : une règle générique (`.sys .plate img`) s'applique aussi aux
   images imbriquées (le flocon dans la pastille `.plug`). Toujours écrire une règle plus spécifique
   pour l'image imbriquée.
7. « Logos grands » = le codir doit lire la marque depuis le fond de la salle.

Valeurs validées :

```css
/* plaques des sources sur la carte */
.sys .plate { min-height: 3.0em; padding: 0.4em 0.8em; }
.sys .plate img { height: 2.1em; width: auto; max-width: 9em; display: block; object-fit: contain; }
.sys .plate img.lg-srcA { height: 2.1em; }  /* ajuster par logo selon son ratio */
/* pastille Snowflake qui se « branche » au-dessus d'une plaque */
.plug { position: absolute; left: 50%; top: -1.08em; width: 1.5em; height: 1.5em; margin-left: -0.75em;
        border-radius: 50%; background: #fff; display: grid; place-items: center; transform: scale(var(--plug, 0)); }
.sys .plate .plug img, .plug img { height: 1em; width: 1em; max-width: none; object-fit: contain; display: block; }
/* cartes de sources dans les fenêtres */
.tr-s img { height: auto; width: auto; max-height: 68%; max-width: 80%; display: block; object-fit: contain; }
/* en-têtes des tuiles */
.ei-h img { height: 1.6em; max-width: 8em; object-fit: contain; }
```

Sans logo fourni : plaque texte générique (« Paie », « Temps »), jamais une marque inventée.

## 3. Lisibilité

- Petits libellés en capitales : pas sous 8 px sur une scène de 1280 px. La matrice « Qui voit quoi »
  a tendance à être trop petite : la grossir.
- Passer `node tools/overlap.mjs "t1,t2"` après chaque changement de caméra/texte (chevauchements
  `OVER`, débordements `CLIP`).
- Les appareils de la scène « Tous les usages » doivent être **allumés dès la première image** de la
  scène (sinon ~1 s d'écrans noirs).
