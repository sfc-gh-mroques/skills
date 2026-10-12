# 02 — Scénario : 14 chapitres, ~162 s

Le gabarit déroule **14 chapitres, 162 s** : la durée qu'un codir regarde jusqu'au bout. On garde ce
format et on retire tout ce qui est technique ou hors sujet (data sharing, Marketplace, multi-cloud, « open
formats »). Arc narratif : **question → chaos → connexion → vérité unique → confiance → intelligence
métier → action → impact → réponse**.

## Structure validée

| # | Chapitre (`ACTS`) | Lieu / caméra | Message à l'écran (modèle) | Ce que ça prouve au codir |
| --- | --- | --- | --- | --- |
| 1 | L'objectif | open space du site héros, écran d'une source | « Site X · Directeur <Nom> » / « Objectif : <montant>. Échéance : <mois>. » | l'enjeu est chiffré et humain |
| 2 | Données éclatées | carte, vue large | « Peut-on tenir l'objectif ? » puis « Un réseau. Des données éclatées. » | les sources vivent en silos, Excel fait le lien |
| 3 | Connecter | carte → plaques des sources | « Connecter toutes vos données. » ; pastille Snowflake qui se branche sur chaque plaque, puce « connecté » | rien à remplacer, on branche l'existant |
| 4 | Fiche client unique | fenêtre Snowflake claire | « Une fiche client unique » ; enregistrements qui volent des sources vers la fiche | une seule vérité |
| 5 | Un seul réseau | carte entière, la couche couvre le pays | « <N> sites. Une seule plateforme. » | ça passe à l'échelle du réseau |
| 6 | Sécuriser | matrice « Qui voit quoi » | rôles × données (✓ / masqué) | la direction voit tout, chaque site voit le sien |
| 7 | Comprendre | chaîne des données métier | du brut au chiffre fiable | le chiffre a une origine |
| 8 | Le métier | panneaux métier | charge des équipes, benchmark entre sites | des décisions, pas des tableaux |
| 9 | <Obligation / levier sectoriel> | panneau | ex. une nouvelle obligation réglementaire : « avancement / cible » | un sujet d'actualité du client |
| 10 | Tous les usages | les appareils du bureau s'allument | même chiffre sur ordinateur, tablette, téléphone | tout le monde voit la même chose |
| 11 | Tableau de bord | écran BI | « Projection : P · Objectif : X » | l'écart est visible tôt |
| 12 | Agent IA | écran agent | l'agent propose 3 leviers (a + b + c = E), le directeur valide, réécriture dans les sources | l'IA propose, l'humain décide, l'action revient dans les outils |
| 13 | Impact | tuiles | 3–4 tuiles + « Ordres de grandeur illustratifs » | ce que ça rapporte |
| 14 | Objectif atteignable | retour bureau / carte, titre de fin | « Le client × Snowflake — <promesse> » | la réponse à la question d'ouverture |

## Règles d'écriture

- **Phrases courtes** (≤ 8 mots pour un titre), verbes d'action, pas de jargon.
- **Un chiffre par écran**, toujours cohérent avec la fiche (vérifier la somme des leviers = écart).
- Les noms de chapitres (`ACTS`) sont courts (1–3 mots) : ils s'affichent sur la piste du lecteur.
- Titres : sans classe = bas gauche (opérationnel) ; `center` = stratégique ; `mid` = haut gauche
  (promesse, scènes 1 et 14).
- L'affiche (`ui/controls.js`) reprend la question d'ouverture et le nom du film ; elle **doit
  disparaître** après le clic lecture (voir 07, bug `[hidden]`).
- Le `<title>` de la page (dans `build.mjs`) : « <Client> — <promesse courte> ».

## Livrable

Un tableau « chapitre → t début → titre exact → sous-titre → étiquettes → écran » présenté à
l'utilisateur, **validé avant le build**. Puis reporter les débuts de scènes dans `T`
(`film/timeline.js`), `DURATION = 162`, `ACTS`, et la liste de warm-up de `main.js` (un instant par
aspect visuel : `[2.6, 9, 12, 18, 24, 30, …, 160]`).
