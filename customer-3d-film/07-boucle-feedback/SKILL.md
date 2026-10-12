# 07 — Boucle de feedback utilisateur

Chaque tour : **comprendre la zone exacte → trouver la vraie cause → corriger → rebuild → vérifier
visuellement → ouvrir dans le navigateur → répondre en 2–3 phrases** (+ « Cmd+Shift+R »).

Si l'utilisateur répète un retour (« toujours mal positionnés »), c'est que la première correction
visait la mauvaise cause ou le mauvais élément : **demander/regarder la capture d'écran**, recadrer
la zone, et chercher toutes les règles CSS qui s'appliquent à l'élément (spécificité, héritage).

## Catalogue des retours déjà rencontrés

| Retour utilisateur | Vraie cause | Correction |
| --- | --- | --- |
| « Ouvre le HTML dans le navigateur externe » | — | `npm run serve` + `open http://localhost:8765/index.html` |
| « Les logos sont mal embeddés dans leur composant » | tailles en `vw` (suivent la fenêtre, pas la scène) | passer en `em`, `max-width` + `object-fit: contain` (04) |
| « Le fond "Peut-on tenir l'objectif / Préparation du film" reste tout le long » | `.poster { display: grid }` écrase l'attribut `hidden` | `#ui [hidden] { display: none !important; }` avant `.poster` |
| « Les logos Snowflake dans les disques sont mal positionnés » (1) | PNG du flocon décentré dans son canevas | `scripts/square_logo.py` (rogner alpha + recentrer dans un carré) |
| « … toujours mal positionnés » + capture | `.sys .plate img { height: 2.1em }` s'applique aussi au flocon de `.plug` → déborde du disque | règle plus spécifique `.sys .plate .plug img, .plug img { height:1em; width:1em; max-width:none }` |
| « Problèmes d'accents dans le titre de la vidéo » | pas de charset dans `film.html` (corps seul) | `<meta charset="utf-8">` en tête du corps dans `build.mjs` |
| Étiquettes de villes qui se chevauchent (siège + villes voisines) | villes trop proches | décaler (`dx`, `side`, tige) ou ne pas nommer |
| Écrans noirs ~1 s au début de « Tous les usages » | allumage décalé dans la timeline | avancer l'allumage au début de la scène |
| Texte de la matrice « Qui voit quoi » trop petit | tailles héritées | augmenter la police de la matrice |

## Règles de réponse

- Réponse courte, en français, sans jargon : ce qui a été corrigé, pourquoi ça arrivait (une phrase),
  ce qu'il faut faire (recharger avec Cmd+Shift+R).
- Dire honnêtement si la correction n'a pas été vérifiée visuellement.
- Proposer au plus 1–2 améliorations restantes connues, sans les appliquer sans accord.
